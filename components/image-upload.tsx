"use client";
import {useState, useEffect} from "react";
import Image from "next/image";
import {X} from "lucide-react";
import type {LabelExtraction} from "@/lib/label-extraction-schema";
import {LabelTable} from "./label-table";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {cn} from "@/lib/utils";

interface ProcessingTime {
    duration: number;
    timestamp: string;
    labelName: string;
}

export const ImageUpload = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
		const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
		const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [parsedData, setParsedData] = useState<LabelExtraction | null>(null);
    const [parsedDataByFile, setParsedDataByFile] = useState<
        Array<LabelExtraction | null>
    >([]);
    const [validatingByFile, setValidatingByFile] = useState<boolean[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processingTimes, setProcessingTimes] = useState<ProcessingTime[]>(
        [],
    );
    const allLabelsValidated =
        uploadedFiles.length > 0 &&
        uploadedFiles.every((_, index) => Boolean(parsedDataByFile[index]));

    const addProcessingTime = (startTime: number, labelName: string) => {
        const duration = performance.now() - startTime;
        console.log({duration});
        setProcessingTimes((prev) => [
            ...prev,
            {
                duration,
                timestamp: new Date().toISOString(),
                labelName,
            },
        ]);
    };

    const handleFilesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
				console.log({files});
        if (files && files.length > 0) {
					const filesArray = Array.from(files);
					setUploadedFiles(filesArray);
					setParsedDataByFile(new Array(filesArray.length).fill(null));
                    setValidatingByFile(new Array(filesArray.length).fill(false));
					
					filesArray.map((file) => {
						console.log({file});
					});
					
						const file = files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError(null);
        }
    };

    const validateLabel = async (
        file: File,
        index: number,
        setLoading: boolean = true,
    ) => {
        const startTime = performance.now();
        if (setLoading) {
            setIsLoading(true);
        }
        setValidatingByFile((prev) => {
            const next = [...prev];
            next[index] = true;
            return next;
        });
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/validate-label", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to process image");
                setParsedDataByFile((prev) => {
                    const next = [...prev];
                    next[index] = null;
                    return next;
                });
                return null;
            }
            setParsedDataByFile((prev) => {
                const next = [...prev];
                next[index] = data.parsed;
                return next;
            });
            setParsedData(data.parsed);
            return data.parsed as LabelExtraction;
        } catch (error) {
            setError(
                (error as Error).message || "An unexpected error occurred",
            );
            setParsedDataByFile((prev) => {
                const next = [...prev];
                next[index] = null;
                return next;
            });
            return null;
        } finally {
            if (setLoading) {
                setIsLoading(false);
            }
            setValidatingByFile((prev) => {
                const next = [...prev];
                next[index] = false;
                return next;
            });
            addProcessingTime(startTime, file.name);
        }
    };

    const handleLabelValidate = async () => {
        if (!selectedFile) {
            setError("Please select a label to validate first");
            return;
        }
        await validateLabel(selectedFile, activeFileIndex);
    };

    const handleValidateLabelAtIndex = async (index: number) => {
        const file = uploadedFiles[index];
        if (!file) {
            setError("Please select a label to validate first");
            return;
        }
        setActiveFileIndex(index);
        await validateLabel(file, index);
    };

    const handleRemoveLabelAtIndex = (index: number) => {
        const nextFiles = uploadedFiles.filter((_, i) => i !== index);
        const nextParsed = parsedDataByFile.filter((_, i) => i !== index);
        const nextValidating = validatingByFile.filter((_, i) => i !== index);
        setUploadedFiles(nextFiles);
        setParsedDataByFile(nextParsed);
        setValidatingByFile(nextValidating);
        setError(null);

        if (nextFiles.length === 0) {
            setSelectedFile(null);
            setPreviewUrl(null);
            setParsedData(null);
            setActiveFileIndex(0);
            return;
        }

        const nextActiveIndex =
            index === activeFileIndex
                ? Math.min(index, nextFiles.length - 1)
                : index < activeFileIndex
                  ? activeFileIndex - 1
                  : activeFileIndex;
        setActiveFileIndex(nextActiveIndex);
    };

    const handleValidateAllLabels = async () => {
        if (uploadedFiles.length === 0) {
            setError("Please upload at least one label first");
            return;
        }
        setIsLoading(true);
        setError(null);
        setValidatingByFile(new Array(uploadedFiles.length).fill(true));
        for (let index = 0; index < uploadedFiles.length; index += 1) {
            if (!allLabelsValidated && parsedDataByFile[index]) {
                setValidatingByFile((prev) => {
                    const next = [...prev];
                    next[index] = false;
                    return next;
                });
                continue;
            }
            setActiveFileIndex(index);
            // eslint-disable-next-line no-await-in-loop
            await validateLabel(uploadedFiles[index], index, false);
        }
        setIsLoading(false);
    };

    const getLabelMatchSummary = (data: LabelExtraction | null) => {
        if (!data) {
            return null;
        }
        const entries = Object.entries(data);
        const total = entries.length;
        const matchedFields: string[] = [];
        const reviewFields: string[] = [];
        const issueFields: string[] = [];

        entries.forEach(([key, field]) => {
            if (field.confidence > 0.7) {
                matchedFields.push(key);
            } else if (field.confidence > 0.4) {
                reviewFields.push(key);
            } else {
                issueFields.push(key);
            }
        });

        const matched = matchedFields.length;
        const allMatched = matched === total;
        return {
            matched,
            total,
            allMatched,
            reviewFields,
            issueFields,
        };
    };

		useEffect(() => {
			if (uploadedFiles.length > 0) {
				const file = uploadedFiles[activeFileIndex];
				setSelectedFile(file);
				setPreviewUrl(URL.createObjectURL(file));
				setParsedData(parsedDataByFile[activeFileIndex] ?? null);
				setError(null);
			}
		}, [activeFileIndex, parsedDataByFile, uploadedFiles]);

    return (
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
            {/* Upload Section */}
            <div>
                <div className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                    <h1 className="text-center py-6">
                        Upload a label image to verify required TTB fields.
                    </h1>
                    <label className="cursor-pointer">
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFilesUpload}
														multiple
                        />
                        <div className="flex flex-col items-center gap-2">
                            <svg
                                className="w-8 h-8 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                            <span className="text-sm text-gray-600">
                                Click to upload or drag and drop
                            </span>
                            <span className="text-xs text-gray-500">
                                Supports JPEG & PNG image formats
                            </span>
                        </div>
                    </label>
                </div>
							
								{
									uploadedFiles.length > 1 && (
<div className="mt-3">
                                        <Button
                                            onClick={handleValidateAllLabels}
                                            disabled={isLoading}
                                            variant="secondary"
                                            className={
                                                allLabelsValidated
                                                    ? "bg-blue-100 text-blue-900 hover:bg-blue-200"
                                                    : "bg-emerald-500 text-white hover:bg-emerald-600"
                                            }
                                        >
                                            {allLabelsValidated
                                                ? "Re-validate all labels"
                                                : "Validate all labels"}
                                        </Button>
                                  
										<div className="w-full mt-3 space-y-2">
											{uploadedFiles.map((file, index) => (
                                                (() => {
                                                    const summary = getLabelMatchSummary(
                                                        parsedDataByFile[index] ?? null,
                                                    );
                                                    return (
												<Card
                                                    key={index}
                                                    className={cn(
                                                        "transition-colors cursor-pointer",
                                                        index === activeFileIndex
                                                            ? "border-blue-500 bg-secondary"
                                                            : "hover:bg-muted/60",
                                                    )}
                                                    onClick={() => {
                                                        setActiveFileIndex(index);
                                                        setError(null);
                                                    }}
                                                >
                                                    <CardContent className="flex items-center gap-3 p-3">
													<div className="shrink-0">
														<Image
															src={URL.createObjectURL(file)}
															alt={file.name}
															width={40}
															height={40}
															className="object-contain rounded-md border mr-3"
														/>
													</div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium truncate">
                                                            {file.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {(file.size / 1024).toFixed(2)}{" "}
                                                            KB
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {validatingByFile[
                                                            index
                                                        ] ? (
                                                            <span className="text-xs font-semibold text-slate-500">
                                                                Processing...
                                                            </span>
                                                        ) : summary ? (
                                                            <div
                                                                className={cn(
                                                                    "text-xs font-semibold space-y-1 text-right",
                                                                    summary.allMatched
                                                                        ? "text-emerald-700"
                                                                        : "text-amber-700",
                                                                )}
                                                            >
                                                                <div>{`${summary.matched}/${summary.total}`}</div>
                                                                {!summary.allMatched && (
                                                                    <>
                                                                        {summary.reviewFields.length > 0 && (
                                                                            <div>
                                                                                {`Review: ${summary.reviewFields.join(", ")}`}
                                                                            </div>
                                                                        )}
                                                                        {summary.issueFields.length > 0 && (
                                                                            <div>
                                                                                {`Issues: ${summary.issueFields.join(", ")}`}
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="secondary"
                                                                disabled={isLoading}
                                                                className="bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    void handleValidateLabelAtIndex(
                                                                        index,
                                                                    );
                                                                }}
                                                            >
                                                                Validate
                                                            </Button>
                                                        )}
                                                        {!summary &&
                                                            !validatingByFile[index] && (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                disabled={isLoading}
                                                                className="bg-red-50 text-red-700 hover:bg-red-100"
                                                                onClick={(
                                                                    event,
                                                                ) => {
                                                                    event.stopPropagation();
                                                                    handleRemoveLabelAtIndex(
                                                                        index,
                                                                    );
                                                                }}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    </CardContent>
                                                </Card>
                                                );
                                                })()
											))}
										</div>
										</div>
									)
								}
                
            </div>

            {/* Preview and Results Section */}
            {selectedFile && (
                <div className=" ">
                    {/* Left Column - Image Preview */}
                    <div className="space-y-2">
                        {previewUrl && (
                            <div className="relative w-full aspect-4/3 rounded-lg overflow-hidden border border-gray-200">
                                <Image
                                    src={previewUrl}
                                    alt="Preview"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        )}

                        {/* Action Buttons */}
                        {selectedFile &&
                            !parsedData &&
                            !validatingByFile[activeFileIndex] && (
                            <div className="flex gap-4 justify-center flex-wrap max-w-2xl mx-auto">
                             
                                <div className="w-full flex gap-4 justify-center flex-wrap">
                                    <Button
                                        onClick={handleLabelValidate}
                                        disabled={isLoading}
                                        className="bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                                    >
                                        Validate label
                                    </Button>
                                    
                                </div>
                            </div>
                        )}

                        {/* Processing Times */}
                        {processingTimes.length > 0 && selectedFile && (
                            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 text-black mb-6">
                                <h3 className="text-lg font-semibold mb-2">
                                    Processing Time:
                                </h3>
                                <div className="space-y-2">
                                    {processingTimes
                                        .filter(
                                            (time) =>
                                                time.labelName ===
                                                selectedFile.name,
                                        )
                                        .map((time, index) => (
                                            <div key={index} className="text-sm">
                                                <span className="text-gray-600">
                                                    {time.duration.toFixed(2)}ms
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {validatingByFile[activeFileIndex] && (
                            <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                <p className="mt-2 text-sm text-gray-600">
                                    Processing...
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Label Results */}
                        {parsedData && !validatingByFile[activeFileIndex] && (
                            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 text-black">
                                <h3 className="text-lg font-semibold mb-2">
                                    Extracted Label Information
                                </h3>
                                <LabelTable data={parsedData} />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

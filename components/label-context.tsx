"use client";

import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { resizeImageFile } from "@/lib/resize-image-file";

import type {LabelExtraction} from "@/lib/label-extraction-schema";
import type {
    ApplicationData,
    ComparisonStatus,
    LabelFieldComparison,
    LabelMatchSummary,
    RejectedLabelRecord,
    SavedLabelRecord,
} from "@/lib/label-types";
import {createEmptyApplicationData} from "@/lib/format-label";
import {
    buildRequirementContext,
    getFieldRequirements,
} from "@/lib/label-requirements";

export interface ProcessingTime {
    duration: number;
    timestamp: string;
    labelName: string;
}

export interface LabelContextValue {
    uploadedFiles: File[];
    setUploadedFiles: React.Dispatch<React.SetStateAction<File[]>>;
    activeFileIndex: number;
    setActiveFileIndex: React.Dispatch<React.SetStateAction<number>>;
    selectedFile: File | null;
    setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
    previewUrl: string | null;
    setPreviewUrl: React.Dispatch<React.SetStateAction<string | null>>;
    parsedData: LabelExtraction | null;
    setParsedData: React.Dispatch<React.SetStateAction<LabelExtraction | null>>;
    parsedDataByFile: Array<LabelExtraction | null>;
    setParsedDataByFile: React.Dispatch<React.SetStateAction<Array<LabelExtraction | null>>>;
    applicationDataByFile: ApplicationData[];
    setApplicationDataByFile: React.Dispatch<React.SetStateAction<ApplicationData[]>>;
    validatingByFile: boolean[];
    setValidatingByFile: React.Dispatch<React.SetStateAction<boolean[]>>;
    savingByFile: boolean[];
    setSavingByFile: React.Dispatch<React.SetStateAction<boolean[]>>;
    acceptedByFile: boolean[];
    setAcceptedByFile: React.Dispatch<React.SetStateAction<boolean[]>>;
    rejectedByFile: boolean[];
    setRejectedByFile: React.Dispatch<React.SetStateAction<boolean[]>>;
    savedLabels: SavedLabelRecord[];
    setSavedLabels: React.Dispatch<React.SetStateAction<SavedLabelRecord[]>>;
    rejectedLabels: RejectedLabelRecord[];
    setRejectedLabels: React.Dispatch<React.SetStateAction<RejectedLabelRecord[]>>;
    isDrawerOpen: boolean;
        setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isRejectedDrawerOpen: boolean;
    setIsRejectedDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isPreviewDrawerOpen: boolean;
    setIsPreviewDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    error: string | null;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    processingTimes: ProcessingTime[];
    setProcessingTimes: React.Dispatch<React.SetStateAction<ProcessingTime[]>>;
    lastBatchDurationSeconds: number | null;
    lastBatchCount: number;
    hasUploads: boolean;
    allLabelsExtracted: boolean;
    handleValidateAllLabels: () => Promise<void>;
    handleValidateLabelAtIndex: (index: number) => Promise<void>;
    handleRemoveLabelAtIndex: (index: number) => void;
    handleAcceptLabelAtIndex: (index: number) => Promise<void>;
    handleUnacceptLabelAtIndex: (index: number) => void;
    handleRejectLabelAtIndex: (index: number) => Promise<void>;
    handleUnrejectLabelAtIndex: (index: number) => void;
    handleLabelValidate: () => Promise<void>;
    validateLabel: (file: File, index: number, setLoading?: boolean) => Promise<LabelExtraction | null>;
    handleSelectLabel: (index: number) => void;
    handleFilesUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleApplicationDataChange: (
        index: number,
        field: keyof ApplicationData,
        value: string,
    ) => void;
    compareLabelToApplication: (
        labelData: LabelExtraction | null,
        applicationData: ApplicationData | null,
    ) => Record<string, LabelFieldComparison> | null;
    getComparisonSummary: (
        comparisons: Record<string, LabelFieldComparison> | null,
    ) => {
        matched: number;
        total: number;
        reviewFields: string[];
        issueFields: string[];
    } | null;
    getLabelMatchSummary: (
        data: LabelExtraction | null,
        applicationData: ApplicationData | null,
    ) => LabelMatchSummary | null;
}

const LabelContext = createContext<LabelContextValue | undefined>(
    undefined,
);

export function LabelProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
	const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [parsedData, setParsedData] = useState<LabelExtraction | null>(null);
    const [parsedDataByFile, setParsedDataByFile] = useState<
        Array<LabelExtraction | null>
    >([]);
    const [applicationDataByFile, setApplicationDataByFile] = useState<
        ApplicationData[]
    >([]);
    const [validatingByFile, setValidatingByFile] = useState<boolean[]>([]);
    const [savingByFile, setSavingByFile] = useState<boolean[]>([]);
    const [acceptedByFile, setAcceptedByFile] = useState<boolean[]>([]);
    const [savedLabels, setSavedLabels] = useState<SavedLabelRecord[]>([]);
    const [rejectedByFile, setRejectedByFile] = useState<boolean[]>([]);
    const [rejectedLabels, setRejectedLabels] = useState<
        RejectedLabelRecord[]
    >([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isRejectedDrawerOpen, setIsRejectedDrawerOpen] = useState(false);
    const [isPreviewDrawerOpen, setIsPreviewDrawerOpen] = useState(false);
    const hasUploads = uploadedFiles.length > 0;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processingTimes, setProcessingTimes] = useState<ProcessingTime[]>(
        [],
    );
    const [lastBatchDurationSeconds, setLastBatchDurationSeconds] = useState<
        number | null
    >(null);
    const [lastBatchCount, setLastBatchCount] = useState(0);

    const getLabelMatchSummary = (
        data: LabelExtraction | null,
        applicationData: ApplicationData | null,
    ): LabelMatchSummary | null => {
        if (!data) {
            return null;
        }

        const entries = Object.entries(data) as Array<
            [keyof ApplicationData, LabelExtraction[keyof LabelExtraction]]
        >;

        if (!applicationData) {
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
            return {
                matched,
                total,
                allMatched: matched === total,
                reviewFields,
                issueFields,
            };
        }

        const context = buildRequirementContext(applicationData, data);
        const requirements = getFieldRequirements(context);
        const requiredKeys = entries
            .map(([key]) => key)
            .filter((key) => requirements[key].required);

        const matchedFields: string[] = [];
        const reviewFields: string[] = [];
        const issueFields: string[] = [];

        requiredKeys.forEach((key) => {
            const field = data[key];
            const value = typeof field.value === "string" ? field.value.trim() : "";
            const hasValue = value.length > 0;

            if (hasValue && field.confidence > 0.7) {
                matchedFields.push(key);
            } else if (hasValue && field.confidence > 0.4) {
                reviewFields.push(key);
            } else {
                issueFields.push(key);
            }
        });

        const total = requiredKeys.length;
        const matched = matchedFields.length;
        return {
            matched,
            total,
            allMatched: matched === total,
            reviewFields,
            issueFields,
        };
    };

    const compareLabelToApplication = (
        labelData: LabelExtraction | null,
        applicationData: ApplicationData | null,
    ): Record<string, LabelFieldComparison> | null => {
        if (!labelData || !applicationData) {
            return null;
        }
        const normalizeText = (value: string) =>
            value
                .toLowerCase()
                .replace(/['’]/g, "")
                .replace(/[^a-z0-9]+/g, " ")
                .replace(/\s+/g, " ")
                .trim();
        const comparisons: Record<string, LabelFieldComparison> = {};
        const context = buildRequirementContext(applicationData, labelData);
        const requirements = getFieldRequirements(context);

        (Object.entries(labelData) as Array<
            [keyof ApplicationData, LabelExtraction[keyof LabelExtraction]]
        >).forEach(([key, field]) => {
            const requirement = requirements[key];
            const labelValue =
                typeof field.value === "string" ? field.value.trim() : "";
            const applicationValue =
                typeof applicationData[key as keyof ApplicationData] ===
                "string"
                    ? applicationData[
                          key as keyof ApplicationData
                      ].trim()
                    : "";
            const hasLabel = labelValue.length > 0;
            const hasApplication = applicationValue.length > 0;
            let status: ComparisonStatus = "issue";

            if (key === "gov_warning") {
                const hasAllCapsWarning = labelValue.includes(
                    "GOVERNMENT WARNING:",
                );
                status = hasAllCapsWarning ? "match" : "issue";
            } else if (requirement.required && (!hasLabel || !hasApplication)) {
                status = "issue";
            } else if (!hasLabel || !hasApplication) {
                status = "review";
            } else if (labelValue === applicationValue) {
                status = "match";
            } else if (
                normalizeText(labelValue) === normalizeText(applicationValue)
            ) {
                // "Judgment" match: case/punctuation/apostrophe-insensitive.
                status = "match";
            }
            comparisons[key] = {
                labelValue: field.value,
                applicationValue,
                status,
                required: requirement.required,
                requirementReason: requirement.reason,
            };
        });
        return comparisons;
    };

    const getComparisonSummary = (
        comparisons: Record<string, LabelFieldComparison> | null,
    ) => {
        if (!comparisons) {
            return null;
        }
        const entries = Object.entries(comparisons);
        const requiredEntries = entries.filter(([, comparison]) => comparison.required);
        const total = requiredEntries.length;
        const matched = requiredEntries.filter(
            ([, comparison]) => comparison.status === "match",
        ).length;
        const reviewFields = requiredEntries
            .filter(([, comparison]) => comparison.status === "review")
            .map(([key]) => key);
        const issueFields = requiredEntries
            .filter(([, comparison]) => comparison.status === "issue")
            .map(([key]) => key);
        return {
            matched,
            total,
            reviewFields,
            issueFields,
        };
    };

    const handleFilesUpload = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const filesArray = Array.from(files);
            const existingNames = new Set(uploadedFiles.map((file) => file.name));
            const maxFileSizeBytes = 500 * 1024;
            const oversizedFiles = filesArray.filter(
                (file) => file.size > maxFileSizeBytes,
            );
            const duplicateNames = filesArray
                .filter((file) => existingNames.has(file.name))
                .map((file) => file.name);
            const uniqueNewFiles = filesArray.filter(
                (file) =>
                    !existingNames.has(file.name) &&
                    file.size <= maxFileSizeBytes,
            );

            const errorMessages: string[] = [];
            if (duplicateNames.length > 0) {
                const duplicatesList = Array.from(new Set(duplicateNames)).join(", ");
                errorMessages.push(
                    `A file named ${duplicatesList} has already been uploaded.`,
                );
            }
            if (oversizedFiles.length > 0) {
                const oversizedList = Array.from(
                    new Set(oversizedFiles.map((file) => file.name)),
                ).join(", ");
                errorMessages.push(
                    `Files must be 500KB or smaller: ${oversizedList}.`,
                );
            }
            setError(errorMessages.length > 0 ? errorMessages.join(" ") : null);

            if (uniqueNewFiles.length > 0) {
                const startIndex = uploadedFiles.length;
                setUploadedFiles((prev) => [...prev, ...uniqueNewFiles]);
                setParsedDataByFile((prev) => [
                    ...prev,
                    ...new Array(uniqueNewFiles.length).fill(null),
                ]);
                setApplicationDataByFile((prev) => [
                    ...prev,
                    ...new Array(uniqueNewFiles.length)
                        .fill(null)
                        .map(() => createEmptyApplicationData()),
                ]);
                setValidatingByFile((prev) => [
                    ...prev,
                    ...new Array(uniqueNewFiles.length).fill(false),
                ]);
                setSavingByFile((prev) => [
                    ...prev,
                    ...new Array(uniqueNewFiles.length).fill(false),
                ]);
                setAcceptedByFile((prev) => [
                    ...prev,
                    ...new Array(uniqueNewFiles.length).fill(false),
                ]);
                setRejectedByFile((prev) => [
                    ...prev,
                    ...new Array(uniqueNewFiles.length).fill(false),
                ]);
                const file = uniqueNewFiles[0];
                setActiveFileIndex(startIndex);
                setSelectedFile(file);
                setPreviewUrl(URL.createObjectURL(file));
                // setIsPreviewDrawerOpen(true);
            }
        }
        if (event.target) {
            event.target.value = "";
        }
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

    const addProcessingTime = (
    startTime: number,
    labelName: string,
) => {
    const durationSeconds = (performance.now() - startTime) / 1000;
    const roundedSeconds = Math.round(durationSeconds * 10) / 10;
    setProcessingTimes((prev) => [
        ...prev,
        {
            duration: roundedSeconds,
            timestamp: new Date().toISOString(),
            labelName,
        },
    ]);
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
            const resizedFile = await resizeImageFile(file, 1200);
            const formData = new FormData();
            formData.append("file", resizedFile);

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

    const handleSelectLabel = (index: number) => {
        setActiveFileIndex(index);
        setError(null);
    };

    const handleRemoveLabelAtIndex = (index: number) => {
        const nextFiles = uploadedFiles.filter((_, i) => i !== index);
        const nextParsed = parsedDataByFile.filter((_, i) => i !== index);
        const nextApplicationData = applicationDataByFile.filter(
            (_, i) => i !== index,
        );
        const nextValidating = validatingByFile.filter((_, i) => i !== index);
        const nextSaving = savingByFile.filter((_, i) => i !== index);
        const nextAccepted = acceptedByFile.filter((_, i) => i !== index);
        const nextRejected = rejectedByFile.filter((_, i) => i !== index);
        setUploadedFiles(nextFiles);
        setParsedDataByFile(nextParsed);
        setApplicationDataByFile(nextApplicationData);
        setValidatingByFile(nextValidating);
        setSavingByFile(nextSaving);
        setAcceptedByFile(nextAccepted);
        setRejectedByFile(nextRejected);
        setError(null);

        if (nextFiles.length === 0) {
            setSelectedFile(null);
            setPreviewUrl(null);
            setParsedData(null);
            setActiveFileIndex(0);
            setIsPreviewDrawerOpen(false);
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

    const allLabelsExtracted =
        uploadedFiles.length > 0 &&
        uploadedFiles.every((_, index) => Boolean(parsedDataByFile[index]));

    const handleValidateAllLabels = async () => {
        if (uploadedFiles.length === 0) {
            setError("Please upload at least one label first");
            return;
        }
        const initialActiveIndex = activeFileIndex;
        const shouldRestoreActiveIndex =
            !allLabelsExtracted && Boolean(parsedDataByFile[initialActiveIndex]);
        setIsLoading(true);
        setError(null);
        setValidatingByFile(new Array(uploadedFiles.length).fill(true));
        const indices = uploadedFiles
            .map((_, index) => index)
            .filter((index) =>
                allLabelsExtracted ? true : !parsedDataByFile[index],
            );
        if (indices.length === 0) {
            setIsLoading(false);
            return;
        }
        const batchStartTime = performance.now();
        setLastBatchDurationSeconds(null);
        setLastBatchCount(indices.length);
        indices.forEach((index) => {
            if (allLabelsExtracted) {
                return;
            }
            if (parsedDataByFile[index]) {
                setValidatingByFile((prev) => {
                    const next = [...prev];
                    next[index] = false;
                    return next;
                });
            }
        });
        let cursor = 0;
        const runWorker = async () => {
            while (cursor < indices.length) {
                const index = indices[cursor];
                cursor += 1;
                setActiveFileIndex(index);
                await validateLabel(uploadedFiles[index], index, false);
            }
        };
        const concurrency = 3;
        await Promise.all(
            Array.from({length: Math.min(concurrency, indices.length)}).map(
                () => runWorker(),
            ),
        );
        const durationSeconds = (performance.now() - batchStartTime) / 1000;
        const roundedSeconds = Math.round(durationSeconds * 10) / 10;
        setLastBatchDurationSeconds(roundedSeconds);
        if (shouldRestoreActiveIndex) {
            setActiveFileIndex(initialActiveIndex);
        }
        setIsLoading(false);
    };

    const handleAcceptLabelAtIndex = async (index: number) => {
        const file = uploadedFiles[index];
        const extracted = parsedDataByFile[index];
        if (!file || !extracted) {
            setError("Please validate a label before accepting it");
            return;
        }
        setSavingByFile((prev) => {
            const next = [...prev];
            next[index] = true;
            return next;
        });
        setError(null);
        try {
            const record: SavedLabelRecord = {
                file: {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified,
                },
                extracted,
                savedAt: new Date().toISOString(),
            };
            // Simulate save to database
            await new Promise((resolve) => setTimeout(resolve, 400));
            setSavedLabels((prev) => [...prev, record]);
            setAcceptedByFile((prev) => {
                const next = [...prev];
                next[index] = true;
                return next;
            });
            setRejectedByFile((prev) => {
                const next = [...prev];
                next[index] = false;
                return next;
            });
            setRejectedLabels((prev) =>
                prev.filter(
                    (rejected) =>
                        !(
                            rejected.file.name === file.name &&
                            rejected.file.size === file.size &&
                            rejected.file.lastModified === file.lastModified
                        ),
                ),
            );
        } catch (saveError) {
            setError(
                (saveError as Error).message ||
                    "Failed to save label information",
            );
        } finally {
            setSavingByFile((prev) => {
                const next = [...prev];
                next[index] = false;
                return next;
            });
        }
    };

    const handleUnacceptLabelAtIndex = (index: number) => {
        const file = uploadedFiles[index];
        if (!file) {
            return;
        }
        setAcceptedByFile((prev) => {
            const next = [...prev];
            next[index] = false;
            return next;
        });
        setSavedLabels((prev) =>
            prev.filter(
                (record) =>
                    !(
                        record.file.name === file.name &&
                        record.file.size === file.size &&
                        record.file.lastModified === file.lastModified
                    ),
            ),
        );
    };

    const handleRejectLabelAtIndex = async (index: number) => {
        const file = uploadedFiles[index];
        const extracted = parsedDataByFile[index];
        if (!file || !extracted) {
            setError("Please validate a label before rejecting it");
            return;
        }
        setSavingByFile((prev) => {
            const next = [...prev];
            next[index] = true;
            return next;
        });
        setError(null);
        try {
            const record: RejectedLabelRecord = {
                file: {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified,
                },
                extracted,
                rejectedAt: new Date().toISOString(),
            };
            await new Promise((resolve) => setTimeout(resolve, 400));
            setRejectedLabels((prev) => [...prev, record]);
            setRejectedByFile((prev) => {
                const next = [...prev];
                next[index] = true;
                return next;
            });
            setAcceptedByFile((prev) => {
                const next = [...prev];
                next[index] = false;
                return next;
            });
            setSavedLabels((prev) =>
                prev.filter(
                    (saved) =>
                        !(
                            saved.file.name === file.name &&
                            saved.file.size === file.size &&
                            saved.file.lastModified === file.lastModified
                        ),
                ),
            );
        } catch (saveError) {
            setError(
                (saveError as Error).message ||
                    "Failed to reject label information",
            );
        } finally {
            setSavingByFile((prev) => {
                const next = [...prev];
                next[index] = false;
                return next;
            });
        }
    };

    const handleUnrejectLabelAtIndex = (index: number) => {
        const file = uploadedFiles[index];
        if (!file) {
            return;
        }
        setRejectedByFile((prev) => {
            const next = [...prev];
            next[index] = false;
            return next;
        });
        setRejectedLabels((prev) =>
            prev.filter(
                (record) =>
                    !(
                        record.file.name === file.name &&
                        record.file.size === file.size &&
                        record.file.lastModified === file.lastModified
                    ),
            ),
        );
    };

        const handleLabelValidate = async () => {
        if (!selectedFile) {
            setError("Please select a label to validate first");
            return;
        }
        await validateLabel(selectedFile, activeFileIndex);
    };

    const handleApplicationDataChange = (
        index: number,
        field: keyof ApplicationData,
        value: string,
    ) => {
        setApplicationDataByFile((prev) => {
            const next = [...prev];
            const current = next[index] ?? createEmptyApplicationData();
            next[index] = {...current, [field]: value};
            return next;
        });
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
        <LabelContext.Provider value={{
            uploadedFiles,
            setUploadedFiles,
            activeFileIndex,
            setActiveFileIndex,
            selectedFile,
            setSelectedFile,
            previewUrl,
            setPreviewUrl,
            parsedData,
            setParsedData,
            parsedDataByFile,
            setParsedDataByFile,
            applicationDataByFile,
            setApplicationDataByFile,
            validatingByFile,
            setValidatingByFile,
            savingByFile,
            setSavingByFile,
            acceptedByFile,
            setAcceptedByFile,
            savedLabels,
            setSavedLabels,
            rejectedByFile,
            setRejectedByFile,
            rejectedLabels,
            setRejectedLabels,
            isDrawerOpen,
            setIsDrawerOpen,
            isRejectedDrawerOpen,
            setIsRejectedDrawerOpen,
            isPreviewDrawerOpen,
            setIsPreviewDrawerOpen,
            isLoading,
            setIsLoading,
            error,
            setError,
            processingTimes,
            setProcessingTimes,
            lastBatchDurationSeconds,
            lastBatchCount,
            hasUploads,
            allLabelsExtracted,
            handleValidateAllLabels,
            handleValidateLabelAtIndex,
            handleRemoveLabelAtIndex,
            handleAcceptLabelAtIndex,
            handleUnacceptLabelAtIndex,
            handleRejectLabelAtIndex,
            handleUnrejectLabelAtIndex,
            handleLabelValidate,
            handleSelectLabel,
            validateLabel,
            handleFilesUpload,
            handleApplicationDataChange,
            compareLabelToApplication,
            getComparisonSummary,
            getLabelMatchSummary,
        }}>
            {children}
        </LabelContext.Provider>
    );
}

export function useLabelContext() {
    const context = useContext(LabelContext);
    if (!context) {
        throw new Error("useLabelContext must be used within LabelProvider");
    }
    return context;
}

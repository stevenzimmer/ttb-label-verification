"use client";

import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { resizeImageFile } from "@/lib/resize-image-file";
import { useToast } from "@/components/ui/use-toast";

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

export interface BatchGroupStat {
    groupIndex: number;
    labelCount: number;
    durationSeconds: number;
    averageSeconds: number;
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
    applicationDataImportedByFile: boolean[];
    setApplicationDataImportedByFile: React.Dispatch<React.SetStateAction<boolean[]>>;
    applicationDataFileName: string | null;
    setApplicationDataFileName: React.Dispatch<React.SetStateAction<string | null>>;
    validatingByFile: boolean[];
    setValidatingByFile: React.Dispatch<React.SetStateAction<boolean[]>>;
    savingByFile: boolean[];
    setSavingByFile: React.Dispatch<React.SetStateAction<boolean[]>>;
    acceptedByFile: boolean[];
    setAcceptedByFile: React.Dispatch<React.SetStateAction<boolean[]>>;
    rejectedByFile: boolean[];
    setRejectedByFile: React.Dispatch<React.SetStateAction<boolean[]>>;
    rejectionReasonByFile: string[];
    showRejectionReasonByFile: boolean[];
    savedLabels: SavedLabelRecord[];
    setSavedLabels: React.Dispatch<React.SetStateAction<SavedLabelRecord[]>>;
    rejectedLabels: RejectedLabelRecord[];
    setRejectedLabels: React.Dispatch<React.SetStateAction<RejectedLabelRecord[]>>;
    isDrawerOpen: boolean;
    setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isRejectedDrawerOpen: boolean;
    setIsRejectedDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isIntroDrawerOpen: boolean;
    setIsIntroDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
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
    lastBatchGroups: BatchGroupStat[];
    allLabelsExtracted: boolean;
    handleExtractTextFromAllLabels: () => Promise<void>;
    handleRemoveLabelAtIndex: (index: number) => void;
    handleAcceptLabelAtIndex: (index: number) => Promise<void>;
    handleUnacceptLabelAtIndex: (index: number) => void;
    handleRejectLabelAtIndex: (index: number) => Promise<void>;
    handleUnrejectLabelAtIndex: (index: number) => void;
    handleRejectionReasonChange: (index: number, value: string) => void;
    handleShowRejectionReasonAtIndex: (index: number, value: boolean) => void;
    handleLabelTextExtract: () => Promise<void>;
    extractTextFromLabel: (file: File, index: number, setLoading?: boolean) => Promise<LabelExtraction | null>;
    handleApplicationDataImport: (file: File) => Promise<void>;
    importedApplicationErrors: string[];
    setImportedApplicationErrors: React.Dispatch<React.SetStateAction<string[]>>;
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
        noMatchFields: string[];
    } | null;
    getLabelMatchSummary: (
        data: LabelExtraction | null,
        applicationData: ApplicationData | null,
        comparisons?: Record<string, LabelFieldComparison> | null,
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
    const { toast } = useToast();
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
    const [applicationDataFileName, setApplicationDataFileName] = useState<
        string | null
    >(null);
    const [validatingByFile, setValidatingByFile] = useState<boolean[]>([]);
    const [savingByFile, setSavingByFile] = useState<boolean[]>([]);
    const [acceptedByFile, setAcceptedByFile] = useState<boolean[]>([]);
    const [savedLabels, setSavedLabels] = useState<SavedLabelRecord[]>([]);
    const [rejectedByFile, setRejectedByFile] = useState<boolean[]>([]);
    const [rejectionReasonByFile, setRejectionReasonByFile] = useState<string[]>([]);
    const [showRejectionReasonByFile, setShowRejectionReasonByFile] = useState<boolean[]>([]);
    const [applicationDataImportedByFile, setApplicationDataImportedByFile] = useState<boolean[]>([]);
    const [comparisonResultsByFile, setComparisonResultsByFile] = useState<
        Array<Record<string, {status: ComparisonStatus; rationale: string | null}> | null>
    >([]);
    const [comparisonApplicationDataByFile, setComparisonApplicationDataByFile] = useState<
        Array<ApplicationData | null>
    >([]);
    const [rejectedLabels, setRejectedLabels] = useState<
        RejectedLabelRecord[]
    >([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isRejectedDrawerOpen, setIsRejectedDrawerOpen] = useState(false);
    const [isIntroDrawerOpen, setIsIntroDrawerOpen] = useState(false);
    const [isPreviewDrawerOpen, setIsPreviewDrawerOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processingTimes, setProcessingTimes] = useState<ProcessingTime[]>(
        [],
    );
    const [lastBatchDurationSeconds, setLastBatchDurationSeconds] = useState<
        number | null
    >(null);
    const [lastBatchCount, setLastBatchCount] = useState(0);
    const [lastBatchGroups, setLastBatchGroups] = useState<BatchGroupStat[]>(
        [],
    );
    const [importedApplicationErrors, setImportedApplicationErrors] = useState<
        string[]
    >([]);

    const toastError = (description: string, title = "Validation error") => {
        toast({
            variant: "default",
            title,
            description,
        });
    };

    const parseCsvLine = (line: string) => {
        const cells: string[] = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i += 1) {
            const char = line[i];
            if (char === "\"") {
                if (inQuotes && line[i + 1] === "\"") {
                    current += "\"";
                    i += 1;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === "," && !inQuotes) {
                cells.push(current);
                current = "";
            } else {
                current += char;
            }
        }
        cells.push(current);
        return cells.map((cell) => cell.trim());
    };

    const parseCsv = (text: string): Record<string, string>[] => {
        const [headerLine, ...lines] = text
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);
        if (!headerLine) {
            return [];
        }
        const headers = parseCsvLine(headerLine);
        return lines.map((line) => {
            const cells = parseCsvLine(line);
            return headers.reduce((acc, key, index) => {
                acc[key] = cells[index] ?? "";
                return acc;
            }, {} as Record<string, string>);
        });
    };

    const normalizeText = (value: string) =>
        value
            .toLowerCase()
            .replace(/['’]/g, "")
            .replace(/[^a-z0-9]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();

    const areApplicationDataEqual = (
        left: ApplicationData | null,
        right: ApplicationData | null,
    ) => {
        if (!left || !right) {
            return false;
        }
        return (
            left.brand_name === right.brand_name &&
            left.class_type_designation === right.class_type_designation &&
            left.alcohol_content === right.alcohol_content &&
            left.net_contents === right.net_contents &&
            left.producer_name === right.producer_name &&
            left.producer_address === right.producer_address &&
            left.country_of_origin === right.country_of_origin &&
            left.gov_warning === right.gov_warning
        );
    };

    const buildComparisonsFromModel = (
        labelData: LabelExtraction,
        applicationData: ApplicationData,
        modelComparisons: Record<
            string,
            {status: ComparisonStatus; rationale: string | null}
        >,
    ) => {
        const comparisons: Record<string, LabelFieldComparison> = {};
        const context = buildRequirementContext(labelData);
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
            const modelResult = modelComparisons[key as string];
            const status = modelResult?.status ?? "review";
            const rationale =
                status === "match"
                    ? null
                    : modelResult?.rationale?.trim() ||
                      "Insufficient information to confirm a match.";
            comparisons[key] = {
                labelValue: field.value,
                applicationValue,
                status,
                rationale,
                required: requirement.required,
                requirementReason: requirement.reason,
            };
        });
        return comparisons;
    };

    const getLabelMatchSummary = (
        data: LabelExtraction | null,
        applicationData: ApplicationData | null,
        comparisons?: Record<string, LabelFieldComparison> | null,
    ): LabelMatchSummary | null => {
        if (comparisons) {
            const entries = Object.entries(comparisons);
            const requiredEntries = entries.filter(
                ([, comparison]) => comparison.required,
            );
            const total = requiredEntries.length;
            const matched = requiredEntries.filter(
                ([, comparison]) => comparison.status === "match",
            ).length;
            const reviewFields = requiredEntries
                .filter(([, comparison]) => comparison.status === "review")
                .map(([key]) => key);
            const noMatchFields = requiredEntries
                .filter(([, comparison]) => comparison.status === "no_match")
                .map(([key]) => key);
            return {
                matched,
                total,
                allMatched: matched === total,
                reviewFields,
                noMatchFields,
            };
        }

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
            const noMatchFields: string[] = [];

            entries.forEach(([key, field]) => {
                if (field.confidence > 0.7) {
                    matchedFields.push(key);
                } else if (field.confidence > 0.4) {
                    reviewFields.push(key);
                } else {
                    noMatchFields.push(key);
                }
            });

            const matched = matchedFields.length;
            return {
                matched,
                total,
                allMatched: matched === total,
                reviewFields,
                noMatchFields,
            };
        }

        const context = buildRequirementContext( data);

        const requirements = getFieldRequirements(context);
        const requiredKeys = entries
            .map(([key]) => key)
            .filter((key) => requirements[key].required);

        const matchedFields: string[] = [];
        const reviewFields: string[] = [];
        const noMatchFields: string[] = [];

        requiredKeys.forEach((key) => {
            const field = data[key];
            const value = typeof field.value === "string" ? field.value.trim() : "";
            const hasValue = value.length > 0;

            if (hasValue && field.confidence > 0.7) {
                matchedFields.push(key);
            } else if (hasValue && field.confidence > 0.4) {
                reviewFields.push(key);
            } else {
                noMatchFields.push(key);
            }
        });

        const total = requiredKeys.length;
        const matched = matchedFields.length;
        return {
            matched,
            total,
            allMatched: matched === total,
            reviewFields,
            noMatchFields,
        };
    };

    const compareLabelToApplication = (
        labelData: LabelExtraction | null,
        applicationData: ApplicationData | null,
    ): Record<string, LabelFieldComparison> | null => {
        if (!labelData || !applicationData) {
            return null;
        }
        const modelComparisons = comparisonResultsByFile[activeFileIndex];
        const comparisonSnapshot = comparisonApplicationDataByFile[activeFileIndex];
        const shouldUseModel =
            Boolean(modelComparisons) &&
            areApplicationDataEqual(comparisonSnapshot, applicationData);
        if (modelComparisons && shouldUseModel) {
            return buildComparisonsFromModel(
                labelData,
                applicationData,
                modelComparisons,
            );
        }

        const comparisons: Record<string, LabelFieldComparison> = {};
        const context = buildRequirementContext(labelData);
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
            let status: ComparisonStatus = "no_match";
            let rationale: string | null = null;

            if (key === "gov_warning") {
                const hasAllCapsWarning = labelValue.includes(
                    "GOVERNMENT WARNING:",
                );
                status = hasAllCapsWarning ? "match" : "no_match";
                if (status !== "match") {
                    rationale = "Government warning statement not found on label.";
                }
            } else if (!hasLabel || !hasApplication) {
                status = requirement.required ? "no_match" : "review";
                rationale = requirement.required
                    ? "Required value missing in the label or application data."
                    : "Insufficient information to confirm a match.";
            } else if (labelValue === applicationValue) {
                status = "match";
            } else if (
                normalizeText(labelValue) === normalizeText(applicationValue)
            ) {
                // "Judgment" match: case/punctuation/apostrophe-insensitive.
                status = "match";
            } else {
                status = "no_match";
                rationale = "Normalized values do not match.";
            }
            comparisons[key] = {
                labelValue: field.value,
                applicationValue,
                status,
                rationale: status === "match" ? null : rationale,
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
        const noMatchFields = requiredEntries
            .filter(([, comparison]) => comparison.status === "no_match")
            .map(([key]) => key);
        return {
            matched,
            total,
            reviewFields,
            noMatchFields,
        };
    };

    const handleFilesUpload = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const filesArray = Array.from(files);
            const existingNames = new Set(uploadedFiles.map((file) => file.name));
            const maxFileSizeBytes = 1024 * 1024; // 1MB
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
                    `Files must be 1MB or smaller: ${oversizedList}.`,
                );
            }
            if (errorMessages.length > 0) {
                toastError(errorMessages.join(" "));
            }

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
                setApplicationDataImportedByFile((prev) => [
                    ...prev,
                    ...new Array(uniqueNewFiles.length).fill(false),
                ]);
                setComparisonResultsByFile((prev) => [
                    ...prev,
                    ...new Array(uniqueNewFiles.length).fill(null),
                ]);
                setComparisonApplicationDataByFile((prev) => [
                    ...prev,
                    ...new Array(uniqueNewFiles.length).fill(null),
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
                setRejectionReasonByFile((prev) => [
                    ...prev,
                    ...new Array(uniqueNewFiles.length).fill(""),
                ]);
                setShowRejectionReasonByFile((prev) => [
                    ...prev,
                    ...new Array(uniqueNewFiles.length).fill(false),
                ]);
                const file = uniqueNewFiles[0];
                setActiveFileIndex(startIndex);
                setSelectedFile(file);
                setPreviewUrl(URL.createObjectURL(file));
            }
        }
        if (event.target) {
            event.target.value = "";
        }
    };

    const handleApplicationDataImport = async (file: File) => {
        setImportedApplicationErrors([]);
        const text = await file.text();
        let rows: Array<ApplicationData & {file_name?: string}> = [];
        try {
            if (file.name.toLowerCase().endsWith(".json")) {
                const parsed = JSON.parse(text) as unknown;
                rows = Array.isArray(parsed) ? parsed : [];
            } else {
                const parsed = parseCsv(text);
                rows = parsed.map((row) => ({
                    file_name: row.file_name,
                    brand_name: row.brand_name ?? "",
                    class_type_designation:
                        row.class_type_designation ?? "",
                    alcohol_content: row.alcohol_content ?? "",
                    net_contents: row.net_contents ?? "",
                    producer_name: row.producer_name ?? "",
                    producer_address: row.producer_address ?? "",
                    country_of_origin: row.country_of_origin ?? "",
                    gov_warning: row.gov_warning ?? "",
                }));
            }
        } catch (error) {
            setImportedApplicationErrors([
                "Failed to parse application data file.",
            ]);
            return;
        }

        if (rows.length === 0) {
            setImportedApplicationErrors([
                "No application rows found in the import file.",
            ]);
            return;
        }

        if (uploadedFiles.length === 0) {
            setImportedApplicationErrors([
                "Upload label images before importing application data.",
            ]);
            return;
        }

        const errors: string[] = [];
        const nextApplicationData = [...applicationDataByFile];
        const nextImportedFlags = [...applicationDataImportedByFile];

        rows.forEach((row, rowIndex) => {
            const normalized: ApplicationData = {
                brand_name: row.brand_name ?? "",
                class_type_designation: row.class_type_designation ?? "",
                alcohol_content: row.alcohol_content ?? "",
                net_contents: row.net_contents ?? "",
                producer_name: row.producer_name ?? "",
                producer_address: row.producer_address ?? "",
                country_of_origin: row.country_of_origin ?? "",
                gov_warning: row.gov_warning ?? "",
            };

            if (row.file_name) {
                const matchIndex = uploadedFiles.findIndex(
                    (uploaded) =>
                        uploaded.name.toLowerCase() ===
                        row.file_name!.toLowerCase(),
                );
                if (matchIndex === -1) {
                    errors.push(
                        `Row ${rowIndex + 1}: no uploaded file named "${row.file_name}".`,
                    );
                    return;
                }
                nextApplicationData[matchIndex] = normalized;
                nextImportedFlags[matchIndex] = true;
                return;
            }

            if (rowIndex >= uploadedFiles.length) {
                errors.push(
                    `Row ${rowIndex + 1}: no uploaded file at position ${rowIndex + 1}.`,
                );
                return;
            }
            nextApplicationData[rowIndex] = normalized;
            nextImportedFlags[rowIndex] = true;
        });

        setApplicationDataByFile(nextApplicationData);
        setApplicationDataImportedByFile(nextImportedFlags);
        setImportedApplicationErrors(errors);
        setApplicationDataFileName(file.name);
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


const extractTextFromLabel = async (
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
        try {
            const resizedFile = await resizeImageFile(file, 1200);
            const formData = new FormData();
            const applicationData = applicationDataByFile[index] ?? null;
            formData.append("file", resizedFile);
            formData.append(
                "application_data",
                JSON.stringify(applicationData ?? {}),
            );

            const response = await fetch("/api/validate-label", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                toastError(
                    data.error || "Failed to process image",
                    "Text extraction failed",
                );
                setParsedDataByFile((prev) => {
                    const next = [...prev];
                    next[index] = null;
                    return next;
                });
                setComparisonResultsByFile((prev) => {
                    const next = [...prev];
                    next[index] = null;
                    return next;
                });
                setComparisonApplicationDataByFile((prev) => {
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
            setComparisonResultsByFile((prev) => {
                const next = [...prev];
                next[index] = data.comparisons ?? null;
                return next;
            });
            setComparisonApplicationDataByFile((prev) => {
                const next = [...prev];
                next[index] = applicationData;
                return next;
            });
            setParsedData(data.parsed);
            return data.parsed as LabelExtraction;
        } catch (error) {
            toastError(
                (error as Error).message || "An unexpected error occurred",
                "Text extraction failed",
            );
            setParsedDataByFile((prev) => {
                const next = [...prev];
                next[index] = null;
                return next;
            });
            setComparisonResultsByFile((prev) => {
                const next = [...prev];
                next[index] = null;
                return next;
            });
            setComparisonApplicationDataByFile((prev) => {
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
    };

    const handleRemoveLabelAtIndex = (index: number) => {
        const nextFiles = uploadedFiles.filter((_, i) => i !== index);
        const nextParsed = parsedDataByFile.filter((_, i) => i !== index);
        const nextApplicationData = applicationDataByFile.filter(
            (_, i) => i !== index,
        );
        const nextApplicationDataImported = applicationDataImportedByFile.filter(
            (_, i) => i !== index,
        );
        const nextComparisonResults = comparisonResultsByFile.filter(
            (_, i) => i !== index,
        );
        const nextComparisonApplicationData = comparisonApplicationDataByFile.filter(
            (_, i) => i !== index,
        );
        const nextValidating = validatingByFile.filter((_, i) => i !== index);
        const nextSaving = savingByFile.filter((_, i) => i !== index);
        const nextAccepted = acceptedByFile.filter((_, i) => i !== index);
        const nextRejected = rejectedByFile.filter((_, i) => i !== index);
        const nextRejectionReasons = rejectionReasonByFile.filter(
            (_, i) => i !== index,
        );
        const nextShowRejectionReason = showRejectionReasonByFile.filter(
            (_, i) => i !== index,
        );
        setUploadedFiles(nextFiles);
        setParsedDataByFile(nextParsed);
        setApplicationDataByFile(nextApplicationData);
        setApplicationDataImportedByFile(nextApplicationDataImported);
        setComparisonResultsByFile(nextComparisonResults);
        setComparisonApplicationDataByFile(nextComparisonApplicationData);
        setValidatingByFile(nextValidating);
        setSavingByFile(nextSaving);
        setAcceptedByFile(nextAccepted);
        setRejectedByFile(nextRejected);
        setRejectionReasonByFile(nextRejectionReasons);
        setShowRejectionReasonByFile(nextShowRejectionReason);

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

    const handleExtractTextFromAllLabels = async () => {
        if (uploadedFiles.length === 0) {
            toastError(
                "Please upload at least one label first",
                "Action required",
            );
            return;
        }
        const shouldRestoreActiveIndex =
            !allLabelsExtracted && Boolean(parsedDataByFile[activeFileIndex]);
        setIsLoading(true);
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
        setLastBatchDurationSeconds(null);
        setLastBatchCount(indices.length);
        setLastBatchGroups([]);
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
        const concurrency = 200; // batches of 200 labels processed at a time.
        const groups: number[][] = [];
        for (let i = 0; i < indices.length; i += concurrency) {
            groups.push(indices.slice(i, i + concurrency));
        }

        const groupStats: BatchGroupStat[] = [];
        for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
            const group = groups[groupIndex];
            const groupStartTime = performance.now();
            await Promise.all(
                group.map(async (index) => {
                    setActiveFileIndex(index);
                    await extractTextFromLabel(uploadedFiles[index], index, false);
                }),
            );
            const durationSeconds = (performance.now() - groupStartTime) / 1000;
            const roundedSeconds = Math.round(durationSeconds * 10) / 10;
            const labelCount = group.length;
            groupStats.push({
                groupIndex: groupIndex + 1,
                labelCount,
                durationSeconds: roundedSeconds,
                averageSeconds:
                    labelCount > 0
                        ? Math.round((roundedSeconds / labelCount) * 10) / 10
                        : 0,
            });
        }

        const totalDurationSeconds = groupStats.reduce(
            (sum, stat) => sum + stat.durationSeconds,
            0,
        );
        const roundedTotalSeconds = Math.round(totalDurationSeconds * 10) / 10;
        setLastBatchGroups(groupStats);
        setLastBatchDurationSeconds(roundedTotalSeconds);
        if (shouldRestoreActiveIndex) {
            setActiveFileIndex(activeFileIndex);
        }
        setIsLoading(false);
    };

    const handleAcceptLabelAtIndex = async (index: number) => {
        const file = uploadedFiles[index];
        const extracted = parsedDataByFile[index];
        if (!file || !extracted) {
            toastError(
                "Please validate a label before accepting it",
                "Action required",
            );
            return;
        }
        setSavingByFile((prev) => {
            const next = [...prev];
            next[index] = true;
            return next;
        });
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
            setShowRejectionReasonByFile((prev) => {
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
            toastError(
                (saveError as Error).message ||
                    "Failed to save label information",
                "Save failed",
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
            toastError(
                "Please validate a label before rejecting it",
                "Action required",
            );
            return;
        }
        const rejectionReason = (rejectionReasonByFile[index] ?? "").trim();
        if (!rejectionReason) {
            toastError(
                "Please provide a reason for rejecting this label",
                "Action required",
            );
            return;
        }
        setSavingByFile((prev) => {
            const next = [...prev];
            next[index] = true;
            return next;
        });
        try {
            const record: RejectedLabelRecord = {
                file: {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified,
                },
                extracted,
                rejectionReason,
                rejectedAt: new Date().toISOString(),
            };
            await new Promise((resolve) => setTimeout(resolve, 400));
            setRejectedLabels((prev) => [...prev, record]);
            setRejectedByFile((prev) => {
                const next = [...prev];
                next[index] = true;
                return next;
            });
            setShowRejectionReasonByFile((prev) => {
                const next = [...prev];
                next[index] = false;
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
            toastError(
                (saveError as Error).message ||
                    "Failed to reject label information",
                "Save failed",
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
        setShowRejectionReasonByFile((prev) => {
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

    const handleRejectionReasonChange = (index: number, value: string) => {
        setRejectionReasonByFile((prev) => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
    };

    const handleShowRejectionReasonAtIndex = (index: number, value: boolean) => {
        setShowRejectionReasonByFile((prev) => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
    };

    const handleLabelTextExtract = async () => {
        if (!selectedFile) {
            toastError(
                "Please select a label to extract text from first",
                "Action required",
            );
            return;
        }
        await extractTextFromLabel(selectedFile, activeFileIndex);
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
            applicationDataImportedByFile,
            setApplicationDataImportedByFile,
            applicationDataFileName,
            setApplicationDataFileName,
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
            rejectionReasonByFile,
            showRejectionReasonByFile,
            rejectedLabels,
            setRejectedLabels,
            isDrawerOpen,
            setIsDrawerOpen,
            isRejectedDrawerOpen,
            setIsRejectedDrawerOpen,
            isIntroDrawerOpen,
            setIsIntroDrawerOpen,
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
            lastBatchGroups,
            allLabelsExtracted,
            handleExtractTextFromAllLabels,
            handleRemoveLabelAtIndex,
            handleAcceptLabelAtIndex,
            handleUnacceptLabelAtIndex,
            handleRejectLabelAtIndex,
            handleUnrejectLabelAtIndex,
            handleRejectionReasonChange,
            handleShowRejectionReasonAtIndex,
            handleLabelTextExtract,
            handleApplicationDataImport,
            importedApplicationErrors,
            setImportedApplicationErrors,
            handleSelectLabel,
            extractTextFromLabel,
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

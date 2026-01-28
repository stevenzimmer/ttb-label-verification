"use client";

import Image from "next/image";
import {Check, ChevronRight, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {useLabelContext} from "@/components/label-context";
import {cn} from "@/lib/utils";
import {formatFieldList} from "@/lib/format-label";
import {buildRequirementContext} from "@/lib/label-requirements";
interface UploadedLabelCardProps {
    index: number;
}

export function UploadedLabelCard({index}: UploadedLabelCardProps) {
    const {
        uploadedFiles,
        activeFileIndex,
        validatingByFile,
        acceptedByFile,
        rejectedByFile,
        applicationDataImportedByFile,
        allLabelsExtracted,
        isLoading,
        setError,
        handleUnacceptLabelAtIndex,
        handleRemoveLabelAtIndex,
        handleSelectLabel,
        getLabelMatchSummary,
        parsedDataByFile,
        applicationDataByFile,
        setIsPreviewDrawerOpen,
    } = useLabelContext();
    const file = uploadedFiles[index];
    const applicationData = applicationDataByFile[index] ?? null;
    const isApplicationDataImported = applicationDataImportedByFile[index];
    const applicationFieldCount = applicationData
        ? Object.values(applicationData).filter((value) => value.trim() !== "")
              .length
        : 0;
    const labelData = parsedDataByFile[index] ?? null;
    const summary = getLabelMatchSummary(labelData, applicationData);
    const extractedFieldCount = labelData
        ? Object.values(labelData).filter((field) => {
              if (typeof field.value === "string") {
                  return field.value.trim() !== "";
              }
              return Boolean(field.value);
          }).length
        : 0;
    const totalFieldCount = labelData ? Object.keys(labelData).length : 0;

    const validating = validatingByFile[index];
    const accepted = acceptedByFile[index];
    const rejected = rejectedByFile[index];
    const isActive = index === activeFileIndex;
    const extractionComplete = Boolean(summary) && !validating;
    const requirementContext = applicationData
        ? buildRequirementContext(parsedDataByFile[index] ?? null)
        : null;
    const beverageTypeLabel = requirementContext
        ? requirementContext.beverageType === "unknown"
            ? "Unknown type"
            : requirementContext.beverageType[0].toUpperCase() +
              requirementContext.beverageType.slice(1)
        : null;
    const originLabel = requirementContext
        ? requirementContext.isImported
            ? "Imported"
            : "Domestic"
        : null;

    if (!file) {
        return null;
    }

    const labelCardIsReady = extractionComplete && isApplicationDataImported;

    return (
        <Card
            className={cn(
                "transition-colors cursor-pointer",
                isActive ? "border-blue-500 bg-secondary" : "hover:bg-muted/60",
                labelCardIsReady && "bg-emerald-50 hover:bg-emerald-100",
            )}
            onClick={() => {
                if (uploadedFiles.length > 0 && !allLabelsExtracted) {
                    setError(
                        "Extract text from all labels before opening label details.",
                    );
                    return;
                }
                if (!applicationDataImportedByFile[index]) {
                    setError(
                        "Upload application data before opening label details.",
                    );
                    return;
                }
                handleSelectLabel(index);
                setIsPreviewDrawerOpen(true);
            }}
        >
            <CardContent className="flex items-center gap-3 p-3">
                <div className="shrink-0">
                    <Image
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        width={60}
                        height={60}
                        className="object-contain rounded-md border mr-3"
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                            {file.name}
                        </p>
                        {rejected && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700">
                                Rejected
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                    </p>
                    {extractionComplete && beverageTypeLabel && originLabel && (
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                                {beverageTypeLabel}
                            </span>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                                {originLabel}
                            </span>
                        </div>
                    )}
                </div>
                <div className="">
                    {validating ? (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        </div>
                    ) : (
                        summary && (
                            <>
                                <div className="text-xs font-semibold space-y-1 text-right max-w-50 text-emerald-700">
                                    <div>{`${extractedFieldCount}/${totalFieldCount} fields extracted`}</div>
                                </div>
                                {isApplicationDataImported && (
                                    <div className="mt-1 text-xs font-medium text-emerald-700">
                                        {applicationFieldCount} application
                                        fields added
                                    </div>
                                )}

                                {labelCardIsReady && (
                                    <div className="mt-1 flex items-center justify-end gap-1 text-xs font-medium text-muted-foreground">
                                        <span>View details</span>
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </div>
                                )}
                            </>
                        )
                    )}
                    {summary && !validating && (
                        <>
                            {accepted && (
                                <button
                                    type="button"
                                    title="Remove from accepted"
                                    className="group inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 transition-colors hover:bg-red-100 hover:text-red-600"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleUnacceptLabelAtIndex(index);
                                    }}
                                >
                                    <Check className="h-4 w-4 group-hover:hidden" />
                                    <X className="hidden h-4 w-4 group-hover:block" />
                                </button>
                            )}
                        </>
                    )}
                    {!summary && !validating && (
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isLoading}
                            className="bg-red-50 text-red-700 hover:bg-red-100"
                            onClick={(event) => {
                                event.stopPropagation();
                                handleRemoveLabelAtIndex(index);
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

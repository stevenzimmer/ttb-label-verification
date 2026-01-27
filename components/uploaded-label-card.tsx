"use client";

import Image from "next/image";
import {Check, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {useLabelContext} from "@/components/label-context";
import {cn} from "@/lib/utils";
import {formatFieldList} from "@/lib/format-label";
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
        isLoading,
        handleValidateLabelAtIndex,
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
    const summary = getLabelMatchSummary(parsedDataByFile[index] ?? null, applicationData);

    const validating = validatingByFile[index];
    const accepted = acceptedByFile[index];
    const rejected = rejectedByFile[index];
    const isActive = index === activeFileIndex;

    if (!file) {
        return null;
    }

    return (
        <Card
            className={cn(
                "transition-colors cursor-pointer",
                isActive ? "border-blue-500 bg-secondary" : "hover:bg-muted/60",
            )}
            onClick={() => {
                handleSelectLabel(index);
                setIsPreviewDrawerOpen(true);
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
                </div>
                <div className="flex items-center gap-2">
                    {validating ? (
                        <span className="text-xs font-semibold text-slate-500">
                            Processing...
                        </span>
                    ) : (
                        summary && (
                            <div
                                className={cn(
                                    "text-xs font-semibold space-y-1 text-right max-w-50",
                                    summary.allMatched
                                        ? "text-emerald-700"
                                        : "text-amber-700",
                                )}
                            >
                                <div>{`${summary.matched}/${summary.total}`}</div>
                                {summary.reviewFields.length > 0 && (
                                    <div className="line-clamp-2 text-[11px] font-medium text-amber-700">
                                        Review:{" "}
                                        {formatFieldList(
                                            summary.reviewFields,
                                            2,
                                        )}
                                    </div>
                                )}
                                {summary.issueFields.length > 0 && (
                                    <div className="line-clamp-2 text-[11px] font-medium text-amber-700">
                                        Issues:{" "}
                                        {formatFieldList(
                                            summary.issueFields,
                                            2,
                                        )}
                                    </div>
                                )}
                            </div>
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

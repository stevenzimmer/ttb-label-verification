import {UploadedLabelCard} from "@/components/uploaded-label-card";
import {Button} from "@/components/ui/button";
import {useLabelContext} from "@/components/label-context";
export const LabelCards = () => {
    const {
        uploadedFiles,
        handleExtractTextFromAllLabels,
        isLoading,
        allLabelsExtracted,
        lastBatchDurationSeconds,
        lastBatchCount,
        lastBatchGroups,
    } = useLabelContext();

    const formatSeconds = (value: number) =>
        (Math.round(value * 10) / 10).toFixed(1);
    const showBatchStats =
        lastBatchDurationSeconds !== null && lastBatchCount > 0;
    const averageSeconds = showBatchStats
        ? lastBatchDurationSeconds / lastBatchCount
        : 0;
    const averageExtractionTimeSatisfiesThreshold = averageSeconds < 5;
    return (
        <div className="mt-3 ">
            <div className="flex items-start justify-end gap-3">
                {showBatchStats && (
                    <div className="text-right space-y-1">
                        <div className="text-xs text-muted-foreground">
                            Total text extraction time:{" "}
                            {formatSeconds(lastBatchDurationSeconds)}s
                        </div>
                        <div
                            className={`text-xs ${
                                averageExtractionTimeSatisfiesThreshold
                                    ? "text-green-600"
                                    : "text-red-600"
                            }`}
                        >
                            Avg time per label: {formatSeconds(averageSeconds)}s
                        </div>
                        {lastBatchGroups.length > 1 && (
                            <div className="pt-1 space-y-1">
                                {lastBatchGroups.map((group) => {
                                    const groupAverageIsFast =
                                        group.averageSeconds < 5;
                                    return (
                                        <div
                                            key={group.groupIndex}
                                            className="text-[11px] text-muted-foreground"
                                        >
                                            Batch {group.groupIndex}:{" "}
                                            {formatSeconds(
                                                group.durationSeconds,
                                            )}
                                            s total ·{" "}
                                            <span
                                                className={
                                                    groupAverageIsFast
                                                        ? "text-green-600"
                                                        : "text-red-600"
                                                }
                                            >
                                                {formatSeconds(
                                                    group.averageSeconds,
                                                )}
                                                s avg
                                            </span>{" "}
                                            ({group.labelCount} labels)
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
                {uploadedFiles.length > 0 && !allLabelsExtracted && (
                    <Button
                        onClick={handleExtractTextFromAllLabels}
                        disabled={isLoading}
                        variant="secondary"
                        className={
                            allLabelsExtracted
                                ? "bg-blue-100 text-blue-900 hover:bg-blue-200"
                                : "bg-emerald-500 text-white hover:bg-emerald-600"
                        }
                    >
                        Extract text from all labels
                    </Button>
                )}
            </div>

            <div className="w-full mt-3 space-y-2">
                {uploadedFiles.map((_, index) => (
                    <UploadedLabelCard key={index} index={index} />
                ))}
            </div>
        </div>
    );
};

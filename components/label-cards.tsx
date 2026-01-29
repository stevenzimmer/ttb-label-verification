import {UploadedLabelCard} from "@/components/uploaded-label-card";
import {useLabelContext} from "@/components/label-context";
export const LabelCards = () => {
    const {
        uploadedFiles,
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
        <div className="mt-3 lg:mt-0">
            <div className="mb-3">
                <h2 className="text-2xl text-center">Uploaded labels</h2>
            </div>
            <div className="flex items-start justify-end gap-3">
                {showBatchStats && (
                    <div className="text-right space-y-1 bg-slate-100 p-3 mb-6">
                        <div className="text-sm text-muted-foreground">
                            Total text extraction time:{" "}
                            {formatSeconds(lastBatchDurationSeconds)}s
                        </div>
                        <div
                            className={`text-sm ${
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
            </div>

            <div className="w-full mt-3 lg:mt-0 space-y-2">
                {uploadedFiles.map((_, index) => (
                    <UploadedLabelCard key={index} index={index} />
                ))}
            </div>
        </div>
    );
};

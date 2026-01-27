import {UploadedLabelCard} from "@/components/uploaded-label-card";
import {Button} from "@/components/ui/button";
import {useLabelContext} from "@/components/label-context";
export const LabelCards = () => {
    const {
        uploadedFiles,
        handleValidateAllLabels,
        isLoading,
        allLabelsExtracted,
        lastBatchDurationSeconds,
        lastBatchCount,
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
            <div className="flex items-center justify-end gap-3">
                {showBatchStats && (
                    <div className="text-right">
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
                    </div>
                )}
                {uploadedFiles.length > 0 && (
                    <Button
                        onClick={handleValidateAllLabels}
                        disabled={isLoading}
                        variant="secondary"
                        className={
                            allLabelsExtracted
                                ? "bg-blue-100 text-blue-900 hover:bg-blue-200"
                                : "bg-emerald-500 text-white hover:bg-emerald-600"
                        }
                    >
                        {allLabelsExtracted
                            ? "Re-extract all labels"
                            : "Extract text from all labels"}
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

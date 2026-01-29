import {Button} from "@/components/ui/button";
import {useLabelContext} from "./label-context";
export const LabelTextExtraction = () => {
    const {
        isLoading,
        handleExtractTextFromAllLabels,
        uploadedFiles,
        allLabelsExtracted,
    } = useLabelContext();

    const hasLabels = uploadedFiles.length > 0;
    const step2Active = hasLabels && !allLabelsExtracted;
    const step2Complete = allLabelsExtracted;
    const disableExtract = !hasLabels || allLabelsExtracted || isLoading;
    return (
        <div
            className={`mt-6 rounded-lg border border-dashed border-gray-200 p-4 text-center ${
                step2Active
                    ? "opacity-100 bg-emerald-50 text-gray-700"
                    : "opacity-50 text-gray-400"
            }`}
        >
            <div className="mb-3 text-sm">
                Step 2. Extract label text from all uploaded images
            </div>
            <Button
                onClick={handleExtractTextFromAllLabels}
                disabled={disableExtract}
                variant="secondary"
                className={
                    step2Active
                        ? "bg-emerald-500 text-white hover:bg-emerald-600"
                        : "bg-slate-100"
                }
            >
                {isLoading ? "Extracting..." : "Extract text from all labels"}
            </Button>
            {!hasLabels && (
                <div className="mt-2 text-xs">
                    Upload labels first to enable extraction.
                </div>
            )}
            {step2Complete && (
                <div className="mt-2 text-xs">Extraction complete.</div>
            )}
        </div>
    );
};

import {Button} from "@/components/ui/button";
import {useLabelContext} from "./label-context";
export const LabelTextExtraction = () => {
    const {
        isLoading,
        handleExtractTextFromAllLabels,
        uploadedFiles,
        allLabelsExtracted,
        applicationDataImportedByFile,
    } = useLabelContext();

    const hasImportedApplicationData = applicationDataImportedByFile.some(
        Boolean,
    );
    const hasLabels = uploadedFiles.length > 0;
    const step3Active = hasLabels && hasImportedApplicationData;
    const step3Complete = allLabelsExtracted;
    const disableExtract =
        !hasLabels || !hasImportedApplicationData || isLoading || step3Complete;
    return (
        <div
            className={`mt-6 rounded-lg border border-dashed border-gray-200 p-4 text-center ${
                step3Active && !step3Complete
                    ? "opacity-100 bg-emerald-50 text-gray-700"
                    : "opacity-50 text-gray-400"
            }`}
        >
            <div className="mb-3 text-sm">
                Step 3. Extract text from label text to compare with application
                data
            </div>
            <Button
                onClick={handleExtractTextFromAllLabels}
                disabled={disableExtract}
                variant="secondary"
                className={
                    !disableExtract
                        ? "bg-emerald-500 text-white hover:bg-emerald-600"
                        : "bg-slate-100"
                }
            >
                {isLoading ? "In progress..." : "Extract and compare"}
            </Button>
            {!hasLabels && (
                <div className="mt-2 text-xs">
                    Upload labels (step 1) and application data (step 2) first
                    to enable comparison.
                </div>
            )}
            {hasLabels && !hasImportedApplicationData && (
                <div className="mt-2 text-xs">
                    Upload application data (step 2) to enable comparison.
                </div>
            )}
            {step3Complete && (
                <div className="mt-2 text-sm">
                    Extraction and comparison completed!
                </div>
            )}
        </div>
    );
};

import {useLabelContext} from "./label-context";
import {LabelVerificationSteps} from "./label-verification-steps";
import {LabelUpload} from "./label-upload";
import {CsvJsonUpload} from "./csv-json-upload";
import {Button} from "@/components/ui/button";
export const LabelVerificationWorkflow = () => {
    const {
        error,
        importedApplicationErrors,
        uploadedFiles,
        allLabelsExtracted,
        isLoading,
        handleExtractTextFromAllLabels,
    } = useLabelContext();
    const hasLabels = uploadedFiles.length > 0;
    const step2Active = hasLabels && !allLabelsExtracted;
    const step2Complete = allLabelsExtracted;
    const disableExtract = !hasLabels || allLabelsExtracted || isLoading;

    return (
        <div className="flex flex-col items-center">
            <div className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                <h1 className=" py-4">Label verification workflow</h1>
                <LabelVerificationSteps />
                <LabelUpload />
                <div
                    className={`mt-6 rounded-lg border border-dashed border-gray-200 p-4 text-center ${
                        step2Active
                            ? "opacity-100"
                            : "opacity-50"
                    }`}
                >
                    <div className="mb-3 text-sm text-gray-600">
                        Step 2. Extract label text from all uploaded images
                    </div>
                    <Button
                        onClick={handleExtractTextFromAllLabels}
                        disabled={disableExtract}
                        variant="secondary"
                        className={
                            step2Active
                                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                : "bg-slate-100 text-slate-500"
                        }
                    >
                        {isLoading ? "Extracting..." : "Extract text from all labels"}
                    </Button>
                    {!hasLabels && (
                        <div className="mt-2 text-xs text-gray-400">
                            Upload labels first to enable extraction.
                        </div>
                    )}
                    {step2Complete && (
                        <div className="mt-2 text-xs text-gray-400">
                            Extraction complete.
                        </div>
                    )}
                </div>
                <CsvJsonUpload />
            </div>

            {error && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                    {error}
                </p>
            )}
            {importedApplicationErrors.length > 0 && (
                <div className="mt-2 text-sm text-red-600" role="alert">
                    {importedApplicationErrors.map((message, i) => (
                        <div key={i}>{message}</div>
                    ))}
                </div>
            )}
        </div>
    );
};

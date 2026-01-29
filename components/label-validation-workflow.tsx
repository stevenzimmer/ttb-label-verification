import {useEffect, useRef} from "react";
import {useLabelContext} from "./label-context";
import {LabelValidationSteps} from "./label-validation-steps";
import {LabelUpload} from "./label-upload";
import {CsvJsonUpload} from "./csv-json-upload";
import {Button} from "@/components/ui/button";
import {useToast} from "@/components/ui/use-toast";
export const LabelValidationWorkflow = () => {
    const {
        error,
        importedApplicationErrors,
        uploadedFiles,
        allLabelsExtracted,
        isLoading,
        handleExtractTextFromAllLabels,
    } = useLabelContext();
    const {toast} = useToast();
    const lastErrorRef = useRef<string | null>(null);
    const lastImportErrorsRef = useRef<string>("");
    const hasLabels = uploadedFiles.length > 0;
    const step2Active = hasLabels && !allLabelsExtracted;
    const step2Complete = allLabelsExtracted;
    const disableExtract = !hasLabels || allLabelsExtracted || isLoading;

    useEffect(() => {
        if (error && error !== lastErrorRef.current) {
            toast({
                variant: "default",
                title: "Validation error",
                description: error,
            });
            lastErrorRef.current = error;
        }
        if (!error) {
            lastErrorRef.current = null;
        }
    }, [error, toast]);

    useEffect(() => {
        if (importedApplicationErrors.length === 0) {
            lastImportErrorsRef.current = "";
            return;
        }
        const combinedErrors = importedApplicationErrors.join("||");
        if (combinedErrors !== lastImportErrorsRef.current) {
            importedApplicationErrors.forEach((message) => {
                toast({
                    variant: "default",
                    title: "Application data import error",
                    description: message,
                });
            });
            lastImportErrorsRef.current = combinedErrors;
        }
    }, [importedApplicationErrors, toast]);

    return (
        <div>
            <div className="px-6">
                <h1 className="mb-3">Label validation workflow</h1>
                <LabelValidationSteps />
            </div>
            <div className="flex flex-col items-center">
                <div className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                    <LabelUpload />
                    <div
                        className={`mt-6 rounded-lg border border-dashed border-gray-200 p-4 text-center ${
                            step2Active
                                ? "opacity-100 bg-emerald-50"
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
                            {isLoading
                                ? "Extracting..."
                                : "Extract text from all labels"}
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
            </div>
        </div>
    );
};

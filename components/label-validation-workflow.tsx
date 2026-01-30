import {useEffect, useRef} from "react";
import {useLabelContext} from "./label-context";
import {LabelValidationSteps} from "./label-verification-steps";
import {LabelUpload} from "./label-upload";
import {CsvJsonUpload} from "./csv-json-upload";
import {LabelTextExtraction} from "./label-text-extraction";
import {useToast} from "@/components/ui/use-toast";
export const LabelValidationWorkflow = () => {
    const {error, importedApplicationErrors} = useLabelContext();
    const {toast} = useToast();
    const lastErrorRef = useRef<string | null>(null);
    const lastImportErrorsRef = useRef<string>("");

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
                    title: message,
                });
            });
            lastImportErrorsRef.current = combinedErrors;
        }
    }, [importedApplicationErrors, toast]);

    return (
        <div className="lg:sticky lg:top-6 h-fit self-start">
            <div className="px-6">
                <h1 className="mb-3 font-semibold text-3xl">
                    Label validation workflow
                </h1>
                <LabelValidationSteps />
            </div>
            <div className="flex flex-col items-center">
                <div className="w-full p-3 lg:p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                    <LabelUpload />
                    <CsvJsonUpload />
                    <LabelTextExtraction />
                </div>
            </div>
        </div>
    );
};

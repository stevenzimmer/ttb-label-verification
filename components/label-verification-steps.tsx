import {Check} from "lucide-react";
import {useLabelContext} from "./label-context";

export const LabelVerificationSteps = () => {
    const {allLabelsExtracted, uploadedFiles, applicationDataImportedByFile} =
        useLabelContext();
    const hasImportedApplicationData = applicationDataImportedByFile.some(
        Boolean,
    );
    const currentStep =
        uploadedFiles.length === 0 ? 1 : allLabelsExtracted ? 3 : 2;
    const step1Complete = uploadedFiles.length > 0;
    const step2Complete = allLabelsExtracted;
    const step3Complete = hasImportedApplicationData;
    return (
        <ol className="mx-auto mb-6 space-y-2  text-gray-600">
            <li className="flex items-center gap-2">
                <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${
                        step1Complete || currentStep === 1
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                            : "border-gray-300 text-gray-700"
                    }`}
                >
                    {step1Complete ? (
                        <Check className="h-3.5 w-3.5" />
                    ) : (
                        "1"
                    )}
                </span>
                Upload label images
            </li>
            <li className="flex items-center gap-2">
                <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${
                        step2Complete || currentStep === 2
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                            : "border-gray-300 text-gray-700"
                    }`}
                >
                    {step2Complete ? (
                        <Check className="h-3.5 w-3.5" />
                    ) : (
                        "2"
                    )}
                </span>
                Verify the correct labels are uploaded and then click
                <strong>Extract text from all labels</strong> button
            </li>
            <li className="flex items-center gap-2">
                <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${
                        step3Complete || currentStep === 3
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                            : allLabelsExtracted
                            ? "border-emerald-300 text-emerald-700"
                            : "border-gray-300 text-gray-400"
                    }`}
                >
                    {step3Complete ? (
                        <Check className="h-3.5 w-3.5" />
                    ) : (
                        "3"
                    )}
                </span>
                Upload application data (CSV/JSON)
            </li>
        </ol>
    );
};

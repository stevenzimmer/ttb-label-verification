import {useLabelContext} from "./label-context";
import {LabelVerificationSteps} from "./label-verification-steps";
import {LabelUpload} from "./label-upload";
import {CsvJsonUpload} from "./csv-json-upload";
export const LabelVerificationWorkflow = () => {
    const {error, importedApplicationErrors} = useLabelContext();

    return (
        <div className="flex flex-col items-center">
            <div className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                <h1 className=" py-4">Label verification workflow</h1>
                <LabelVerificationSteps />
                <LabelUpload />
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

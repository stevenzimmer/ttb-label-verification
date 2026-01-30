import {useRef} from "react";
import {useLabelContext} from "@/components/label-context";
import {CsvJsonUploadDetails} from "./csv-json-upload-details";
export const CsvJsonUpload = () => {
    const {
        handleApplicationDataImport,
        setImportedApplicationErrors,
        allLabelsExtracted,
        uploadedFiles,
        applicationDataImportedByFile,
        applicationDataFileName,
        isLoading,
    } = useLabelContext();
    const hasImportedApplicationData = applicationDataImportedByFile.some(
        Boolean,
    );
    const appDataInputRef = useRef<HTMLInputElement | null>(null);

    const hasLabels = uploadedFiles.length > 0;
    const isDisabled = !hasLabels || hasImportedApplicationData || isLoading;
    return (
        <div
            className={`pt-4 text-center ${
                isDisabled
                    ? "opacity-50 text-gray-400"
                    : "opacity-100 text-gray-700"
            }`}
        >
            <label
                className={`block rounded-lg py-6 ${
                    isDisabled
                        ? "cursor-not-allowed"
                        : "opacity-100 cursor-pointer bg-emerald-50"
                }`}
                onClick={() => {
                    if (hasImportedApplicationData) {
                        setImportedApplicationErrors([
                            "Application data has already been uploaded.",
                        ]);
                        return;
                    }
                    if (!hasLabels) {
                        setImportedApplicationErrors([
                            "Upload label images before importing application data.",
                        ]);
                    }
                }}
            >
                <input
                    type="file"
                    className="hidden"
                    accept=".csv,.json,application/json,text/csv"
                    onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                            void handleApplicationDataImport(file);
                        }
                        event.currentTarget.value = "";
                    }}
                    ref={appDataInputRef}
                    disabled={isDisabled}
                />
                <div className="flex flex-col items-center gap-2">
                    <svg
                        className={`w-8 h-8 ${
                            isDisabled ? "text-gray-400" : "text-gray-700"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                    </svg>
                    <span className="text-base font-semibold">
                        Step 2. Import application data (CSV or JSON)
                    </span>
                    <CsvJsonUploadDetails />
                    {hasImportedApplicationData && (
                        <span className="text-sm text-gray-800 block bg-slate-100 p-3">
                            Application data uploaded
                            {applicationDataFileName
                                ? `: ${applicationDataFileName}`
                                : "."}
                        </span>
                    )}
                    {!hasLabels && (
                        <span className="text-xs text-gray-400 ">
                            Upload labels first to enable application data
                            import.
                        </span>
                    )}
                </div>
            </label>
        </div>
    );
};

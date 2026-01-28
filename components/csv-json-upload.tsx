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
    } = useLabelContext();
    const hasImportedApplicationData = applicationDataImportedByFile.some(
        Boolean,
    );
    const appDataInputRef = useRef<HTMLInputElement | null>(null);
    const isDisabled = !allLabelsExtracted || hasImportedApplicationData;
    return (
        <div
            className={`pt-4 text-center ${
                isDisabled ? "opacity-50" : "opacity-100"
            }`}
        >
            <label
                className={`block rounded-lg py-6 ${
                    isDisabled
                        ? "cursor-not-allowed"
                        : "opacity-100 cursor-pointer bg-emerald-50"
                }`}
                onClick={() => {
                    if (allLabelsExtracted && !hasImportedApplicationData) {
                        return;
                    }
                    if (hasImportedApplicationData) {
                        setImportedApplicationErrors([
                            "Application data has already been uploaded.",
                        ]);
                        return;
                    }
                    const message =
                        uploadedFiles.length === 0
                            ? "Upload label images before importing application data."
                            : "Extract label text before importing application data.";
                    setImportedApplicationErrors([message]);
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
                    disabled={!allLabelsExtracted || hasImportedApplicationData}
                />
                <div className="flex flex-col items-center gap-2">
                    <svg
                        className={`w-8 h-8 ${
                            isDisabled ? "text-gray-400" : "text-gray-500"
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
                    <span className="text-sm text-gray-600">
                        Step 3. Upload application data (CSV or JSON)
                    </span>
                    <CsvJsonUploadDetails />
                    {hasImportedApplicationData && (
                        <span className="text-xs text-gray-400">
                            Application data uploaded.
                        </span>
                    )}
                    {!allLabelsExtracted && uploadedFiles.length > 0 && (
                        <span className="text-xs text-gray-400 ">
                            Complete text extraction first to unlock application
                            upload.
                        </span>
                    )}
                    {!allLabelsExtracted && uploadedFiles.length === 0 && (
                        <span className="text-xs text-gray-400 ">
                            Upload labels first to begin extraction.
                        </span>
                    )}
                </div>
            </label>
        </div>
    );
};

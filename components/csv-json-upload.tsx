import {useRef} from "react";
import {useLabelContext} from "@/components/label-context";

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
    return (
        <div
            className={`mt-6 border-t border-gray-200 pt-4 text-center ${
                allLabelsExtracted && !hasImportedApplicationData
                    ? "opacity-100"
                    : "opacity-50"
            }`}
        >
            <label
                className={` block rounded-lg py-6 ${
                    !allLabelsExtracted || hasImportedApplicationData
                        ? "cursor-not-allowed "
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
                    <span className="text-sm text-gray-600">
                        Step 3. Upload application data (CSV or JSON)
                    </span>
                    <span className="text-xs text-gray-500">
                        Include a file_name column to match labels by filename.
                    </span>
                    {hasImportedApplicationData && (
                        <span className="text-xs text-gray-400">
                            Application data uploaded.
                        </span>
                    )}
                    {!allLabelsExtracted && uploadedFiles.length > 0 && (
                        <span className="text-xs text-gray-400">
                            Complete text extraction first to unlock application
                            upload.
                        </span>
                    )}
                    {!allLabelsExtracted && uploadedFiles.length === 0 && (
                        <span className="text-xs text-gray-400">
                            Upload labels first to begin extraction.
                        </span>
                    )}
                </div>
            </label>
        </div>
    );
};

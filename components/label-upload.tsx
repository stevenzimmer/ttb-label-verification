import {useRef} from "react";
import {useLabelContext} from "./label-context";

export const LabelUpload = () => {
    const {
        handleFilesUpload,
        allLabelsExtracted,
        uploadedFiles,
    } = useLabelContext();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    return (
        <label
            className={`block rounded-lg py-6 ${
                allLabelsExtracted
                    ? "cursor-not-allowed opacity-50"
                    : "opacity-100 cursor-pointer"
            } ${
                uploadedFiles.length > 0
                    ? "bg-transparent text-gray-400"
                    : "bg-emerald-50"
            }`}
        >
            <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFilesUpload}
                disabled={allLabelsExtracted}
                multiple
                ref={fileInputRef}
            />
            <div className="flex flex-col items-center gap-2">
                <svg
                    className={`w-8 h-8 ${
                        uploadedFiles.length > 0
                            ? "text-gray-400"
                            : "text-gray-500"
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
                <span
                    className={`text-sm ${
                        uploadedFiles.length > 0
                            ? "text-gray-400"
                            : "text-gray-600"
                    }`}
                >
                    Step 1. Click to upload labels
                </span>
                <span
                    className={`text-xs ${
                        uploadedFiles.length > 0
                            ? "text-gray-400"
                            : "text-gray-500"
                    }`}
                >
                    Checks on upload: images only, 1MB max per file, and no
                    duplicate filenames
                </span>
                <span
                    className={`text-xs ${
                        uploadedFiles.length > 0
                            ? "text-gray-400"
                            : "text-gray-500"
                    }`}
                >
                    Supports JPEG and PNG formats · batch upload allowed
                </span>
            </div>
        </label>
    );
};

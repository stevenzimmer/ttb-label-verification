import {useRef} from "react";
import {useLabelContext} from "./label-context";
export const ImageUpload = () => {
    const {handleFilesUpload, error} = useLabelContext();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    return (
        <div className="flex flex-col items-center">
            <div className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                <h1 className="text-center py-6">
                    Upload a label image to extract required TTB fields.
                </h1>
                <label className="cursor-pointer">
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFilesUpload}
                        multiple
                        ref={fileInputRef}
                    />
                    <div className="flex flex-col items-center gap-2">
                        <svg
                            className="w-8 h-8 text-gray-500"
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
                            Click to upload labels
                        </span>
                        <span className="text-xs text-gray-500">
                            Supports JPEG & PNG image formats
                        </span>
                    </div>
                </label>
            </div>
            {error && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};

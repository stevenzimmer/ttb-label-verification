"use client";
import {AcceptedLabelsDrawer} from "@/components/accepted-labels-drawer";
import {RejectedLabelsDrawer} from "@/components/rejected-labels-drawer";
import {useLabelContext} from "@/components/label-context";
import {LabelCards} from "@/components/label-cards";
import {LabelValidationWorkflow} from "@/components/label-validation-workflow";
import {LabelExtractionDrawer} from "@/components/label-extraction-drawer";
export const LabelValidationWrapper = () => {
    const {uploadedFiles} = useLabelContext();
    const hasUploadedFiles = uploadedFiles.length > 0;
    return (
        <div className="px-3 lg:px-0">
            <AcceptedLabelsDrawer />
            <RejectedLabelsDrawer />
            <LabelExtractionDrawer />
            <div
                className={`mx-auto py-16 px-6 ${
                    hasUploadedFiles ? "max-w-7xl" : "max-w-3xl"
                }`}
            >
                <div
                    className={
                        hasUploadedFiles ? "grid lg:grid-cols-2 gap-6" : ""
                    }
                >
                    <LabelValidationWorkflow />
                    {hasUploadedFiles && <LabelCards />}
                </div>
            </div>
        </div>
    );
};

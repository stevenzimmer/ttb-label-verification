import {LabelValidationWrapper} from "@/components/label-validation-wrapper";
import {LabelProvider} from "@/components/label-context";
import {LabelNav} from "@/components/label-nav";
export default function Home() {
    return (
        <div className="font-sans">
            {/* <LabelProvider> */}
            {/* <LabelNav /> */}
            {/* <LabelValidationWrapper /> */}
            {/* </LabelProvider> */}
            <div className="flex justify-center items-center w-full h-full py-20 bg-black text-white">
                <div>Test empty state</div>
            </div>
        </div>
    );
}

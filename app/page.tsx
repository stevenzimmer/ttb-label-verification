import {LabelValidationWrapper} from "@/components/label-validation-wrapper";
import {LabelProvider} from "@/components/label-context";
import {LabelNav} from "@/components/label-nav";
export default function Home() {
    return (
        <div className="font-sans dark:bg-black">
            <LabelProvider>
                <LabelNav />
                {/* <LabelValidationWrapper /> */}
            </LabelProvider>
        </div>
    );
}

import {LabelValidatorWrapper} from "@/components/label-validator-wrapper";
import {LabelProvider} from "@/components/label-context";
import {LabelNav} from "@/components/label-nav";
export default function Home() {
    return (
        <div className="font-sans dark:bg-black">
            <LabelProvider>
                <LabelNav />
                <LabelValidatorWrapper />
            </LabelProvider>
        </div>
    );
}

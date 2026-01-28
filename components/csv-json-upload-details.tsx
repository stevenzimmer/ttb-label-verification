export const CsvJsonUploadDetails = () => {
    return (
        <details className="w-full max-w-md rounded-md border border-dashed border-slate-200 bg-white/60 p-3 text-left text-xs text-slate-600">
            <summary className="cursor-pointer text-xs font-semibold text-slate-700">
                View CSV/JSON schema
            </summary>
            <div className="mt-2 space-y-2 text-[11px] leading-relaxed text-slate-600">
                <div className="font-semibold text-slate-700">
                    Required columns/keys
                </div>
                <div className="grid gap-1">
                    <code className="rounded bg-slate-100 px-2 py-1">
                        file_name: should match the uploaded file name
                    </code>
                    <code className="rounded bg-slate-100 px-2 py-1">
                        brand_name
                    </code>
                    <code className="rounded bg-slate-100 px-2 py-1">
                        class_type_designation
                    </code>
                    <code className="rounded bg-slate-100 px-2 py-1">
                        alcohol_content
                    </code>
                    <code className="rounded bg-slate-100 px-2 py-1">
                        net_contents
                    </code>
                    <code className="rounded bg-slate-100 px-2 py-1">
                        producer_name
                    </code>
                    <code className="rounded bg-slate-100 px-2 py-1">
                        producer_address
                    </code>
                    <code className="rounded bg-slate-100 px-2 py-1">
                        country_of_origin
                    </code>
                    <code className="rounded bg-slate-100 px-2 py-1">
                        gov_warning
                    </code>
                </div>
                <div className="font-semibold text-slate-700">
                    Example CSV row
                </div>
                <code className="block rounded bg-slate-100 px-2 py-1">
                    label-1.jpg,Old Tom,Whiskey,45% Alc./Vol.,750 mL,Old Tom
                    Distillery,Louisville, KY,USA,GOVERNMENT WARNING: ...
                </code>
                <div className="font-semibold text-slate-700">
                    Example JSON row
                </div>
                <code className="block rounded bg-slate-100 px-2 py-1">
                    {
                        '{ file_name: "label-1.jpg", brand_name: "Old Tom", class_type_designation: "Whiskey", alcohol_content: "45% Alc./Vol.", net_contents: "750 mL", producer_name: "Old Tom Distillery", producer_address: "Louisville, KY", country_of_origin: "USA", gov_warning: "GOVERNMENT WARNING: ..." }'
                    }
                </code>
            </div>
        </details>
    );
};

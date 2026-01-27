import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type {LabelExtraction} from "@/lib/label-extraction-schema";

export function LabelTable({data}: {data: LabelExtraction | null}) {
    if (!data) {
        return <div>No data available</div>;
    }
    const formatConfidence = (value: number) => {
        const rounded = Math.round(value * 100) / 100;
        let text = rounded.toFixed(2).replace(/\.?0+$/, "");
        if (text.startsWith("0.")) {
            text = text.slice(1);
        }
        return text;
    };
    const formatFieldName = (key: string) =>
        key
            .split("_")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ");
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-1/3">Field</TableHead>
                    <TableHead className="w-1/3">Extracted Value</TableHead>
                    <TableHead className="w-1/3">Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {Object.entries(data).map(([key, item], i) => (
                    <TableRow key={i}>
                        <TableCell className="font-medium whitespace-normal break-words">
                            {formatFieldName(key)}
                        </TableCell>
                        <TableCell className="whitespace-normal break-words">
                            {item.value}
                        </TableCell>
                        <TableCell>
                            {item.confidence > 0.7
                                ? `✅ Match (${formatConfidence(item.confidence)})`
                                : item.confidence > 0.4
                                  ? `⚠️ Review (${formatConfidence(item.confidence)})`
                                  : `❌ Issue (${formatConfidence(item.confidence)})`}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

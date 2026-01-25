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
                            {key}
                        </TableCell>
                        <TableCell className="whitespace-normal break-words">
                            {item.value}
                        </TableCell>
                        <TableCell>
                            {item.confidence > 0.7
                                ? "✅ Match"
                                : item.confidence > 0.4
                                ? "⚠️ Review"
                                : "❌ Issue"}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

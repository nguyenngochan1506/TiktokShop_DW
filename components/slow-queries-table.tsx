"use client";

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { AlertTriangleIcon, ZapIcon } from "lucide-react";

interface IndexUsageItem {
  table_name: string;
  full_scans: number;
  index_scans: number;
}

export const SlowQueriesTable = ({ data }: { data: IndexUsageItem[] }) => {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-success gap-2 py-8">
        <ZapIcon size={48} />
        <p>Excellent! No frequent full table scans detected.</p>
      </div>
    );
  }

  return (
    <Table aria-label="Slow Queries" removeWrapper>
      <TableHeader>
        <TableColumn>TABLE</TableColumn>
        <TableColumn>FULL SCANS</TableColumn>
        <TableColumn>INDEX SCANS</TableColumn>
      </TableHeader>
      <TableBody>
        {data.map((item, idx) => (
          <TableRow key={idx}>
            <TableCell className="font-mono text-sm">{item.table_name}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1 text-danger">
                <AlertTriangleIcon size={14} />
                {item.full_scans}
              </div>
            </TableCell>
            <TableCell>{item.index_scans}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
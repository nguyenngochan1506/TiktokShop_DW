"use client";

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";

export const ProductVersionHistoryTable = ({ versions }: { versions: any[] }) => {
  return (
    <Table aria-label="Version history" removeWrapper>
      <TableHeader>
        <TableColumn>VALID FROM</TableColumn>
        <TableColumn>VALID TO</TableColumn>
        <TableColumn>STATUS</TableColumn>
        <TableColumn>TITLE SNAPSHOT</TableColumn>
      </TableHeader>
      <TableBody emptyContent="No history data">
        {versions.map((ver: any, idx: number) => (
          <TableRow key={idx}>
            <TableCell>
              {ver.valid_from ? new Date(ver.valid_from).toLocaleString("vi-VN") : "N/A"}
            </TableCell>
            <TableCell>
              {ver.valid_to && new Date(ver.valid_to).getFullYear() < 9000
                ? new Date(ver.valid_to).toLocaleString("vi-VN")
                : "∞"}
            </TableCell>
            <TableCell>
              <Chip
                size="sm"
                color={ver.is_current ? "success" : "default"}
                variant="flat"
              >
                {ver.is_current ? "Current" : "Historical"}
              </Chip>
            </TableCell>
            <TableCell>
              <div className="max-w-[400px] truncate text-default-500 italic" title={ver.title}>
                {ver.title}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
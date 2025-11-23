"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/table';
import { Chip } from '@heroui/chip';
import { Pagination } from "@heroui/pagination";

interface Log {
  id: number;
  file_name: string;
  record_count: number | null;
  status: string;
  error_message: string | null;
  created_at: Date | null;
  source_config: { source_name: string };
}

export const LogsTable = ({ logs, totalPages }: { logs: Log[], totalPages: number }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Table 
      aria-label="Crawl logs table"
      bottomContent={
        totalPages > 1 && (
          <div className="flex w-full justify-center">
             <Pagination isCompact showControls page={currentPage} total={totalPages} onChange={handlePageChange} />
          </div>
        )
      }
    >
      <TableHeader>
        <TableColumn>ID</TableColumn>
        <TableColumn>SOURCE</TableColumn>
        <TableColumn>FILE NAME</TableColumn>
        <TableColumn>RECORDS</TableColumn>
        <TableColumn>STATUS</TableColumn>
        <TableColumn>TIME</TableColumn>
      </TableHeader>
      <TableBody emptyContent="No logs found">
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell>#{log.id}</TableCell>
            <TableCell className="font-bold text-small">{log.source_config?.source_name}</TableCell>
            <TableCell>{log.file_name}</TableCell>
            <TableCell>{log.record_count ?? 0}</TableCell>
            <TableCell>
              <Chip color={log.status === "SUCCESS" ? "success" : log.status === "FAILED" ? "danger" : "warning"} size="sm" variant="flat">
                {log.status}
              </Chip>
              {log.error_message && <div className="text-tiny text-danger max-w-[200px] truncate" title={log.error_message}>{log.error_message}</div>}
            </TableCell>
            <TableCell>{log.created_at ? new Date(log.created_at).toLocaleString('vi-VN') : ""}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/table';
import { Chip, ChipProps } from '@heroui/chip'; // Import thêm ChipProps để type
import { Pagination } from "@heroui/pagination";

interface Log {
  id: number;
  file_name: string;
  file_path: string;
  record_count: number | null;
  status: string;
  error_message: string | null;
  created_at: Date | null;
  source_config: { id: string };
}

const STATUS_MAP: Record<string, { label: string; color: ChipProps["color"] }> = {
  SUCCESS: { label: "THÀNH CÔNG", color: "success" },
  FAILED: { label: "THẤT BẠI", color: "danger" },
  PENDING: { label: "ĐANG CHỜ", color: "warning" },
  RUNNING: { label: "ĐANG CHẠY", color: "primary" }, 
};

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

  const renderStatus = (status: string) => {
    const normalizedStatus = status?.toUpperCase() || "";
    
    const config = STATUS_MAP[normalizedStatus];

    if (config) {
      return (
        <Chip color={config.color} size="sm" variant="flat">
          {config.label}
        </Chip>
      );
    }

    return (
      <Chip color="default" size="sm" variant="flat">
        {status || "UNKNOWN"}
      </Chip>
    );
  };

  return (
    <Table 
      aria-label="Bảng lịch sử crawl"
      className="font-sans"
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
        <TableColumn>ID NGUỒN</TableColumn>
        <TableColumn>TÊN FILE</TableColumn>
        <TableColumn>ĐƯỜNG DẪN FILE</TableColumn>
        <TableColumn>SỐ BẢN GHI</TableColumn>
        <TableColumn>TRẠNG THÁI</TableColumn>
        <TableColumn>THỜI GIAN</TableColumn>
      </TableHeader>
      <TableBody emptyContent="Không tìm thấy logs nào">
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell>#{log.id}</TableCell>
            <TableCell className="font-bold text-small">#{log.source_config?.id}</TableCell>
            <TableCell>{log.file_name}</TableCell>
            <TableCell>{log.file_path}</TableCell>
            <TableCell>{log.record_count ?? 0}</TableCell>
            <TableCell>
              {renderStatus(log.status)}
              
              {log.error_message && <div className="text-tiny text-danger max-w-[200px] truncate" title={log.error_message}>{log.error_message}</div>}
            </TableCell>
            <TableCell>{log.created_at ? new Date(log.created_at).toLocaleString('vi-VN') : ""}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
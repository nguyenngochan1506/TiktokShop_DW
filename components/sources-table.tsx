"use client";

import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/table';
import { Chip } from '@heroui/chip';
import { Tooltip } from '@heroui/tooltip'
import { EditIcon, TrashIcon, RefreshCwIcon } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Pagination } from '@heroui/pagination'
import { EditSourceModal } from '@/components/edit-source-modal';
import { deleteSource, triggerCrawl } from '@/app/actions/sources';
import { useState } from 'react';
import { Button } from '@heroui/button';

interface SourcesTableProps {
    sources: any[];
    totalPages: number;
}

const statusColorMap: Record<string, "success" | "danger" | "warning"> = {
    SUCCESS: "success",
    FAILED: "danger",
    PENDING: "warning",
};

export const SourcesTable = ({ sources, totalPages }: SourcesTableProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [triggeringId, setTriggeringId] = useState<number | null>(null); 
    const [isDeleting, setIsDeleting] = useState<number | null>(null); // State cho nút xóa

    const currentPage = Number(searchParams.get("page")) || 1;

    const formatDate = (date: Date | null) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleString('vi-VN');
    };

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", page.toString());
        router.push(`${pathname}?${params.toString()}`);
    };
    
    // Thay thế `confirm()` bằng một thông báo console và tiến hành xóa
    const handleDelete = async (id: number, sourceName: string) => {
        // NOTE: Trong môi trường thực, cần dùng Modal UI thay vì confirm
        if (window.confirm(`Bạn có chắc chắn muốn xóa nguồn dữ liệu "${sourceName}" không? Hành động này không thể hoàn tác.`)) {
            setIsDeleting(id);
            await deleteSource(id);
            setIsDeleting(null);
            // Sau khi xóa, làm mới trang
            router.refresh(); 
        }
    };

    const handleTriggerCrawl = async (id: number) => {
        setTriggeringId(id);
        const result = await triggerCrawl(id);
        if (result.error) {
            // Thay thế alert() bằng console.error
            console.error("Lỗi kích hoạt crawl:", result.error);
        }
        setTriggeringId(null);
        // Sau khi kích hoạt, làm mới trang để cập nhật trạng thái
        router.refresh();
    };

    return (
        <Table
            aria-label="Bảng cấu hình nguồn dữ liệu"
            className="font-sans"
            bottomContent={
                totalPages > 1 ? (
                    <div className="flex w-full justify-center">
                        <Pagination
                            isCompact
                            showControls
                            showShadow
                            color="primary"
                            page={currentPage}
                            total={totalPages}
                            onChange={handlePageChange}
                        />
                    </div>
                ) : null
            }
        >
            <TableHeader>
                <TableColumn>ID</TableColumn>
                <TableColumn>TÊN NGUỒN</TableColumn>
                <TableColumn>TRẠNG THÁI</TableColumn>
                <TableColumn>LẦN CRAWL CUỐI</TableColumn>
                <TableColumn>HÀNH ĐỘNG</TableColumn>
            </TableHeader>
            <TableBody emptyContent={"Không có dòng nào để hiển thị."}>
                {sources.map((source) => (
                    <TableRow key={source.id}>
                        <TableCell>#{source.id}</TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="font-bold text-sm">{source.source_name}</span>
                                <span className="text-tiny text-default-400 truncate max-w-[200px]">
                                    {source.base_url}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Chip
                                className="capitalize"
                                color={source.is_active ? "success" : "default"}
                                size="sm"
                                variant="flat"
                            >
                                {source.is_active ? "Hoạt động" : "Ngừng hoạt động"}
                            </Chip>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col gap-1">
                                <Chip
                                    size="sm"
                                    color={statusColorMap[source.last_crawl_status || "PENDING"] || "default"}
                                    variant="dot"
                                >
                                    {source.last_crawl_status || "Chưa chạy"}
                                </Chip>
                                <span className="text-tiny text-default-400">
                                    {formatDate(source.last_crawl_timestamp)}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <EditSourceModal source={source} />
                                <Tooltip color="danger" content="Xóa nguồn">
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        color="danger"
                                        onPress={() => handleDelete(source.id, source.source_name)}
                                        isLoading={isDeleting === source.id}
                                        disabled={isDeleting === source.id}
                                        className="text-lg text-danger cursor-pointer active:opacity-50 hover:opacity-100"
                                    >
                                        <TrashIcon size={18} />
                                    </Button>
                                </Tooltip>
                                <Tooltip content="Kích hoạt Crawl">
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        color="primary"
                                        onPress={() => handleTriggerCrawl(source.id)}
                                        isLoading={triggeringId === source.id}
                                        disabled={triggeringId === source.id}
                                        className="text-lg text-primary cursor-pointer active:opacity-50 hover:opacity-100"
                                    >
                                        <RefreshCwIcon size={18} className={triggeringId === source.id ? 'animate-spin' : ''} />
                                    </Button>
                                </Tooltip>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
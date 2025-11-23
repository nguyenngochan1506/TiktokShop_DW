"use client";

import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/table';
import { Chip } from '@heroui/chip';
import { Tooltip } from '@heroui/tooltip'
import { EditIcon, TrashIcon, RefreshCwIcon } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Pagination } from '@heroui/pagination'
import { deleteSource } from '../actions/sources';
import { EditSourceModal } from '@/components/edit-source-modal';

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
    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this source?")) {
            await deleteSource(id);
        }
    };

    return (
        <Table
            aria-label="Source configs table"
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
                <TableColumn>SOURCE NAME</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>LAST CRAWL</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent={"No rows to display."}>
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
                                {source.is_active ? "Active" : "Inactive"}
                            </Chip>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col gap-1">
                                <Chip
                                    size="sm"
                                    color={statusColorMap[source.last_crawl_status || "PENDING"] || "default"}
                                    variant="dot"
                                >
                                    {source.last_crawl_status || "N/A"}
                                </Chip>
                                <span className="text-tiny text-default-400">
                                    {formatDate(source.last_crawl_timestamp)}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <EditSourceModal source={source} />
                                <Tooltip color="danger" content="Delete source">
                                    <span
                                        className="text-lg text-danger cursor-pointer active:opacity-50 hover:opacity-100"
                                        onClick={() => handleDelete(source.id)}
                                    >
                                        <TrashIcon size={18} />
                                    </span>
                                </Tooltip>
                                <Tooltip content="Trigger Crawl">
                                    <span className="text-lg text-primary cursor-pointer active:opacity-50 hover:opacity-100">
                                        <RefreshCwIcon size={18} />
                                    </span>
                                </Tooltip>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
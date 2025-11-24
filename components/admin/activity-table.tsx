"use client";

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { User } from "@heroui/user";
import { Pagination } from "@heroui/pagination";
import { Select, SelectItem } from "@heroui/select";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface ActivityTableProps {
    logs: any[];
    totalCount: number;
    users: any[];
}

export const ActivityTable = ({ logs, totalCount, users }: ActivityTableProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const userId = searchParams.get("userId") || "";

    const totalPages = Math.ceil(totalCount / limit);

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }

            if (name !== "page") {
                params.set("page", "1");
            }

            return params.toString();
        },
        [searchParams]
    );

    const handlePageChange = (newPage: number) => {
        router.push(`${pathname}?${createQueryString("page", newPage.toString())}`);
    };

    const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.push(`${pathname}?${createQueryString("userId", e.target.value)}`);
    };

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.push(`${pathname}?${createQueryString("limit", e.target.value)}`);
    };

    const topContent = (
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 items-end sm:items-center">
            <span className="text-default-400 text-small">
                Tổng cộng: {new Intl.NumberFormat('vi-VN').format(totalCount)} dòng
            </span>

            <div className="flex gap-3 items-end">
                <Select
                    label="Lọc theo Thành Viên"
                    className="w-full sm:w-60"
                    size="sm"
                    selectedKeys={userId ? [userId] : []}
                    onChange={handleUserChange}
                    items={[{ id: "", name: "Tất cả Thành Viên", email: "" }, ...users]}
                >
                    {(user) => (
                        <SelectItem key={user.id} textValue={user.name || user.email || "Tất cả Thành Viên"}>
                            <div className="flex gap-2 items-center">
                                <div className="flex flex-col">
                                    <span className="text-small">{user.name}</span>
                                    {user.email && <span className="text-tiny text-default-400">{user.email}</span>}
                                </div>
                            </div>
                        </SelectItem>
                    )}
                </Select>


                {/* Chỉnh số lượng hiển thị (Limit) */}
                <Select
                    label="Hiển thị"
                    className="w-24 sm:w-28"
                    size="sm"
                    selectedKeys={[limit.toString()]}
                    onChange={handleLimitChange}
                    disallowEmptySelection
                >
                    {/* Bỏ prop value, chỉ giữ lại key */}
                    <SelectItem key="10">10</SelectItem>
                    <SelectItem key="20">20</SelectItem>
                    <SelectItem key="50">50</SelectItem>
                    <SelectItem key="100">100</SelectItem>
                </Select>
            </div>
        </div>
    );

    // Phần phân trang phía dưới
    const bottomContent = totalPages > 1 ? (
        <div className="flex w-full justify-center mt-4">
            <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={totalPages}
                onChange={handlePageChange}
            />
        </div>
    ) : null;

    return (
        <div>
            {topContent}

            <Table aria-label="Bảng nhật ký hoạt động" className="font-sans" bottomContent={bottomContent}>
                <TableHeader>
                    <TableColumn>THỜI GIAN</TableColumn>
                    <TableColumn>NGƯỜI THỰC HIỆN</TableColumn>
                    <TableColumn>HÀNH ĐỘNG</TableColumn>
                    <TableColumn>CHI TIẾT</TableColumn>
                </TableHeader>
                <TableBody items={logs} emptyContent="Chưa có hoạt động nào được ghi nhận.">
                    {(log) => (
                        <TableRow key={log.id}>
                            <TableCell className="whitespace-nowrap">
                                <div className="flex flex-col">
                                    <span className="text-small font-semibold">
                                        {log.created_at ? new Date(log.created_at).toLocaleTimeString('vi-VN') : ""}
                                    </span>
                                    <span className="text-tiny text-default-400">
                                        {log.created_at ? new Date(log.created_at).toLocaleDateString('vi-VN') : ""}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <User
                                    name={log.user?.name || "Unknown"}
                                    description={log.user_email}
                                    avatarProps={{ size: "sm", radius: "sm" }}
                                />
                            </TableCell>
                            <TableCell>
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    color={
                                        log.action === 'CREATE' || log.action === 'LOGIN' ? 'success' :
                                            log.action === 'DELETE' ? 'danger' :
                                                log.action === 'UPDATE' ? 'warning' :
                                                    'default'
                                    }
                                >
                                    <span className="font-semibold">{log.action}</span>: {log.entity}
                                </Chip>
                            </TableCell>
                            <TableCell>
                                <div className="max-w-xs text-sm text-default-600 truncate" title={log.details}>
                                    {log.details}
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
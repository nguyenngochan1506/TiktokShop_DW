"use client"; 

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";

export const RecentLogsTable = ({ logs }: { logs: any[] }) => {
    return (
        <Table aria-label="Logs gần đây" removeWrapper className="font-sans">
            <TableHeader>
                <TableColumn>TÊN NGUỒN</TableColumn>
                <TableColumn>ID NGUỒN</TableColumn>
                <TableColumn>TRẠNG THÁI</TableColumn>
            </TableHeader>
            <TableBody emptyContent="Không có hoạt động gần đây">
                {logs.map((log) => (
                    <TableRow key={log.id}>
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="text-small font-bold">
                                    {log.source_config?.source_name || "Nguồn không rõ"}
                                </span>
                                <span className="text-tiny text-default-400">
                                    {log.created_at
                                        ? new Date(log.created_at).toLocaleTimeString("vi-VN")
                                        : ""}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="text-small font-bold">
                                    #{log.source_config?.id || "Nguồn không rõ"}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Chip
                                size="sm"
                                variant="dot"
                                color={
                                    log.status === "SUCCESS"
                                        ? "success"
                                        : log.status === "FAILED"
                                            ? "danger"
                                            : "warning"
                                }
                            >
                                {log.status === "SUCCESS" ? "THÀNH CÔNG" : log.status === "FAILED" ? "THẤT BẠI" : "ĐANG CHẠY"}
                            </Chip>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
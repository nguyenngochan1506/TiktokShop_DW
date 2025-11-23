"use client"; 

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";

export const RecentLogsTable = ({ logs }: { logs: any[] }) => {
    return (
        <Table aria-label="Recent logs" removeWrapper>
            <TableHeader>
                <TableColumn>SOURCE_NAME</TableColumn>
                <TableColumn>SOURCE_ID</TableColumn>
                <TableColumn>STATUS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No recent activity">
                {logs.map((log) => (
                    <TableRow key={log.id}>
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="text-small font-bold">
                                    {log.source_config?.source_name || "Unknown Source"}
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
                                    #{log.source_config?.id || "Unknown Source"}
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
                                {log.status}
                            </Chip>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
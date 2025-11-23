"use client";

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { CheckCircleIcon, AlertOctagonIcon } from "lucide-react";

interface CheckItem {
    scope: string;
    table: string;
    rule: string;
    description: string;
    failed_count: number;
    severity: string;
}

export const DataQualityTable = ({ checks }: { checks: CheckItem[] }) => {
    return (
        <Table aria-label="Bảng Chất Lượng Dữ Liệu (DQ)" removeWrapper className="font-sans">
            <TableHeader>
                <TableColumn>TRẠNG THÁI</TableColumn>
                <TableColumn>PHẠM VI (SCOPE)</TableColumn>
                <TableColumn>QUY TẮC</TableColumn>
                <TableColumn>MÔ TẢ</TableColumn>
                <TableColumn>BẢN GHI LỖI</TableColumn>
                <TableColumn>MỨC ĐỘ</TableColumn>
            </TableHeader>
            <TableBody emptyContent="Không có kiểm tra DQ nào được định nghĩa.">
                {checks.map((check, idx) => (
                    <TableRow key={idx}>
                        <TableCell>
                            {check.failed_count === 0 ? (
                                <CheckCircleIcon size={20} className="text-success" />
                            ) : (
                                <AlertOctagonIcon size={20} className="text-danger" />
                            )}
                        </TableCell>
                        <TableCell>{check.scope}</TableCell>
                        <TableCell className="font-bold">{check.rule}</TableCell>
                        <TableCell className="text-default-500 text-sm">{check.description}</TableCell>
                        <TableCell>
                            <span className={check.failed_count > 0 ? "font-bold text-danger" : "text-default-400"}>
                                {new Intl.NumberFormat('vi-VN').format(check.failed_count)}
                            </span>
                        </TableCell>
                        <TableCell>
                            <Chip
                                size="sm"
                                variant="flat"
                                color={
                                    check.severity === "CRITICAL" ? "danger" :
                                        check.severity === "HIGH" ? "warning" : "default"
                                }
                            >
                                {check.severity === "CRITICAL" ? "NGHIÊM TRỌNG" : 
                                 check.severity === "HIGH" ? "CAO" :
                                 check.severity === "MEDIUM" ? "TRUNG BÌNH" : "THẤP"}
                            </Chip>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
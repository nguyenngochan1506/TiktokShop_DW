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
        <Table aria-label="DQ Table" removeWrapper>
            <TableHeader>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>SCOPE</TableColumn>
                <TableColumn>RULE NAME</TableColumn>
                <TableColumn>DESCRIPTION</TableColumn>
                <TableColumn>FAILED RECORDS</TableColumn>
                <TableColumn>SEVERITY</TableColumn>
            </TableHeader>
            <TableBody>
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
                                {check.severity}
                            </Chip>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
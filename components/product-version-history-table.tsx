"use client";

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { GitCompareIcon, EyeIcon } from "lucide-react";
import { useState } from "react";
import { VersionDiffModal } from "./version-diff-modal";
import { Tooltip } from "@heroui/tooltip";

// Giả định props versions đã được sắp xếp giảm dần (Mới nhất -> Cũ nhất) từ Server
export const ProductVersionHistoryTable = ({ versions }: { versions: any[] }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVerIndex, setSelectedVerIndex] = useState<number>(-1);

    // Hàm mở modal so sánh
    const handleCompare = (index: number) => {
        setSelectedVerIndex(index);
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setSelectedVerIndex(-1);
    };

    // Xác định phiên bản để so sánh
    // selectedVer = versions[index]
    // previousVer = versions[index + 1] (Vì mảng sort giảm dần, index lớn hơn là bản ghi cũ hơn)
    const currentVer = selectedVerIndex >= 0 ? versions[selectedVerIndex] : null;
    const previousVer = selectedVerIndex >= 0 && selectedVerIndex < versions.length - 1
        ? versions[selectedVerIndex + 1]
        : null;

    return (
        <>
            <Table aria-label="Version history" removeWrapper>
                <TableHeader>
                    <TableColumn>VALID FROM</TableColumn>
                    <TableColumn>VALID TO</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>TITLE SNAPSHOT</TableColumn>
                    <TableColumn align="end">ACTIONS</TableColumn>
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
                                <div className="max-w-[300px] truncate text-default-500 italic" title={ver.title}>
                                    {ver.title}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex justify-end gap-2">
                                    {/* Chỉ hiện nút Compare nếu không phải là bản ghi cuối cùng (cũ nhất) */}
                                    {idx < versions.length - 1 ? (
                                        <Tooltip content="Compare with previous version">
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                color="primary"
                                                onPress={() => handleCompare(idx)}
                                            >
                                                <GitCompareIcon size={18} />
                                            </Button>
                                        </Tooltip>
                                    ) : (
                                        <Tooltip content="Original Version (No history)">
                                            <Button isIconOnly size="sm" variant="light" disabled className="opacity-30 cursor-not-allowed">
                                                <EyeIcon size={18} />
                                            </Button>
                                        </Tooltip>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Modal So Sánh */}
            <VersionDiffModal
                isOpen={isModalOpen}
                onClose={handleClose}
                currentVersion={currentVer}
                previousVersion={previousVer}
            />
        </>
    );
};
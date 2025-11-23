"use client";

import { Button } from "@heroui/button";
import { DownloadIcon } from "lucide-react";
import * as XLSX from "xlsx";

interface DownloadBtnProps {
    data: any[];
    fileName?: string;
    label?: string;
    color?: "primary" | "secondary" | "success" | "warning" | "danger" | "default";
}

export const DownloadBtn = ({
    data,
    fileName = "export-data",
    label = "Export Excel",
    color = "primary",
}: DownloadBtnProps) => {
    const handleExport = () => {
        if (!data || data.length === 0) {
            alert("No data to export");
            return;
        }

        // 1. Tạo Worksheet từ JSON
        const worksheet = XLSX.utils.json_to_sheet(data);

        // 2. Tạo Workbook và thêm Worksheet vào
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        // 3. Xuất file
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    };

    return (
        <Button
            color={color}
            variant="flat"
            startContent={<DownloadIcon size={18} />}
            onPress={handleExport}
            size="sm"
        >
            {label}
        </Button>
    );
};
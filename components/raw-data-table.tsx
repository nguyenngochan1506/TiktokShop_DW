"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Button } from "@heroui/button";
import { EyeIcon } from "lucide-react";
import dynamic from "next/dynamic";

// Import động để tránh lỗi SSR (Server Side Rendering) vì thư viện này cần window
const ReactJson = dynamic(() => import("react-json-view"), { ssr: false });

interface RawProduct {
    id: string;
    product_id: string;
    source_file_name: string | null;
    load_timestamp: string;
    raw_data: any;
}

export const RawDataTable = ({
    data,
    totalPages
}: {
    data: RawProduct[];
    totalPages: number
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedJson, setSelectedJson] = useState<any>(null);

    const currentPage = Number(searchParams.get("page")) || 1;

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", page.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleViewJson = (json: any) => {
        setSelectedJson(json);
        onOpen();
    };

    return (
        <>
            <Table
                aria-label="Bảng dữ liệu sản phẩm thô"
                className="font-sans"
                bottomContent={
                    totalPages > 1 && (
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
                    )
                }
            >
                <TableHeader>
                    <TableColumn>ID</TableColumn>
                    <TableColumn>ID SẢN PHẨM</TableColumn>
                    <TableColumn>FILE NGUỒN</TableColumn>
                    <TableColumn>THỜI GIAN NẠP</TableColumn>
                    <TableColumn>HÀNH ĐỘNG</TableColumn>
                </TableHeader>
                <TableBody emptyContent="Không tìm thấy dữ liệu thô nào">
                    {data.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>#{item.id}</TableCell>
                            <TableCell className="font-semibold">{item.product_id}</TableCell>
                            <TableCell>{item.source_file_name || "N/A"}</TableCell>
                            <TableCell>{item.load_timestamp ? new Date(item.load_timestamp).toLocaleString('vi-VN') : ''}</TableCell>
                            <TableCell>
                                <Button
                                    size="sm"
                                    variant="flat"
                                    color="primary"
                                    isIconOnly
                                    onPress={() => handleViewJson(item.raw_data)}
                                    title="Xem JSON thô"
                                >
                                    <EyeIcon size={18} />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* JSON Viewer Modal */}
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size="5xl" // Tăng size modal để xem cho thoải mái
                scrollBehavior="inside"
            >
                <ModalContent className="font-sans">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Trình Kiểm Tra JSON Thô</ModalHeader>
                            <ModalBody className="p-0">
                                {/* p-0 để viewer full viền */}
                                <div className="min-h-[400px] max-h-[70vh] overflow-auto bg-[#1e1e1e]">
                                    {selectedJson && (
                                        <ReactJson
                                            src={
                                                typeof selectedJson === 'string'
                                                    ? JSON.parse(selectedJson)
                                                    : (selectedJson || {})
                                            }
                                            theme="monokai"
                                            collapsed={1}
                                            displayDataTypes={false}
                                            enableClipboard={true}
                                            style={{ padding: '20px', backgroundColor: 'transparent' }}
                                        />
                                    )}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Đóng
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};
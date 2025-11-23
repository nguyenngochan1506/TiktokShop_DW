"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Trash2Icon, AlertTriangleIcon } from "lucide-react";
import { purgeOldData } from "@/app/actions/settings";
import { Tooltip } from "@heroui/tooltip"; // Import Tooltip để thay thế thông báo alert

export default function MaintenancePanel() {
  const [rawDays, setRawDays] = useState("30");
  const [logDays, setLogDays] = useState("60");
  const [isLoadingRaw, setIsLoadingRaw] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePurge = async (target: 'RAW' | 'LOGS') => {
    const days = target === 'RAW' ? Number(rawDays) : Number(logDays);
    const targetName = target === 'RAW' ? 'Dữ liệu Thô (Raw Data)' : 'Logs Hệ thống';

    setSuccessMessage(null);
    setErrorMessage(null);

    // Thay thế confirm() bằng window.confirm để giữ nguyên logic xác nhận nguy hiểm
    if (!window.confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN ${targetName} cũ hơn ${days} ngày không? Hành động này không thể hoàn tác.`)) {
      return;
    }

    if (target === 'RAW') setIsLoadingRaw(true);
    else setIsLoadingLogs(true);

    const res = await purgeOldData(days, target);

    if (res.success) {
      setSuccessMessage(`Đã xóa thành công ${res.count} bản ghi khỏi ${targetName}.`);
    } else {
      setErrorMessage(`Lỗi: Không thể xóa dữ liệu ${targetName}.`);
      console.error(`Lỗi xóa dữ liệu ${targetName}:`, res.error);
    }

    if (target === 'RAW') setIsLoadingRaw(false);
    else setIsLoadingLogs(false);
  };

  return (
    <Card className="border border-danger-100 dark:border-danger-900/30 font-sans">
      <CardHeader className="flex gap-3">
        <AlertTriangleIcon className="text-danger" />
        <div className="flex flex-col">
          <p className="text-md font-bold text-danger">Lưu Trữ & Bảo Trì Dữ Liệu</p>
          <p className="text-small text-default-500">Dọn dẹp dữ liệu cũ để tiết kiệm không gian lưu trữ.</p>
        </div>
      </CardHeader>
      <CardBody className="gap-6">

        {/* Messages */}
        {successMessage && (
          <div className="p-3 bg-success-50 border border-success-200 text-success-700 rounded-lg text-sm">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="p-3 bg-danger-50 border border-danger-200 text-danger-700 rounded-lg text-sm">
            {errorMessage}
          </div>
        )}

        {/* Purge Raw Data */}
        <div className="flex items-end gap-4">
          <Input
            label="Xóa Dữ Liệu Thô (Raw Data) cũ hơn (ngày)"
            type="number"
            value={rawDays}
            onValueChange={setRawDays}
            variant="bordered"
            className="max-w-xs"
            placeholder="Số ngày"
          />
          <Tooltip content={"Xóa vĩnh viễn dữ liệu thô cũ hơn số ngày quy định."}>
            <Button
              color="danger"
              variant="flat"
              startContent={<Trash2Icon size={18} />}
              isLoading={isLoadingRaw}
              onPress={() => handlePurge('RAW')}
            >
              Dọn Dẹp Dữ Liệu Thô
            </Button>
          </Tooltip>
        </div>

        {/* Purge Logs */}
        <div className="flex items-end gap-4">
          <Input
            label="Xóa Logs Hệ thống cũ hơn (ngày)"
            type="number"
            value={logDays}
            onValueChange={setLogDays}
            variant="bordered"
            className="max-w-xs"
            placeholder="Số ngày"
          />
          <Tooltip content={"Xóa vĩnh viễn các bản ghi logs hệ thống cũ hơn số ngày quy định."}>
            <Button
              color="warning"
              variant="flat"
              startContent={<Trash2Icon size={18} />}
              isLoading={isLoadingLogs}
              onPress={() => handlePurge('LOGS')}
            >
              Dọn Dẹp Logs Hệ Thống
            </Button>
          </Tooltip>
        </div>
      </CardBody>
    </Card >
  );
}
"use client";

import { useState, useRef } from "react";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Progress } from "@heroui/progress";
import { UploadCloudIcon, FileTextIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";
import { importBulkSources } from "@/app/actions/sources";

export const ImportSourcesModal = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ total: 0, success: 0, skipped: 0 });
  const [logs, setLogs] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setProgress(0);
      setStats({ total: 0, success: 0, skipped: 0 });
      setLogs([]);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setIsProcessing(true);
    setLogs(prev => ["Đang đọc file...", ...prev]);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const allLines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);
      const totalLines = allLines.length;
      setStats(prev => ({ ...prev, total: totalLines }));

      const BATCH_SIZE = 20;
      let processedCount = 0;
      let successCount = 0;
      let skippedCount = 0;

      for (let i = 0; i < totalLines; i += BATCH_SIZE) {
        const batch = allLines.slice(i, i + BATCH_SIZE);
        
        const result = await importBulkSources(batch);

        if (result.error) {
          setLogs(prev => [`Lỗi batch ${i}: ${result.error}`, ...prev]);
        } else {
          successCount += result.count || 0;
          skippedCount += result.skipped || 0;
        }

        processedCount += batch.length;
        
        const currentProgress = Math.round((processedCount / totalLines) * 100);
        setProgress(currentProgress);
        setStats({ 
            total: totalLines, 
            success: successCount, 
            skipped: skippedCount 
        });
        
        await new Promise(r => setTimeout(r, 50));
      }

      setLogs(prev => ["Hoàn tất quá trình nhập liệu.", ...prev]);
      setIsProcessing(false);
    };
    
    reader.readAsText(file);
  };

  const handleClose = () => {
    setFile(null);
    setProgress(0);
    setLogs([]);
    onClose();
  };

  return (
    <>
      <Button onPress={onOpen} color="secondary" variant="flat" startContent={<UploadCloudIcon size={18} />} className="font-sans">
        Nhập File (Import)
      </Button>

      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange} 
        onClose={handleClose}
        placement="top-center"
        isDismissable={!isProcessing}
      >
        <ModalContent className="font-sans">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Nhập Nguồn Hàng Loạt</ModalHeader>
              <ModalBody>
                
                <div className="border-2 border-dashed border-default-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-default-50 hover:bg-default-100 transition-colors cursor-pointer"
                     onClick={() => !isProcessing && fileInputRef.current?.click()}>
                    <input 
                        type="file" 
                        accept=".txt" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        disabled={isProcessing}
                    />
                    <FileTextIcon size={32} className="text-default-400"/>
                    <div className="text-sm text-default-500 text-center">
                        {file ? (
                            <span className="font-semibold text-primary">{file.name}</span>
                        ) : (
                            <>
                                <span className="font-semibold text-primary">Nhấn để tải lên</span> hoặc kéo thả file .txt
                                <br/>
                                <span className="text-xs">(Mỗi dòng là 1 URL)</span>
                            </>
                        )}
                    </div>
                </div>

                {(progress > 0 || isProcessing) && (
                    <div className="space-y-2 mt-2">
                        <div className="flex justify-between text-xs text-default-500">
                            <span>Tiến độ</span>
                            <span>{progress}%</span>
                        </div>
                        <Progress 
                            aria-label="Importing..." 
                            value={progress} 
                            color={progress === 100 ? "success" : "primary"}
                            size="sm"
                            isIndeterminate={progress === 0 && isProcessing} 
                        />
                        
                        {/* Thống kê kết quả */}
                        <div className="grid grid-cols-3 gap-2 mt-4">
                             <div className="p-2 bg-default-100 rounded-lg flex flex-col items-center">
                                <span className="text-xs text-default-500">Tổng</span>
                                <span className="font-bold">{stats.total}</span>
                             </div>
                             <div className="p-2 bg-success-50 text-success rounded-lg flex flex-col items-center">
                                <span className="text-xs flex items-center gap-1"><CheckCircleIcon size={10}/> Thêm mới</span>
                                <span className="font-bold">{stats.success}</span>
                             </div>
                             <div className="p-2 bg-warning-50 text-warning-700 rounded-lg flex flex-col items-center" title="Đã tồn tại trong hệ thống">
                                <span className="text-xs flex items-center gap-1"><XCircleIcon size={10}/> Bỏ qua</span>
                                <span className="font-bold">{stats.skipped}</span>
                             </div>
                        </div>
                    </div>
                )}

                {logs.length > 0 && (
                    <div className="mt-2 p-2 bg-black/5 dark:bg-white/5 rounded-lg h-24 overflow-y-auto text-tiny font-mono text-default-500">
                        {logs.map((log, i) => <div key={i}>&gt; {log}</div>)}
                    </div>
                )}

              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose} isDisabled={isProcessing}>
                  Đóng
                </Button>
                <Button 
                    color="primary" 
                    onPress={handleImport} 
                    isLoading={isProcessing}
                    isDisabled={!file}
                >
                  {isProcessing ? "Đang xử lý..." : "Bắt đầu Nhập"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
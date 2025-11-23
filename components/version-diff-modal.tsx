
"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { TextDiffViewer } from "./text-diff-viewer";
import { GitCompareIcon, ArrowRightIcon } from "lucide-react";

interface VersionDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVersion: any; // Bản ghi đang chọn
  previousVersion: any; // Bản ghi cũ hơn liền kề
}

export const VersionDiffModal = ({ isOpen, onClose, currentVersion, previousVersion }: VersionDiffModalProps) => {
  if (!currentVersion) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <GitCompareIcon size={20} className="text-primary"/>
            <span>Version Comparison</span>
          </div>
          <div className="flex items-center gap-2 text-tiny font-normal text-default-500 mt-1">
            <span>{previousVersion ? new Date(previousVersion.valid_from).toLocaleDateString('vi-VN') : 'Origin'}</span>
            <ArrowRightIcon size={14} />
            <span className="font-bold text-foreground">
              {new Date(currentVersion.valid_from).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </ModalHeader>
        
        <ModalBody>
          <ScrollShadow className="h-[60vh] pr-2">
            {!previousVersion ? (
               <div className="p-4 bg-primary-50 text-primary rounded-lg text-center">
                 This is the first recorded version (Root). Nothing to compare against.
               </div>
            ) : (
              <div className="space-y-2">
                {/* So sánh Tiêu đề */}
                <TextDiffViewer 
                  label="Product Title" 
                  oldText={previousVersion.title} 
                  newText={currentVersion.title} 
                />

                {/* So sánh Mô tả */}
                <TextDiffViewer 
                  label="Description" 
                  oldText={previousVersion.description} 
                  newText={currentVersion.description} 
                />

                 {/* So sánh Danh mục (Nếu categories là JSON string hoặc object, cần convert sang string) */}
                 <TextDiffViewer 
                  label="Categories" 
                  oldText={JSON.stringify(previousVersion.categories)} 
                  newText={JSON.stringify(currentVersion.categories)} 
                />
              </div>
            )}
          </ScrollShadow>
        </ModalBody>
        
        <ModalFooter>
          <Button color="primary" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
"use client";

import { PlusIcon } from "lucide-react";
import { createSource } from "@/app/actions/sources";
import { useState } from "react";
import { Button } from "@heroui/button";
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from '@heroui/modal'
import {Input} from '@heroui/input'
import {Checkbox} from '@heroui/checkbox'

export const CreateSourceModal = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const result = await createSource(formData);

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
  };

  return (
    <>
      <Button onPress={onOpen} color="primary" startContent={<PlusIcon size={18} />} className="font-sans">
        Thêm Nguồn Dữ Liệu
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent className="font-sans">
          {(onClose) => (
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1">Thêm Cấu Hình Nguồn Mới</ModalHeader>
              <ModalBody>
                {error && <div className="text-danger text-sm">{error}</div>}
                <div className="text-sm text-default-500 mb-2">
                    Nguồn mặc định: <span className="font-bold text-foreground">tiktok_shop</span>
                </div>

                <Input
                  autoFocus
                  label="URL Gốc (Base URL)"
                  name="base_url"
                  placeholder="https://shop.tiktok.com/view/product/..."
                  variant="bordered"
                  isRequired
                />
                <div className="flex py-2 px-1 justify-between">
                  <Checkbox name="is_active" defaultSelected value="true">
                    Đang Hoạt Động
                  </Checkbox>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Hủy Bỏ
                </Button>
                <Button color="primary" type="submit" isLoading={isLoading}>
                  Lưu Cấu Hình
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};


"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { KeyRoundIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { changePassword } from "@/app/actions/profile";
import { Tooltip } from "@heroui/tooltip";

export const ChangePasswordModal = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  
  const [isVisibleOld, setIsVisibleOld] = useState(false);
  const [isVisibleNew, setIsVisibleNew] = useState(false);
  const toggleOld = () => setIsVisibleOld(!isVisibleOld);
  const toggleNew = () => setIsVisibleNew(!isVisibleNew);

  const [state, formAction, isPending] = useActionState(changePassword, null);

  useEffect(() => {
    if (state?.success) {
      setTimeout(() => {
        onClose();
      }, 1500); 
    }
  }, [state, onClose]);

  return (
    <>
      <Tooltip content="Đổi mật khẩu">
        <Button isIconOnly size="sm" variant="light" onPress={onOpen}>
          <KeyRoundIcon size={18} className="text-default-500" />
        </Button>
      </Tooltip>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
        <ModalContent>
          {(onClose) => (
            <form action={formAction}>
              <ModalHeader className="flex flex-col gap-1">Đổi Mật Khẩu</ModalHeader>
              <ModalBody>
                {state?.error && (
                  <div className="p-3 bg-danger-50 text-danger text-sm rounded-lg border border-danger-200">
                    {state.error}
                  </div>
                )}
                {state?.success && (
                  <div className="p-3 bg-success-50 text-success text-sm rounded-lg border border-success-200">
                    {state.success}
                  </div>
                )}

                <Input
                  label="Mật khẩu hiện tại"
                  name="currentPassword"
                  variant="bordered"
                  isRequired
                  type={isVisibleOld ? "text" : "password"}
                  endContent={
                    <button className="focus:outline-none" type="button" onClick={toggleOld}>
                      {isVisibleOld ? <EyeOffIcon className="text-2xl text-default-400" /> : <EyeIcon className="text-2xl text-default-400" />}
                    </button>
                  }
                />
                
                <Input
                  label="Mật khẩu mới"
                  name="newPassword"
                  variant="bordered"
                  isRequired
                  type={isVisibleNew ? "text" : "password"}
                  endContent={
                    <button className="focus:outline-none" type="button" onClick={toggleNew}>
                      {isVisibleNew ? <EyeOffIcon className="text-2xl text-default-400" /> : <EyeIcon className="text-2xl text-default-400" />}
                    </button>
                  }
                />

                <Input
                  label="Xác nhận mật khẩu mới"
                  name="confirmPassword"
                  variant="bordered"
                  isRequired
                  type="password"
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Hủy
                </Button>
                <Button color="primary" type="submit" isLoading={isPending}>
                  Lưu thay đổi
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
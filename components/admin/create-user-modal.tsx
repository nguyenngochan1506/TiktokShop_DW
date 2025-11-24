"use client";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { UserPlusIcon } from "lucide-react";
import { createUser } from "@/app/actions/users";
import { useState } from "react";

export const CreateUserModal = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    await createUser(formData);
    setIsLoading(false);
    onClose();
  };

  return (
    <>
      <Button onPress={onOpen} color="primary" startContent={<UserPlusIcon size={18}/>}>Thêm Thành Viên</Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
            {(onClose) => (
                <form onSubmit={handleSubmit}>
                    <ModalHeader>Tạo Tài Khoản Mới</ModalHeader>
                    <ModalBody>
                        <Input name="name" label="Họ tên" required />
                        <Input name="email" label="Email" type="email" required />
                        <Input name="password" label="Mật khẩu" type="password" required />
                        <Select name="role" label="Vai trò" defaultSelectedKeys={["USER"]}>
                            <SelectItem key="USER">Thành viên (USER)</SelectItem>
                            <SelectItem key="ADMIN">Quản trị viên (ADMIN)</SelectItem>
                        </Select>
                    </ModalBody>
                    <ModalFooter>
                        <Button onPress={onClose} variant="light">Hủy</Button>
                        <Button type="submit" color="primary" isLoading={isLoading}>Tạo User</Button>
                    </ModalFooter>
                </form>
            )}
        </ModalContent>
      </Modal>
    </>
  );
};
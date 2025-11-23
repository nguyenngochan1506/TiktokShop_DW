"use client";

import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from '@heroui/modal'
import {Input} from '@heroui/input'
import {Checkbox} from '@heroui/checkbox'
import { EditIcon } from "lucide-react";
import { updateSource } from "@/app/actions/sources";
import { useState } from "react";
import { Tooltip } from '@heroui/tooltip';
import { Button } from '@heroui/button';

// Định nghĩa kiểu dữ liệu cho props
interface SourceConfig {
  id: number;
  source_name: string;
  base_url: string;
  is_active: boolean;
}

export const EditSourceModal = ({ source }: { source: SourceConfig }) => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const result = await updateSource(source.id, formData);

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
  };

  return (
    <>
      <Tooltip content="Edit source">
        <span 
          className="text-lg text-default-400 cursor-pointer active:opacity-50 hover:text-primary"
          onClick={onOpen}
        >
          <EditIcon size={18} />
        </span>
      </Tooltip>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1">Edit Source #{source.id}</ModalHeader>
              <ModalBody>
                {error && <div className="text-danger text-sm">{error}</div>}
                
                <Input
                  label="Source Name"
                  name="source_name"
                  defaultValue={source.source_name}
                  variant="bordered"
                  isRequired
                />
                <Input
                  label="Base URL"
                  name="base_url"
                  defaultValue={source.base_url} 
                  variant="bordered"
                  isRequired
                />
                <div className="flex py-2 px-1 justify-between">
                  <Checkbox 
                    name="is_active" 
                    defaultSelected={source.is_active}
                    value="true"
                  >
                    Is Active
                  </Checkbox>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" type="submit" isLoading={isLoading}>
                  Update Config
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
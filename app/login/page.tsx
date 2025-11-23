"use client";

import { useActionState } from "react";
import { authenticate } from "@/app/actions/auth";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { KeyIcon, MailIcon, LockIcon } from "lucide-react";

export default function LoginPage() {
  const [errorMessage, dispatch, isPending] = useActionState(
    authenticate,
    undefined
  );

  return (
    <div className="flex h-screen w-full items-center justify-center bg-default-50">
      <Card className="w-full max-w-md p-4">
        <CardHeader className="flex flex-col gap-1 items-center pb-6">
          <div className="bg-primary p-3 rounded-xl mb-2">
            <KeyIcon className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold">Đăng Nhập Hệ Thống</h1>
          <p className="text-small text-default-500">Data Warehouse Admin Portal</p>
        </CardHeader>
        <CardBody>
          <form action={dispatch} className="flex flex-col gap-4">
            <Input
              isRequired
              label="Email"
              name="email"
              placeholder="admin@example.com"
              type="email"
              variant="bordered"
              startContent={<MailIcon className="text-default-400" size={18} />}
            />
            <Input
              isRequired
              label="Mật khẩu"
              name="password"
              placeholder="••••••••"
              type="password"
              variant="bordered"
              startContent={<LockIcon className="text-default-400" size={18} />}
            />
            
            {errorMessage && (
              <div className="p-3 bg-danger-50 border border-danger-200 text-danger text-sm rounded-lg">
                {errorMessage}
              </div>
            )}

            <Button 
              color="primary" 
              type="submit" 
              isLoading={isPending}
              className="w-full font-semibold mt-2"
            >
              {isPending ? "Đang xác thực..." : "Đăng Nhập"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
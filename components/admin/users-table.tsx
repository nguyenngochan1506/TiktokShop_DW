"use client";

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";

export const UsersTable = ({ users }: { users: any[] }) => {
  return (
    <Table aria-label="Bảng quản lý thành viên" className="font-sans">
      <TableHeader>
        <TableColumn>TÊN</TableColumn>
        <TableColumn>EMAIL</TableColumn>
        <TableColumn>VAI TRÒ</TableColumn>
        <TableColumn>NGÀY TẠO</TableColumn>
      </TableHeader>
      <TableBody items={users} emptyContent="Chưa có thành viên nào.">
        {(user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Chip 
                color={user.role === 'ADMIN' ? "danger" : "primary"} 
                size="sm" 
                variant="flat"
              >
                {user.role}
              </Chip>
            </TableCell>
            <TableCell>
                {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : "N/A"}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
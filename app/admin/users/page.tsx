import { getSystemUsers } from "@/app/actions/users";
import { CreateUserModal } from "@/components/admin/create-user-modal";
import { UsersTable } from "@/components/admin/users-table";
import { serializeData } from "@/lib/utils";

export default async function UsersManagementPage() {
  const rawUsers = await getSystemUsers();
  const users = serializeData(rawUsers);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản Lý Thành Viên</h1>
        <CreateUserModal />
      </div>

      <UsersTable users={users} />
    </div>
  );
}
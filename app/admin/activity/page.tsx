import { getAuditLogs } from "@/app/actions/audit";
import { getSystemUsers } from "@/app/actions/users";
import { serializeData } from "@/lib/utils";
import { ActivityTable } from "@/components/admin/activity-table";

export default async function ActivityLogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 20;
  const userId = params.userId || undefined;

  const [logData, usersData] = await Promise.all([
    getAuditLogs(page, limit, userId),
    getSystemUsers()
  ]);

  const logs = serializeData(logData.data);
  const users = serializeData(usersData);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Nhật Ký Hoạt Động (Audit Log)</h1>
      
      <ActivityTable 
        logs={logs} 
        totalCount={logData.total} 
        users={users}
      />
    </div>
  );
}
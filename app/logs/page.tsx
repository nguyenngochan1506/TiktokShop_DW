import { prisma } from "@/lib/prisma";
import { LogsTable } from "@/components/logs-table";

const ITEMS_PER_PAGE = 10;

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const [logs, totalCount] = await prisma.$transaction([
    prisma.crawled_files_log.findMany({
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: { id: 'desc' },
      include: { 
        source_config: {
          select: { id: true }
        }
      }
    }),
    prisma.crawled_files_log.count()
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Lịch Sử Crawling Dữ Liệu</h1>
      <LogsTable logs={logs as any} totalPages={totalPages} />
    </div>
  );
}
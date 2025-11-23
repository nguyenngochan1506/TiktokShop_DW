import { Card, CardBody, CardHeader } from "@heroui/card";
import { DatabaseIcon, AlertCircleIcon, PackageIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { serializeData } from "@/lib/utils";
import { DashboardChart } from "@/components/dashboard-chart";
import { RecentLogsTable } from "@/components/recent-logs-table"; 

async function getDashboardStats() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [activeSources, totalProducts, failedJobsToday, recentLogs] = await prisma.$transaction([
    prisma.source_config.count({ where: { is_active: true } }),
    
    prisma.tbl_products_raw.count(),
    
    prisma.crawled_files_log.count({
      where: { status: "FAILED", created_at: { gte: startOfToday } }
    }),

    prisma.crawled_files_log.findMany({
      take: 5,
      orderBy: { created_at: "desc" },
      include: { source_config: true }
    })
  ]);
  const chartRawData: any[] = await prisma.$queryRaw`
    SELECT 
      TO_CHAR(load_timestamp, 'DD/MM') as date, 
      COUNT(*)::int as count 
    FROM "staging"."tbl_products_raw"
    WHERE load_timestamp >= NOW() - INTERVAL '7 days'
    GROUP BY TO_CHAR(load_timestamp, 'DD/MM'), DATE(load_timestamp)
    ORDER BY DATE(load_timestamp) ASC
  `;

  return {
    activeSources,
    totalProducts,
    failedJobsToday,
    recentLogs: serializeData(recentLogs),
    chartData: chartRawData 
  };
}

export default async function Dashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tổng Quan Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title="Nguồn Dữ Liệu Hoạt Động (active data source)" 
          value={stats.activeSources} 
          icon={<DatabaseIcon className="text-primary" size={24} />} 
        />
        <StatsCard 
          title="Sản Phẩm Thô (raw product)" 
          value={new Intl.NumberFormat('vi-VN').format(stats.totalProducts)} 
          icon={<PackageIcon className="text-success" size={24} />} 
        />
        <StatsCard 
          title="Lỗi Pipeline Hôm Nay" 
          value={stats.failedJobsToday} 
          icon={<AlertCircleIcon className="text-danger" size={24} />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        <DashboardChart data={stats.chartData} />

        <Card className="lg:col-span-1 min-h-[400px]">
          <CardHeader>
            <h3 className="font-semibold text-lg">Hoạt Động Crawl Gần Đây</h3>
          </CardHeader>
          <CardBody>
             <RecentLogsTable logs={stats.recentLogs} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

const StatsCard = ({ title, value, icon }: any) => (
  <Card>
    <CardBody className="flex flex-row items-center gap-4 p-6">
      <div className="p-3 bg-default-100 rounded-large">
        {icon}
      </div>
      <div>
        <p className="text-small text-default-500 uppercase font-bold">{title}</p>
        <h4 className="text-3xl font-bold">{value}</h4>
      </div>
    </CardBody>
  </Card>
);
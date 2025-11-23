import { getDatabaseHealth } from "@/app/actions/system";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { DatabaseIcon, HardDriveIcon, ZapIcon } from "lucide-react";
import { SlowQueriesTable } from "@/components/slow-queries-table";

export default async function SystemHealthPage() {
  const data = await getDatabaseHealth();

  if (!data) return <div>Error loading database stats</div>;

  const maxBytes = Math.max(...data.tableStats.map((t: any) => t.total_bytes));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        Database Infrastructure Health
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary-50 dark:bg-primary-900/20">
            <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-full text-primary">
                    <DatabaseIcon size={24} />
                </div>
                <div>
                    <p className="text-sm text-default-500 font-semibold">Total DB Size</p>
                    <h2 className="text-3xl font-bold">{data.dbSize}</h2>
                </div>
            </CardBody>
        </Card>

        <Card className="bg-success-50 dark:bg-success-900/20">
            <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 bg-success/20 rounded-full text-success">
                    <ZapIcon size={24} />
                </div>
                <div>
                    <p className="text-sm text-default-500 font-semibold">Cache Hit Ratio</p>
                    <h2 className="text-3xl font-bold">{data.cacheHitRatio.toFixed(2)}%</h2>
                    <p className="text-xs text-default-400">Target: &gt; 99%</p>
                </div>
            </CardBody>
        </Card>

        <Card className="bg-warning-50 dark:bg-warning-900/20">
            <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 bg-warning/20 rounded-full text-warning">
                    <HardDriveIcon size={24} />
                </div>
                <div>
                    <p className="text-sm text-default-500 font-semibold">Heavy Tables</p>
                    <h2 className="text-3xl font-bold">{data.tableStats.length}</h2>
                    <p className="text-xs text-default-400">Tables monitored</p>
                </div>
            </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <Card className="min-h-[400px]">
            <CardHeader>
                <h3 className="font-semibold text-lg">Top Largest Tables</h3>
            </CardHeader>
            <CardBody>
                <div className="flex flex-col gap-4">
                    {data.tableStats.map((table: any) => (
                        <div key={table.table_name} className="flex flex-col gap-1">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">{table.table_name}</span>
                                <span className="text-default-500">{table.total_size}</span>
                            </div>
                            <Progress 
                                value={(table.total_bytes / maxBytes) * 100} 
                                color="primary" 
                                size="sm"
                                aria-label="Table Size"
                            />
                            <div className="text-tiny text-default-400">
                                {new Intl.NumberFormat('vi-VN').format(table.row_count)} rows
                            </div>
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>

        <Card className="min-h-[400px]">
            <CardHeader>
                <h3 className="font-semibold text-lg">Performance Warnings (Full Scans)</h3>
            </CardHeader>
            <CardBody>
                <SlowQueriesTable data={data.indexUsage} />
                
                <div className="mt-4 p-3 bg-default-100 rounded-lg text-xs text-default-500">
                    <strong>Tip:</strong> If "Full Scans" is high (thousands) compared to "Index Scans", consider adding an INDEX to that table to speed up queries.
                </div>
            </CardBody>
        </Card>
      </div>
    </div>
  );
}
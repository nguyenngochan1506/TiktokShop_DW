"use client";

import { Card, CardBody } from "@heroui/card";
import { DatabaseIcon, ActivityIcon, AlertCircleIcon } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title="Active Sources" 
          value="5" 
          icon={<DatabaseIcon className="text-primary" />} 
        />
        <StatsCard 
          title="Total Products" 
          value="12,450" 
          icon={<ActivityIcon className="text-success" />} 
        />
        <StatsCard 
          title="Failed Jobs Today" 
          value="2" 
          icon={<AlertCircleIcon className="text-danger" />} 
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">System Health</h2>
        <Card>
          <CardBody>
            <p className="text-default-500">Charts or detailed stats can go here (integration with Fact tables).</p>
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
        <p className="text-small text-default-500">{title}</p>
        <h4 className="text-2xl font-bold">{value}</h4>
      </div>
    </CardBody>
  </Card>
);
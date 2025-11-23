"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardBody, CardHeader } from "@heroui/card";

const COLORS = ["#F31260", "#F5A524", "#eab308", "#17C964", "#006FEE"]; // Đỏ -> Cam -> Vàng -> Xanh lá -> Xanh dương

export const RatingPieChart = ({ data }: { data: any[] }) => {
  return (
    <Card className="h-full min-h-[350px]">
      <CardHeader>
        <h3 className="font-semibold text-lg">Rating Distribution</h3>
      </CardHeader>
      <CardBody>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="count"
              nameKey="rating"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
                formatter={(value: number) => new Intl.NumberFormat('vi-VN').format(value) + " reviews"}
                contentStyle={{ backgroundColor: "#1f1f1f", border: "none", borderRadius: "8px" }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};
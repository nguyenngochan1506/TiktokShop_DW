"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Card, CardBody, CardHeader } from "@heroui/card";

interface ChartData {
    date: string;
    count: number;
}

export const DashboardChart = ({ data }: { data: ChartData[] }) => {
    return (
        <Card className="lg:col-span-2 min-h-[400px] font-sans">
            <CardHeader>
                <h3 className="font-semibold text-lg">Số Lượng Sản Phẩm Thu Thập Được (7 Ngày Gần Nhất)</h3>
            </CardHeader>
            <CardBody>
                <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#006FEE" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#006FEE" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                            <XAxis
                                dataKey="date"
                                stroke="#9CA3AF"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#9CA3AF"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${new Intl.NumberFormat('vi-VN').format(value)}`} // Định dạng số lượng
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#18181b",
                                    border: "1px solid #3f3f46",
                                    borderRadius: "8px",
                                }}
                                itemStyle={{ color: "#fff" }}
                                // Thêm nhãn cho Tooltip
                                formatter={(value: number) => [new Intl.NumberFormat('vi-VN').format(value), "Sản phẩm"]} 
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#006FEE"
                                fillOpacity={1}
                                fill="url(#colorCount)"
                                name="Số Lượng Sản Phẩm" // Dịch tên đường dữ liệu
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardBody>
        </Card>
    );
};
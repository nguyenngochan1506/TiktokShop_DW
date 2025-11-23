"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Card, CardBody, CardHeader } from "@heroui/card";

export const ProductHistoryChart = ({ data }: { data: any[] }) => {
    return (
        <Card className="min-h-[400px]">
            <CardHeader>
                <h3 className="font-semibold text-lg">Price & Stock History</h3>
            </CardHeader>
            <CardBody>
                <div className="w-full h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="date" fontSize={12} stroke="#888888" />

                            {/* Trục Y trái: Giá tiền */}
                            <YAxis
                                yAxisId="left"
                                fontSize={12}
                                tickFormatter={(val) => `${val / 1000}k`}
                                stroke="#006FEE"
                            />

                            {/* Trục Y phải: Tồn kho */}
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                fontSize={12}
                                stroke="#17C964"
                            />

                            <Tooltip
                                contentStyle={{ backgroundColor: "#1f1f1f", border: "none", borderRadius: "8px" }}
                                labelStyle={{ color: "#aaa" }}
                            />
                            <Legend />

                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="price"
                                stroke="#006FEE"
                                name="Price (VND)"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="stock"
                                stroke="#17C964"
                                name="Stock (Qty)"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardBody>
        </Card>
    );
};
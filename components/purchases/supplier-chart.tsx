"use client";

import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SupplierChartProps {
  data: Array<{
    name: string;
    total: number;
  }>;
}

export function SupplierChart({ data }: SupplierChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#888", fontSize: 12 }}
        />
        <YAxis
          tickFormatter={(value) => `$${value}`}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#888", fontSize: 12 }}
        />
        <Tooltip
          formatter={(value) => [`$${value}`, "Total"]}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="#3b82f6"
          fillOpacity={0.1}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
} 

'use client';

import type { PerformanceData } from '@/types';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

type PerformanceChartProps = {
  data: PerformanceData;
  title: string;
  description: string;
  type?: 'bar' | 'line';
};

const chartConfig = {
  value: {
    label: "Valor", // Translated from "Value"
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;


const PerformanceChart = ({ data, title, description, type = 'bar' }: PerformanceChartProps) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          {type === 'bar' ? (
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent))', opacity: 0.2 }}
                content={<ChartTooltipContent />}
              />
              <Legend />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
               <Tooltip
                cursor={{ fill: 'hsl(var(--accent))', opacity: 0.2 }}
                content={<ChartTooltipContent />}
              />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
            </LineChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;

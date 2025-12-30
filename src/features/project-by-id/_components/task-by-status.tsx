"use client"

import { Bar, BarChart, CartesianGrid, Cell, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

export const description = "Tasks by status"

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE"

const chartData: { status: TaskStatus; count: number }[] = [
    { status: "TODO", count: 12 },
    { status: "IN_PROGRESS", count: 8 },
    { status: "DONE", count: 18 },
]

const chartConfig = {
    TODO: {
    label: "Todo",
        color: "var(--chart-1)",
    },
    IN_PROGRESS: {
        label: "In Progress",
        color: "var(--chart-2)",
    },
    DONE: {
        label: "Done",
        color: "var(--chart-3)",
    },
    count: {
        label: "Tasks",
    },
} satisfies ChartConfig

export const TaskByStatus = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Tasks by status</CardTitle>
                <CardDescription className=" hidden p-0">Current sprint</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="status"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) =>
                                chartConfig[value as keyof typeof chartConfig]?.label ??
                                value
                            }
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="count" radius={8}>
                            {chartData.map((entry) => (
                                <Cell
                                    key={entry.status}
                                    fill={`var(--color-${entry.status})`}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

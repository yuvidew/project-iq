"use client"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

export const description = "A pie chart with a label"

type TaskType = "TASK" | "BUG" | "FEATURE" | "IMPROVEMENT" | "OTHER"

const chartData: { type: TaskType; count: number; fill: string }[] = [
    { type: "TASK", count: 22, fill: "var(--color-TASK)" },
    { type: "BUG", count: 11, fill: "var(--color-BUG)" },
    { type: "FEATURE", count: 14, fill: "var(--color-FEATURE)" },
    { type: "IMPROVEMENT", count: 8, fill: "var(--color-IMPROVEMENT)" },
    { type: "OTHER", count: 6, fill: "var(--color-OTHER)" },
]

const chartConfig = {
    count: {
        label: "Tasks",
    },
    TASK: {
        label: "Task",
        color: "var(--chart-1)",
    },
    BUG: {
        label: "Bug",
        color: "var(--chart-2)",
    },
    FEATURE: {
        label: "Feature",
        color: "var(--chart-3)",
    },
    IMPROVEMENT: {
        label: "Improvement",
        color: "var(--chart-4)",
    },
    OTHER: {
        label: "Other",
        color: "var(--chart-5)",
    },
} satisfies ChartConfig

export const TaskByType = () => {
    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Tasks by type</CardTitle>
                <CardDescription className=" hidden p-0">Current sprint</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0"
                >
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie data={chartData} dataKey="count" label nameKey="type" />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

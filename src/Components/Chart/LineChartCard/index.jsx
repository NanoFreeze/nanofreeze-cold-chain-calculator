import { LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, CartesianGrid } from "recharts"
import { formatNumber } from "../../../Utils/formatters"

const LineChartCard = ({
    data = [],
    xKey = "month",
    yKey = "value",
    yLabel = "",
    color = "var(--color-secondary-blue)",
    height = 250,
    formatTooltipValue,
    formatXAxis,
    formatYAxis,
    labelFormatter,
}) => {

    const defaultFormatYAxis = (value) => formatNumber(value, 0)

    const defaultTooltipFormatter = (value) => [
        `${formatNumber(value)} ${yLabel}`
    ]

    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart
                data={data}
            >
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-grey)"
                    vertical={false}
                />

                <XAxis
                    dataKey={xKey}
                    tick={{ fill: "var(--color-text)", fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--color-text)", strokeWidth: 0.5 }}
                    tickFormatter={formatXAxis ? formatXAxis : (value) => typeof value === "string" ? value.slice(0, 3) : value}
                />

                <YAxis
                    label={yLabel ? {value: yLabel, fill: "var(--color-text)", fontSize: 12, angle: -90 } : undefined}
                    tick={{ fill: "var(--color-text)", fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--color-text)", strokeWidth: 0.5 }}
                    tickFormatter={formatYAxis ?? defaultFormatYAxis}
                />

                <Tooltip
                    cursor={false}
                    contentStyle={{ backgroundColor: "white", border: "1px solid var(--color-grey)", borderRadius: "8px", padding: "8px 12px" }}
                    labelStyle={{ color: "var(--color-text)", fontSize: 14 }}
                    formatter={formatTooltipValue ?? defaultTooltipFormatter}
                    labelFormatter={labelFormatter}
                />

                <Line
                    type="monotone"
                    dataKey={yKey}
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}

export default LineChartCard
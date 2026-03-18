import { BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, CartesianGrid } from "recharts"
import { formatNumber } from "../../../Utils/formatters"

const BarChartCard = ({
    data = [],
    xKey = "month",
    yKey = "value",
    yLabel = "",
    color = "var(--color-secondary-blue)",
    height = 250,
    formatTooltipValue,
    formatXAxis,
    formatYAxis
}) => {

    const defaultFormatYAxis = (value) => formatNumber(value, 0)

    const defaultTooltipFormatter = (value) => [
        `${formatNumber(value)} ${yLabel}`
    ]

    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart
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
                    padding={{ left: 8, right: 8 }}
                />

                <YAxis
                    label={yLabel ? {value: yLabel, fill: "var(--color-text)", fontSize: 12, angle: -90 } : undefined}
                    tick={{ fill: "var(--color-text)", fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--color-text)", strokeWidth: 0.5 }}
                    tickFormatter={formatYAxis ?? defaultFormatYAxis}
                />

                <Tooltip
                    cursor={{ fill: "var(--color-grey)", radius: 6 }}
                    contentStyle={{ backgroundColor: "white", border: "1px solid var(--color-grey)", borderRadius: "8px", padding: "8px 12px" }}
                    labelStyle={{ color: "var(--color-text)", fontSize: 14 }}
                    formatter={formatTooltipValue ?? defaultTooltipFormatter}
                />

                <Bar
                    dataKey={yKey}
                    radius={[6, 6, 0, 0]}
                    fill={color}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}

export default BarChartCard
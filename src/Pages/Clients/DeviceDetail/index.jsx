import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import ActionButton from "../../../Components/ActionButton"
import Card from "../../../Components/Card"
import BarChartCard from "../../../Components/Chart/BarChartCard"
import ChartContainer from "../../../Components/Chart/ChartContainer"
import LineChartCard from "../../../Components/Chart/LineChartCard"
import StatusTag from "../../../Components/StatusTag"
import { STATUS_STYLES } from "../../../Components/StatusTag/status.styles"
import { useDeviceData } from "../Hooks/useDeviceData"
import { useSemesterDevData } from "../Hooks/useSemesterDevData"
import { useHourDevData } from "../Hooks/useHourDevData"
import { useYearDevData } from "../Hooks/useYearDevData"
import { useDayDevData } from "../Hooks/useDayDevData"
import { formatHourData, formatDayData, formatMonthData } from "../Utils/dataFormatters"
import { formatToMillions, formatNumber } from "../../../Utils/formatters"
import { ChevronRight, Thermometer, Zap, Leaf, DollarSign, Clock, X } from "lucide-react"

const DeviceDetail = () => {

    const { id_client, id_point_of_sale, id_device } = useParams()

    //GET DATA FOR CARDS
    const { data: deviceData, loading: deviceLoading, error: deviceError } = useDeviceData(id_client, id_point_of_sale)
    const device = deviceData?.find((d) => String(d?.id_device) === String(id_device))
    const statusStyle = STATUS_STYLES[device?.status ?? ""]

    //GET DATA FOR CHARTS
    const { data: semesterDevData, loading: semesterDevLoading, error: semesterDevError } = useSemesterDevData(id_device)
    const { data: hourDevData, loading: hourDevLoading, error: hourDevError } = useHourDevData(id_device)
    const { data: dayDevData, loading: dayDevLoading, error: dayDevError } = useDayDevData(id_device)
    const { data: yearDevData, loading: yearDevLoading, error: yearDevError } = useYearDevData(id_device)

    //FORMAT DATA FOR CHARTS
    const semesterMetrics = formatMonthData(semesterDevData, {
        energyConsumption: "energy_consumption",
        avoidedCO2: "co2_avoided",
        estimatedSavings: "cost_saving",
    })

    const hourMetrics = formatHourData(hourDevData, {
        temperature: "temperature",
        energyConsumption: "energy_consumption",
        instantPower: "instant_power",
    })

    const dayMetrics = formatDayData(dayDevData, {
        temperature: "temperature",
        energyConsumption: "energy_consumption",
        instantPower: "instant_power",
    })

    const yearMetrics = formatMonthData(yearDevData, {
        temperature: "temperature",
        energyConsumption: "energy_consumption",
        instantPower: "instant_power",
    })

    //SEMESTER BAR CHART STATE
    const [activeSemesterMetric, setActiveSemesterMetric] = useState("energyConsumption")

    const semesterMetricOptions = [
        { id: "energyConsumption", label: "Consumo" },
        { id: "avoidedCO2", label: "CO2 Evitado" },
        { id: "estimatedSavings", label: "Ahorro Estimado" }
    ]

    const semesterMetricsConfig = {
        energyConsumption: {
            title: "Consumo Energético - Últimos 6 meses",
            data: semesterMetrics.energyConsumption,
            label: "Consumo",
            yLabel: "kWh",
            color: "var(--color-secondary-blue)",
        },
        avoidedCO2: {
            title: "CO2 Evitado - Últimos 6 meses",
            data: semesterMetrics.avoidedCO2,
            label: "CO2 Evitado",
            yLabel: "kg",
            color: "var(--color-green)",
        },
        estimatedSavings: {
            title: "Ahorro Estimado - Últimos 6 meses",
            data: semesterMetrics.estimatedSavings,
            label: "Ahorro Estimado",
            yLabel: "M COP",
            color: "var(--color-green)",
        },
    }

    const currentSemesterMetric = semesterMetricsConfig[activeSemesterMetric]

    //TREND LINE CHART STATE
    const [activeMetric, setActiveMetric] = useState("temperature")
    const [activeTime, setActiveTime] = useState("daily")

    const metricOptions = [
        { id: "temperature", label: "Temperatura" },
        { id: "energyConsumption", label: "Consumo" },
        { id: "instantPower", label: "Potencia" }
    ]
    
    const timeOptions = [
        { id: "daily", label: "Diario" },
        { id: "weekly", label: "Semanal" },
        { id: "monthly", label: "Mensual" },
        { id: "yearly", label: "Anual" },
    ]

    const timeMetricsConfig = {
        daily: {
            temperature: {
                title: "Temperatura",
                data: hourMetrics.temperature,
                label: "Temperatura",
                yLabel: "°C",
                color: "var(--color-secondary-blue)",
            },
            energyConsumption: {
                title: "Consumo Energético",
                data: hourMetrics.energyConsumption,
                label: "Consumo",
                yLabel: "kWh",
                color: "var(--color-green)",
            },
            instantPower: {
                title: "Potencia",
                data: hourMetrics.instantPower,
                label: "Potencia",
                yLabel: "kW",
                color: "var(--color-green)",
            },
        },
        weekly: {
            temperature: {
                title: "Temperatura",
                data: dayMetrics.temperature?.slice(-7),
                label: "Temperatura",
                yLabel: "°C",
                color: "var(--color-secondary-blue)",
            },
            energyConsumption: {
                title: "Consumo Energético",
                data: dayMetrics.energyConsumption?.slice(-7),
                label: "Consumo",
                yLabel: "kWh",
                color: "var(--color-green)",
            },
            instantPower: {
                title: "Potencia",
                data: dayMetrics.instantPower?.slice(-7),
                label: "Potencia",
                yLabel: "kW",
                color: "var(--color-green)",
            },
        },
        monthly: {
            temperature: {
                title: "Temperatura",
                data: dayMetrics.temperature?.slice(-31),
                label: "Temperatura",
                yLabel: "°C",
                color: "var(--color-secondary-blue)",
            },
            energyConsumption: {
                title: "Consumo Energético",
                data: dayMetrics.energyConsumption?.slice(-31),
                label: "Consumo",
                yLabel: "kWh",
                color: "var(--color-green)",
            },
            instantPower: {
                title: "Potencia",
                data: dayMetrics.instantPower?.slice(-31),
                label: "Potencia",
                yLabel: "kW",
                color: "var(--color-green)",
            },
        },
        yearly: {
            temperature: {
                title: "Temperatura",
                data: yearMetrics.temperature,
                label: "Temperatura",
                yLabel: "°C",
                color: "var(--color-secondary-blue)",
            },
            energyConsumption: {
                title: "Consumo Energético",
                data: yearMetrics.energyConsumption,
                label: "Consumo",
                yLabel: "kWh",
                color: "var(--color-green)",
            },
            instantPower: {
                title: "Potencia",
                data: yearMetrics.instantPower,
                label: "Potencia",
                yLabel: "kW",
                color: "var(--color-green)",
            },
        },
    }
    
    const currentTimeMetric = timeMetricsConfig[activeTime]?.[activeMetric]

    const xKeyByTime = {
        daily: "hour",
        weekly: "day",
        monthly: "day",
        yearly: "month",
    }

    const trendLabelFormatter = (label, payload) => {

        if (!payload || !payload.length) return label
    
        const point = payload[0]?.payload
    
        switch (activeTime) {
    
            case "daily":
                return point?.fullDateTime ?? label
    
            case "weekly":
                return point?.fullDate ?? label
    
            case "monthly":
                return point?.fullDate ?? label
    
            case "yearly":
                return point?.monthYearShort ?? label
    
            default:
                return label
        }
    }

    return (
        <div>
            <div className="flex items-center gap-2 pb-4 text-sm text-[var(--color-subtitle)]">
                <Link to="/clients" className="cursor-pointer hover:font-semibold text-inherit no-underline">
                    Clientes
                </Link>

                <ChevronRight className="w-4 h-4" />

                <Link to={`/clients/${id_client}`} className="cursor-pointer hover:font-semibold text-inherit no-underline">
                    {device?.client_name ?? ""}
                </Link>

                <ChevronRight className="w-4 h-4" />

                <Link to={`/clients/${id_client}/sale-points/${id_point_of_sale}`} className="cursor-pointer hover:font-semibold text-inherit no-underline">
                    {device?.pos_name ?? ""}
                </Link>

                <ChevronRight className="w-4 h-4" />

                <span className="font-semibold">
                    {device?.name ?? ""}
                </span>
            </div>

            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                    <h1 className="text-2xl font-bold text-[var(--color-main-title)]">
                        {device?.name ?? ""}
                    </h1>

                    <div className="flex items-center gap-3">
                        <p className="text-sm text-[var(--color-subtitle)]">
                            {device?.device_code ?? ""}
                        </p>

                        <span className="w-px h-4 bg-[var(--color-text)]/50" />
                            
                        <StatusTag
                            label={device?.status ?? ""}
                            {...statusStyle}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-8">
                    <Card
                        title="Temperatura actual"
                        value={formatNumber(device?.temperature ?? 0)}
                        unit="°C"
                        icon={Thermometer}
                    />

                    <Card
                        title="Consumo energético"
                        value={formatNumber(device?.energy_consumption ?? 0)}
                        unit="kWh"
                        description="Acumulado"
                        icon={Zap}
                        iconBgColor="bg-[var(--color-soft-green)]"
                        iconColor="text-[var(--color-dark-green)]"
                    />

                    <Card
                        title="CO₂ evitado"
                        value={formatNumber(device?.co2_avoided ?? 0)}
                        unit="ton"
                        description="Acumulado"
                        icon={Leaf}
                        iconBgColor="bg-[var(--color-soft-green)]"
                        iconColor="text-[var(--color-dark-green)]"
                    />

                    <Card
                        title="Ahorro estimado"
                        value={`$${formatToMillions(device?.cost_saving ?? 0)}`}
                        unit="M"
                        description="Acumulado"
                        icon={DollarSign}
                        iconBgColor="bg-[var(--color-soft-green)]"
                        iconColor="text-[var(--color-dark-green)]"
                    />
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <ChartContainer
                            title={currentSemesterMetric?.title}
                            metricOptions={semesterMetricOptions}
                            activeMetric={activeSemesterMetric}
                            onMetricChange={setActiveSemesterMetric}
                        >
                            <BarChartCard
                                data={currentSemesterMetric?.data || []}
                                xKey="month"
                                yKey="value"
                                yLabel={currentSemesterMetric?.yLabel}
                                color={currentSemesterMetric?.color}
                                height={310}
                            />
                        </ChartContainer>
                    </div>

                    <div>
                        <ChartContainer
                            title={currentTimeMetric?.title}
                            metricOptions={metricOptions}
                            activeMetric={activeMetric}
                            onMetricChange={setActiveMetric}
                            timeOptions={timeOptions}
                            activeTime={activeTime}
                            onTimeChange={setActiveTime}
                        >
                            <LineChartCard
                                data={currentTimeMetric?.data || []}
                                xKey={xKeyByTime[activeTime]}
                                yKey="value"
                                yLabel={currentTimeMetric?.yLabel}
                                color={currentTimeMetric?.color}
                                labelFormatter={trendLabelFormatter}
                            />
                        </ChartContainer>
                    </div>
                </div>

                <div className="border border-[var(--color-grey)] rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between p-4 bg-[var(--color-soft-grey)] border-b border-[var(--color-grey)] rounded-t-2xl">
                        <h3 className="font-semibold text-[var(--color-subtitle)]">
                            Calibración dinámica de Línea Base
                        </h3>

                        <ActionButton
                            label="Calcular línea base"
                            variant="primary"

                        />
                    </div>

                    <div className="flex flex-col gap-6 p-4 bg-white rounded-b-2xl">
                        <div className="flex justify-between">
                            <span className="text-[var(--color-text)]">
                                Día 22 de 30
                            </span>

                            <span className="font-semibold text-[var(--color-secondary-blue)]">
                                73% completado
                            </span>
                        </div>

                        <div className="w-full h-3 bg-[var(--color-primary-soft-blue)] rounded-full">
                            <div
                                className="h-full bg-[var(--color-primary-blue)] rounded-full transition-[width] duration-300"
                                style={{ width: `${73}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="border border-[var(--color-grey)] rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between p-4 bg-[var(--color-soft-grey)] border-b border-[var(--color-grey)] rounded-t-2xl">
                        <h3 className="font-semibold text-[var(--color-subtitle)]">
                            Programación de No Apagado
                        </h3>

                        <ActionButton
                            label="Agregar programación"
                            variant="primary"

                        />
                    </div>

                    <div className="flex flex-col gap-4 p-4 bg-white rounded-b-2xl">
                        <h4 className="text-sm font-semibold text-[var(--color-subtitle)]">
                            Programaciones activas
                        </h4>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between bg-[var(--color-soft-grey)] border border-[var(--color-grey)] rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-[var(--color-subtitle)]" />
                                    <div>
                                        <p className="text-sm font-semibold text-[var(--color-subtitle)]">
                                            Apagado nocturno
                                        </p>
                                        <p className="text-sm text-[var(--color-text)]">
                                            Lun 08:00 - Vie 18:00
                                        </p>
                                    </div>
                                </div>

                                <X className="w-4 h-4 text-[var(--color-subtitle)] cursor-pointer" />
                            </div>

                            <div className="flex items-center justify-between bg-[var(--color-soft-grey)] border border-[var(--color-grey)] rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-[var(--color-subtitle)]" />
                                    <div>
                                        <p className="text-sm font-semibold text-[var(--color-subtitle)]">
                                            Día de descanso
                                        </p>
                                        <p className="text-sm text-[var(--color-text)]">
                                            Dom 00:00 - Dom 24:00
                                        </p>
                                    </div>
                                </div>

                                <X className="w-4 h-4 text-[var(--color-subtitle)] cursor-pointer" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default DeviceDetail
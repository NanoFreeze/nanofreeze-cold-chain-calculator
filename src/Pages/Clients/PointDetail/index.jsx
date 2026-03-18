import { useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import ActionButton from "../../../Components/ActionButton"
import Card from "../../../Components/Card"
import DataState from "../../../Components/DataState"
import DevicesFilter from "../DevicesFilter"
import DevicesTable from "../DevicesTable"
import StatusTag from "../../../Components/StatusTag"
import { STATUS_STYLES } from "../../../Components/StatusTag/status.styles"
import { useFilteredData } from "../../../Hooks/useFilteredData"
import { useFilters } from "../../../Hooks/useFilters"
import { usePointData } from "../Hooks/usePointData"
import { useDeviceData } from "../Hooks/useDeviceData"
import { formatToMillions, formatNumber } from "../../../Utils/formatters"
import { includesInsensitive, buildSelectOptions } from "../Clients.helpers"
import { Plus, Box, Activity, Zap, Leaf, DollarSign, ChevronRight } from "lucide-react"

const PointDetail = () => {

    const { id_client, id_point_of_sale } = useParams()

    const { data: pointData, loading: pointLoading, error: pointError } = usePointData(id_client)
    const point = pointData?.[0]

    const statusStyle = STATUS_STYLES[point?.status ?? ""]

    const { data: devicesData, loading: devicesLoading, error: devicesError } = useDeviceData(id_client, id_point_of_sale)

    const { filters, updateFilter } = useFilters({
        devices: "",
    })

    const filterConfig = useMemo(() => ({
        devices: (_itemValue, filterValue, item) => includesInsensitive(item?.name, filterValue),
    }), [])

    const filteredData = useFilteredData(devicesData, filters, filterConfig)

    const devicesOptions = useMemo(
        () => buildSelectOptions(devicesData, "name"),
        [devicesData]
    )

    return (
        <div>
            <div className="flex items-center gap-2 pb-4 text-sm text-[var(--color-subtitle)]">
                <Link to="/clients" className="cursor-pointer hover:font-semibold text-inherit no-underline">
                    Clientes
                </Link>

                <ChevronRight className="w-4 h-4" />

                <Link to={`/clients/${id_client}`} className="cursor-pointer hover:font-semibold text-inherit no-underline">
                    {point?.client_name ?? ""}
                </Link>

                <ChevronRight className="w-4 h-4" />

                <span className="font-semibold">
                    {point?.name_pos ?? ""}
                </span>
            </div>

            <div className="flex flex-col gap-8">
                <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-3">
                        <h1 className="text-2xl font-bold text-[var(--color-main-title)]">
                            {point?.name_pos ?? ""}
                        </h1>

                        <div className="flex items-center gap-3">
                            <p className="text-sm text-[var(--color-subtitle)]">
                                {point?.pos_code ?? ""}
                            </p>

                            <span className="w-px h-4 bg-[var(--color-text)]/50" />
                            
                            <StatusTag
                                label={point?.status ?? ""}
                                {...statusStyle}
                            />
                        </div>
                    </div>

                    <ActionButton
                        label="Agregar Dispositivo"
                        variant="primary"
                        icon={Plus}
                    />
                </div>

                <div className="grid grid-cols-5 gap-8">
                    <Card
                        title="Dispositivos"
                        value={point?.total_devices ?? 0}
                        icon={Box}
                    />

                    <Card
                        title="Línea base"
                        value={formatNumber(point?.base_line ?? 0)}
                        unit="kWh"
                        description="Acumulado"
                        icon={Activity}
                        iconBgColor="bg-[var(--color-soft-green)]"
                        iconColor="text-[var(--color-dark-green)]"
                    />

                    <Card
                        title="Consumo energético"
                        value={formatNumber(point?.energy_consumption ?? 0)}
                        unit="kWh"
                        description="Acumulado"
                        icon={Zap}
                        iconBgColor="bg-[var(--color-soft-green)]"
                        iconColor="text-[var(--color-dark-green)]"
                    />

                    <Card
                        title="CO₂ evitado"
                        value={formatNumber(point?.co2_avoided ?? 0)}
                        unit="ton"
                        description="Acumulado"
                        icon={Leaf}
                        iconBgColor="bg-[var(--color-soft-green)]"
                        iconColor="text-[var(--color-dark-green)]"
                    />

                    <Card
                        title="Ahorro estimado"
                        value={`$${formatToMillions(point?.cost_saving ?? 0)}`}
                        unit="M"
                        description="Acumulado"
                        icon={DollarSign}
                        iconBgColor="bg-[var(--color-soft-green)]"
                        iconColor="text-[var(--color-dark-green)]"
                    />
                </div>

                <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-semibold text-[var(--color-subtitle)]">
                        Listado de Dispositivos
                    </h2>
                    
                    <div className="flex flex-col gap-4 p-4 bg-white border border-[var(--color-grey)] rounded-2xl shadow-sm">
                        <DataState
                            loading={devicesLoading}
                            error={devicesError}
                            isEmpty={!devicesData?.length}
                            loadingText="Cargando dispositivos..."
                            errorText="Error al cargar dispositivos"
                            emptyText="No hay dispositivos disponibles"
                        >
                            <DevicesFilter
                                devicesOptions={devicesOptions}
                                filters={filters}
                                onFilterChange={updateFilter}
                            />

                            <DevicesTable
                                data={filteredData}
                            />
                        </DataState>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PointDetail
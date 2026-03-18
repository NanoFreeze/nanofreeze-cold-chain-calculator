import { useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import ActionButton from "../../../Components/ActionButton"
import Card from "../../../Components/Card"
import DataState from "../../../Components/DataState"
import Map from "../../../Components/Map"
import PointsFilter from "../PointsFilter"
import PointsTable from "../PointsTable"
import StatusTag from "../../../Components/StatusTag"
import Tooltip from "../../../Components/Tooltip"
import { STATUS_STYLES } from "../../../Components/StatusTag/status.styles"
import { useFilteredData } from "../../../Hooks/useFilteredData"
import { useFilters } from "../../../Hooks/useFilters" 
import { useClientData } from "../Hooks/useClientData"
import { usePointData } from "../Hooks/usePointData"
import { formatToMillions, formatNumber } from "../../../Utils/formatters"
import { includesInsensitive, buildSelectOptions } from "../Clients.helpers"
import { Users, Plus, Store, Zap, Leaf, DollarSign, ChevronRight } from "lucide-react"

const ClientDetail = () => {

    const { id_client } = useParams()

    const { data: clientData, loading: clientLoading, error: clientError } = useClientData(id_client)
    const client = clientData?.[0]

    const { data: pointsData, loading: pointsLoading, error: pointsError } = usePointData(id_client)

    const statusStyleClient = STATUS_STYLES[client?.status ?? ""]

    const { filters, updateFilter } = useFilters({
        points: "",
    })

    const filterConfig = useMemo(() => ({
        points: (_itemValue, filterValue, item) => includesInsensitive(item?.name_pos, filterValue),
    }), [])

    const filteredData = useFilteredData(pointsData, filters, filterConfig)

    const pointsOptions = useMemo(
        () => buildSelectOptions(pointsData, "name_pos"),
        [pointsData]
    )

    const pointsLocations = useMemo(() => {
        if (!pointsData?.length) return []

        return pointsData
            .filter(p => p.latitude && p.longitude)
            .map(p => ({
                ...p,
                lat: Number(p.latitude),
                lng: Number(p.longitude),
            }))
    }, [pointsData])

    return (
        <div>
            <div className="flex items-center gap-2 pb-4 text-sm text-[var(--color-subtitle)]">
                <Link to="/clients" className="cursor-pointer hover:font-semibold text-inherit no-underline">
                    Clientes
                </Link>

                <ChevronRight className="w-4 h-4" />

                <span className="font-semibold">
                    {client?.name ?? ""}
                </span>
            </div>

            <div className="flex flex-col gap-8">
                <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-baseline gap-3">
                            <h1 className="text-2xl font-bold text-[var(--color-main-title)]">
                                {client?.name ?? ""}
                            </h1>

                            <Tooltip label="Ver contactos">
                                <ActionButton
                                    variant="secondaryIcon"
                                    icon={Users}
                                />
                            </Tooltip>
                        </div>

                        <div className="flex items-center gap-3">
                            <p className="text-sm text-[var(--color-subtitle)]">
                                {client?.client_code ?? ""}
                            </p>

                            <span className="w-px h-4 bg-[var(--color-text)]/50" />
                            
                            <StatusTag
                                label={client?.status ?? ""}
                                {...statusStyleClient}
                            />
                        </div>
                    </div>

                    <ActionButton
                        label="Agregar Punto de Venta"
                        variant="primary"
                        icon={Plus}
                    />
                </div>

                <div className="grid grid-cols-4 gap-8">
                    <Card
                        title="Puntos de venta"
                        value={client?.total_pos ?? 0}
                        icon={Store}
                    />

                    <Card
                        title="Consumo energético"
                        value={formatNumber(client?.energy_consumption ?? 0)}
                        unit="kWh"
                        description="Acumulado"
                        icon={Zap}
                        iconBgColor="bg-[var(--color-soft-green)]"
                        iconColor="text-[var(--color-dark-green)]"
                    />

                    <Card
                        title="CO₂ evitado"
                        value={formatNumber(client?.co2_avoided ?? 0)}
                        unit="ton"
                        description="Acumulado"
                        icon={Leaf}
                        iconBgColor="bg-[var(--color-soft-green)]"
                        iconColor="text-[var(--color-dark-green)]"
                    />

                    <Card
                        title="Ahorro estimado"
                        value={`$${formatToMillions(client?.cost_saving ?? 0)}`}
                        unit="M"
                        description="Acumulado"
                        icon={DollarSign}
                        iconBgColor="bg-[var(--color-soft-green)]"
                        iconColor="text-[var(--color-dark-green)]"
                    />
                </div>

                <div className="border border-[var(--color-grey)] rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between p-4 bg-[var(--color-soft-grey)] border-b border-[var(--color-grey)] rounded-t-2xl">
                        <h3 className="font-semibold text-[var(--color-subtitle)]">
                            Mapa de Puntos de Venta
                        </h3>
                    </div>

                    <div className="flex flex-col gap-6 p-4 bg-white rounded-b-2xl">
                        <Map
                            locations={pointsLocations}
                            icon={Store}
                        >
                            {(loc) => {
                                const statusStylePoint = STATUS_STYLES[loc.status ?? ""]

                                return (
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-baseline gap-x-2">
                                            <h4 className="text-sm font-semibold text-[var(--color-secondary-blue)]">
                                                {loc.name_pos}
                                            </h4>

                                            <p className="text-xs text-[var(--color-secondary-blue)]">
                                                {loc.pos_code}
                                            </p>
                                        </div>

                                        <StatusTag
                                            label={loc.status ?? ""}
                                            {...statusStylePoint}
                                        />

                                        <span className="text-xs text-[var(--color-text)]">
                                            {formatNumber(loc.energy_consumption)} kWh
                                        </span>

                                        <span className="text-xs text-[var(--color-text)]">
                                            {formatNumber(loc.co2_avoided)} ton
                                        </span>

                                        <span className="text-xs text-[var(--color-text)]">
                                            {formatToMillions(loc.cost_saving)} COP
                                        </span>
                                    </div>
                                )
                            }}
                        </Map>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-semibold text-[var(--color-subtitle)]">
                        Listado de Puntos de Venta
                    </h2>
                    
                    <div className="flex flex-col gap-4 p-4 bg-white border border-[var(--color-grey)] rounded-2xl shadow-sm">
                        <DataState
                            loading={pointsLoading}
                            error={pointsError}
                            isEmpty={!pointsData?.length}
                            loadingText="Cargando puntos de venta..."
                            errorText="Error al cargar puntos de venta"
                            emptyText="No hay puntos de venta disponibles"
                        >
                            <PointsFilter
                                pointsOptions={pointsOptions}
                                filters={filters}
                                onFilterChange={updateFilter}
                            />
                            
                            <PointsTable
                                data={filteredData}
                            />
                        </DataState>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ClientDetail
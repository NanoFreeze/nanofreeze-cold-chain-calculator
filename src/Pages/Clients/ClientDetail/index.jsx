import { useMemo } from "react"
import { useOutletContext, useParams, useSearchParams } from "react-router-dom"
import ActionButton from "../../../Components/ActionButton"
import Card from "../../../Components/Card"
import DataState from "../../../Components/DataState"
import DynamicModalForm from "../../../Components/DynamicModalForm"
import Map from "../../../Components/Map"
import OrgGroupCard from "../OrgGroupCard"
import PointsFilter from "../PointsFilter"
import PointsTable from "../PointsTable"
import StatusTag from "../../../Components/StatusTag"
import { STATUS_STYLES } from "../../../Components/StatusTag/status.styles"
import { useAppCreator } from "../../../Hooks/useAppCreator"
import { useFilteredData } from "../../../Hooks/useFilteredData"
import { useFilters } from "../../../Hooks/useFilters"
import { useModal } from "../../../Hooks/useModal"
import { usePointData } from "../Hooks/usePointData"
import { useHierarchyConfig } from "../Hooks/useHierarchyConfig"
import { useOrgUnits } from "../Hooks/useOrgUnits"
import { ELEMENTS, PENDING_ELEMENT_HINT } from "../elements"
import { formatToMillions, formatNumber } from "../../../Utils/formatters"
import { includesInsensitive, buildSelectOptions } from "../Clients.helpers"
import { Plus, Store, Zap, Leaf, DollarSign, ChevronRight } from "lucide-react"

const PATH_PARAM = "path"

const readPath = (searchParams) => {
    const raw = searchParams.get(PATH_PARAM)
    if (!raw) return []
    return raw
        .split("|")
        .map((segment) => decodeURIComponent(segment))
        .filter((s) => s.length > 0)
}

const writePath = (path) => path.map((s) => encodeURIComponent(s)).join("|")

const getElementIdentifier = (elements, elementId) =>
    elements?.find((e) => Number(e?.id) === elementId)?.identifier ?? ""

const ClientDetail = () => {
    const { id_client } = useParams()
    const [searchParams, setSearchParams] = useSearchParams()
    const { client } = useOutletContext() ?? {}

    const { data: pointsData, loading: pointsLoading, error: pointsError, reload: reloadPoints } =
        usePointData(id_client)
    const { config: hierarchyConfig } = useHierarchyConfig(id_client)

    const currentPath = useMemo(() => readPath(searchParams), [searchParams])

    const { units, leafPoints, levelIndex } = useOrgUnits(pointsData, hierarchyConfig, currentPath)

    const levels = hierarchyConfig?.levels ?? []
    const isLeafLevel = levels.length > 0 && levelIndex >= levels.length - 1
    const nextLevel = levels[levelIndex]
    const leafLabel = levels[levels.length - 1]?.pluralLabel ?? "Puntos de venta"

    const { filters, updateFilter } = useFilters({ points: "" })

    const filterConfig = useMemo(
        () => ({
            points: (_itemValue, filterValue, item) => includesInsensitive(item?.name_pos, filterValue),
        }),
        []
    )

    const filteredLeafData = useFilteredData(leafPoints, filters, filterConfig)
    const pointsOptions = useMemo(() => buildSelectOptions(leafPoints, "name_pos"), [leafPoints])

    const pointsLocations = useMemo(() => {
        if (!leafPoints?.length) return []
        return leafPoints
            .filter((p) => p.latitude && p.longitude)
            .map((p) => ({
                ...p,
                lat: Number(p.latitude),
                lng: Number(p.longitude),
            }))
    }, [leafPoints])

    const navigateToPath = (nextPath) => {
        const newParams = new URLSearchParams(searchParams)
        if (nextPath.length === 0) {
            newParams.delete(PATH_PARAM)
        } else {
            newParams.set(PATH_PARAM, writePath(nextPath))
        }
        setSearchParams(newParams)
    }

    const { data: addPosElements } = useAppCreator("elements", {
        queryParams: { elementId: ELEMENTS.FORM_ADD_POS ?? -1 },
    })
    const { data: editPosElements } = useAppCreator("elements", {
        queryParams: { elementId: ELEMENTS.FORM_EDIT_POS ?? -1 },
    })

    const elmFormAddPos = ELEMENTS.FORM_ADD_POS
        ? getElementIdentifier(addPosElements, ELEMENTS.FORM_ADD_POS)
        : ""
    const elmFormEditPos = ELEMENTS.FORM_EDIT_POS
        ? getElementIdentifier(editPosElements, ELEMENTS.FORM_EDIT_POS)
        : ""

    const addPosModal = useModal(elmFormAddPos, reloadPoints)
    const editPosModal = useModal(elmFormEditPos, reloadPoints)

    const canCreatePos = ELEMENTS.FORM_ADD_POS != null
    const canEditPos = ELEMENTS.FORM_EDIT_POS != null

    return (
        <div className="flex flex-col gap-8">
            {currentPath.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-[var(--color-subtitle)] flex-wrap">
                    <button
                        type="button"
                        onClick={() => navigateToPath([])}
                        className="cursor-pointer hover:font-semibold text-inherit bg-transparent border-0 p-0"
                    >
                        Resumen
                    </button>

                    {currentPath.map((segment, idx) => {
                        const isLast = idx === currentPath.length - 1
                        return (
                            <span key={`${segment}-${idx}`} className="flex items-center gap-2">
                                <ChevronRight className="w-4 h-4" />
                                {isLast ? (
                                    <span className="font-semibold">{segment}</span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => navigateToPath(currentPath.slice(0, idx + 1))}
                                        className="cursor-pointer hover:font-semibold text-inherit bg-transparent border-0 p-0"
                                    >
                                        {segment}
                                    </button>
                                )}
                            </span>
                        )
                    })}
                </div>
            )}

            <div className="grid grid-cols-4 gap-8">
                <Card title="Puntos de venta" value={client?.total_pos ?? 0} icon={Store} />

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

            <DataState
                loading={pointsLoading}
                error={pointsError}
                isEmpty={!pointsData?.length}
                loadingText="Cargando puntos de venta..."
                errorText="Error al cargar puntos de venta"
                emptyText="No hay puntos de venta disponibles"
            >
                {!isLeafLevel && (
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-[var(--color-subtitle)]">
                                {nextLevel?.pluralLabel ?? "Niveles"} ({units.length})
                            </h2>

                            <span className="text-sm text-[var(--color-text)]">
                                Selecciona un {nextLevel?.label?.toLowerCase()} para continuar
                            </span>
                        </div>

                        {units.length === 0 ? (
                            <div className="p-6 bg-white border border-[var(--color-grey)] rounded-2xl text-sm text-[var(--color-text)]">
                                Aún no hay {nextLevel?.pluralLabel?.toLowerCase()} configurados para este nivel.
                                Verifica que el campo <code>location</code> de los puntos de venta siga el formato
                                <code> {hierarchyConfig?.separator} </code> definido en la jerarquía.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {units.map((unit) => (
                                    <OrgGroupCard
                                        key={unit.value}
                                        unit={unit}
                                        onClick={() => navigateToPath(unit.path)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {isLeafLevel && (
                    <>
                        <div className="flex justify-end">
                            <span title={canCreatePos ? "" : PENDING_ELEMENT_HINT}>
                                <ActionButton
                                    label="Agregar Punto de Venta"
                                    variant="primary"
                                    icon={Plus}
                                    disabled={!canCreatePos}
                                    onClick={() => canCreatePos && addPosModal.openModal({ id_client })}
                                />
                            </span>
                        </div>

                        <div className="border border-[var(--color-grey)] rounded-2xl shadow-sm">
                            <div className="flex items-center justify-between p-4 bg-[var(--color-soft-grey)] border-b border-[var(--color-grey)] rounded-t-2xl">
                                <h3 className="font-semibold text-[var(--color-subtitle)]">
                                    Mapa de {leafLabel}
                                </h3>
                            </div>

                            <div className="flex flex-col gap-6 p-4 bg-white rounded-b-2xl">
                                <Map locations={pointsLocations} icon={Store}>
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

                                                <StatusTag label={loc.status ?? ""} {...statusStylePoint} />

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
                                Listado de {leafLabel}
                            </h2>

                            <div className="flex flex-col gap-4 p-4 bg-white border border-[var(--color-grey)] rounded-2xl shadow-sm">
                                <PointsFilter
                                    pointsOptions={pointsOptions}
                                    filters={filters}
                                    onFilterChange={updateFilter}
                                />

                                <PointsTable
                                    data={filteredLeafData}
                                    onEdit={canEditPos ? (row) => editPosModal.openModal(row) : null}
                                    editPendingHint={canEditPos ? "" : PENDING_ELEMENT_HINT}
                                />
                            </div>
                        </div>
                    </>
                )}
            </DataState>

            <DynamicModalForm
                modal={addPosModal}
                title="Agregar Punto de Venta"
                description="Completa la información para crear un nuevo punto de venta"
            />

            <DynamicModalForm
                modal={editPosModal}
                title="Modificar Punto de Venta"
                description="Actualiza la información del punto de venta"
            />
        </div>
    )
}

export default ClientDetail

import { useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import ActionButton from "../../../Components/ActionButton"
import Card from "../../../Components/Card"
import DataState from "../../../Components/DataState"
import DevicesFilter from "../DevicesFilter"
import DevicesTable from "../DevicesTable"
import DynamicModalForm from "../../../Components/DynamicModalForm"
import StatusTag from "../../../Components/StatusTag"
import Tooltip from "../../../Components/Tooltip"
import { STATUS_STYLES } from "../../../Components/StatusTag/status.styles"
import { useAppCreator } from "../../../Hooks/useAppCreator"
import { useFilteredData } from "../../../Hooks/useFilteredData"
import { useFilters } from "../../../Hooks/useFilters"
import { useModal } from "../../../Hooks/useModal"
import { usePointData } from "../Hooks/usePointData"
import { useDeviceData } from "../Hooks/useDeviceData"
import { ELEMENTS, PENDING_ELEMENT_HINT } from "../elements"
import { formatToMillions, formatNumber } from "../../../Utils/formatters"
import { includesInsensitive, buildSelectOptions } from "../Clients.helpers"
import { Plus, Box, Activity, Zap, Leaf, DollarSign, ChevronRight, SquarePen } from "lucide-react"

const getElementIdentifier = (elements, elementId) =>
    elements?.find((e) => Number(e?.id) === elementId)?.identifier ?? ""

const PointDetail = () => {

    const { id_client, id_point_of_sale } = useParams()

    const { data: pointData } = usePointData(id_client)
    const point = useMemo(
        () =>
            pointData?.find((p) => String(p?.id_point_of_sale) === String(id_point_of_sale)) ??
            pointData?.[0] ??
            null,
        [pointData, id_point_of_sale]
    )

    const statusStyle = STATUS_STYLES[point?.status ?? ""]

    const { data: devicesData, loading: devicesLoading, error: devicesError, reload: reloadDevices } =
        useDeviceData(id_client, id_point_of_sale)

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

    const { data: addDeviceElements } = useAppCreator("elements", {
        queryParams: { elementId: ELEMENTS.FORM_ADD_DEVICE ?? -1 },
    })
    const { data: editDeviceElements } = useAppCreator("elements", {
        queryParams: { elementId: ELEMENTS.FORM_EDIT_DEVICE ?? -1 },
    })
    const { data: editPosElements } = useAppCreator("elements", {
        queryParams: { elementId: ELEMENTS.FORM_EDIT_POS ?? -1 },
    })

    const elmFormAddDevice = ELEMENTS.FORM_ADD_DEVICE
        ? getElementIdentifier(addDeviceElements, ELEMENTS.FORM_ADD_DEVICE)
        : ""
    const elmFormEditDevice = ELEMENTS.FORM_EDIT_DEVICE
        ? getElementIdentifier(editDeviceElements, ELEMENTS.FORM_EDIT_DEVICE)
        : ""
    const elmFormEditPos = ELEMENTS.FORM_EDIT_POS
        ? getElementIdentifier(editPosElements, ELEMENTS.FORM_EDIT_POS)
        : ""

    const addDeviceModal = useModal(elmFormAddDevice, reloadDevices)
    const editDeviceModal = useModal(elmFormEditDevice, reloadDevices)
    const editPosModal = useModal(elmFormEditPos, () => {})

    const canAddDevice = ELEMENTS.FORM_ADD_DEVICE != null
    const canEditDevice = ELEMENTS.FORM_EDIT_DEVICE != null
    const canEditPos = ELEMENTS.FORM_EDIT_POS != null

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
                        <div className="flex items-baseline gap-3">
                            <h1 className="text-2xl font-bold text-[var(--color-main-title)]">
                                {point?.name_pos ?? ""}
                            </h1>

                            <Tooltip label={canEditPos ? "Editar punto de venta" : PENDING_ELEMENT_HINT}>
                                <ActionButton
                                    variant="secondaryIcon"
                                    icon={SquarePen}
                                    disabled={!canEditPos}
                                    onClick={() => canEditPos && editPosModal.openModal(point)}
                                />
                            </Tooltip>
                        </div>

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

                    <span title={canAddDevice ? "" : PENDING_ELEMENT_HINT}>
                        <ActionButton
                            label="Agregar Dispositivo"
                            variant="primary"
                            icon={Plus}
                            disabled={!canAddDevice}
                            onClick={() => canAddDevice && addDeviceModal.openModal({ id_point_of_sale })}
                        />
                    </span>
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
                                onEdit={canEditDevice ? (row) => editDeviceModal.openModal(row) : null}
                                editPendingHint={canEditDevice ? "" : PENDING_ELEMENT_HINT}
                            />
                        </DataState>
                    </div>
                </div>
            </div>

            <DynamicModalForm
                modal={addDeviceModal}
                title="Agregar Dispositivo"
                description="Completa la información para registrar un nuevo dispositivo"
            />

            <DynamicModalForm
                modal={editDeviceModal}
                title="Modificar Dispositivo"
                description="Actualiza la información del dispositivo"
            />

            <DynamicModalForm
                modal={editPosModal}
                title="Modificar Punto de Venta"
                description="Actualiza la información del punto de venta"
            />
        </div>
    )
}

export default PointDetail

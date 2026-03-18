import { useMemo, useCallback } from "react"
import ActionButton from "../../Components/ActionButton"
import Card from "../../Components/Card"
import ClientsFilter from "./ClientsFilter"
import ClientsListTable from "./ClientsListTable"
import DataState from "../../Components/DataState"
import DynamicModalForm from "../../Components/DynamicModalForm"
import { useTable } from "../../Hooks/useTable"
import { useAppCreator } from "../../Hooks/useAppCreator"
import { useFilteredData } from "../../Hooks/useFilteredData"
import { useFilters } from "../../Hooks/useFilters"
import { useModal } from "../../Hooks/useModal"
import { useClientsCount } from "./Hooks/useClientsCount"
import { usePointsCount } from "./Hooks/usePointsCount"
import { useDevicesCount } from "./Hooks/useDevicesCount"
import { includesInsensitive, buildSelectOptions } from "./Clients.helpers"
import { Plus, Building2, Store, Box } from "lucide-react"

const APP_ID = 2
const MODULE_ID = 1
const ELM_VW_CLIENTS = 1
const ELM_FORM_ADD_CLIENT = 8
const ELM_FORM_EDIT_CLIENT = 9

const getElementIdentifier = (elements, elementId) =>
    elements?.find((e) => Number(e?.id) === elementId)?.identifier ?? ""

const Clients = () => {

    const { data: elementsVw } = useAppCreator("elements", {
        queryParams: { elementId: ELM_VW_CLIENTS }
    })

    const elmVwClients = getElementIdentifier(elementsVw, ELM_VW_CLIENTS)

    const { data: elementsFormAdd } = useAppCreator("elements", {
        queryParams: { elementId: ELM_FORM_ADD_CLIENT }
    })

    const elmFormAddClient = getElementIdentifier(elementsFormAdd, ELM_FORM_ADD_CLIENT)

    const { data: elementsFormEdit } = useAppCreator("elements", {
        queryParams: { elementId: ELM_FORM_EDIT_CLIENT }
    })

    const elmFormEditClient = getElementIdentifier(elementsFormEdit, ELM_FORM_EDIT_CLIENT)

    const { data: clients, loading: clientsLoading, error: clientsError, reload } = useTable(elmVwClients)
    const { counts: clientCounts } = useClientsCount()
    const { counts: pointCounts } = usePointsCount()
    const { counts: deviceCounts } = useDevicesCount()

    const { filters, updateFilter } = useFilters({
        clients: "",
    })

    const filterConfig = useMemo(() => ({
        clients: (_itemValue, filterValue, item) => includesInsensitive(item?.name, filterValue),
    }), [])

    const filteredData = useFilteredData(clients, filters, filterConfig)

    const clientsOptions = useMemo(
        () => buildSelectOptions(clients, "name"),
        [clients]
    )

    const reloadClients = useCallback(() => {
        reload()
    }, [reload])

    const addClientModal = useModal(elmFormAddClient, reloadClients)
    const editClientModal = useModal(elmFormEditClient, reloadClients)

    //Configuracion de prellenado por modal
    const prefillConfig = [
        { fieldIndex: 0, key: "id_client" },
        { fieldIndex: 1, key: "client_code" },
        { fieldIndex: 2, key: "name" },
        { fieldIndex: 3, key: "status" },
    ]
    
    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-3">
                    <h1 className="text-2xl font-bold text-[var(--color-main-title)]">
                        Gestión de Clientes
                    </h1>

                    <p className="font-semibold text-[var(--color-subtitle)]">
                        Administra, visualiza y da seguimiento a tus clientes, sus puntos de venta y equipos asociados.
                    </p>
                </div>

                <ActionButton
                    label="Agregar Cliente"
                    variant="primary"
                    icon={Plus}
                    onClick={() => addClientModal.openModal()}
                />
            </div>

            <div className="grid grid-cols-3 gap-8">
                <Card
                    title="Clientes"
                    value={clientCounts.total}
                    description={`${clientCounts.actives} activos - ${clientCounts.inactives} inactivos`}
                    icon={Building2}
                />

                <Card
                    title="Puntos de venta"
                    value={pointCounts.total}
                    description={`${pointCounts.actives} activos - ${pointCounts.inactives} inactivos`}
                    icon={Store}
                />

                <Card
                    title="Equipos"
                    value={deviceCounts.total}
                    description={`${deviceCounts.freezers} Freezers - ${deviceCounts.chillers} Chillers`}
                    icon={Box}
                />
            </div>

            <div className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold text-[var(--color-subtitle)]">
                    Listado de Clientes
                </h2>
                
                <div className="flex flex-col gap-4 p-4 bg-white border border-[var(--color-grey)] rounded-2xl shadow-sm">
                    <DataState
                        loading={clientsLoading}
                        error={clientsError}
                        isEmpty={!clients?.length}
                        loadingText="Cargando clientes..."
                        errorText="Error al cargar clientes"
                        emptyText="No hay clientes disponibles"
                    >
                        <ClientsFilter
                            clientsOptions={clientsOptions}
                            filters={filters}
                            onFilterChange={updateFilter}
                        />

                        <ClientsListTable
                            data={filteredData}
                            onEdit={editClientModal.openModal}
                        />
                    </DataState>
                </div>
            </div>

            <DynamicModalForm
                modal={addClientModal}
                title="Agregar Cliente"
                description="Completa la información para crear un nuevo cliente"
            />

            <DynamicModalForm
                modal={editClientModal}
                title="Modificar Cliente"
                description="Completa la información para modificar el cliente"
                prefillConfig={prefillConfig}
            />
        </div>
    )
}

export default Clients
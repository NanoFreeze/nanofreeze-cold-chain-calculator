import { Link, NavLink, Outlet, useParams } from "react-router-dom"
import ActionButton from "../../../Components/ActionButton"
import DataState from "../../../Components/DataState"
import StatusTag from "../../../Components/StatusTag"
import Tooltip from "../../../Components/Tooltip"
import DynamicModalForm from "../../../Components/DynamicModalForm"
import { STATUS_STYLES } from "../../../Components/StatusTag/status.styles"
import { useAppCreator } from "../../../Hooks/useAppCreator"
import { useModal } from "../../../Hooks/useModal"
import { useClientData } from "../Hooks/useClientData"
import { ELEMENTS, PENDING_ELEMENT_HINT } from "../elements"
import { Users, ChevronRight, SquarePen, LayoutDashboard, FileText, BellRing, Settings2 } from "lucide-react"

const TABS = [
    { to: ".", label: "Resumen", icon: LayoutDashboard, end: true },
    { to: "contacts", label: "Contactos", icon: Users },
    { to: "reports", label: "Reportes", icon: FileText },
    { to: "alerts", label: "Alertas", icon: BellRing },
    { to: "hierarchy", label: "Jerarquía", icon: Settings2 },
]

const getElementIdentifier = (elements, elementId) =>
    elements?.find((e) => Number(e?.id) === elementId)?.identifier ?? ""

const ClientShell = () => {
    const { id_client } = useParams()
    const { data: clientData, loading: clientLoading, error: clientError, reload } = useClientData(id_client)
    const client = clientData?.[0]

    const { data: elementsFormEdit } = useAppCreator("elements", {
        queryParams: { elementId: ELEMENTS.FORM_EDIT_CLIENT },
    })
    const elmFormEditClient = getElementIdentifier(elementsFormEdit, ELEMENTS.FORM_EDIT_CLIENT)
    const editClientModal = useModal(elmFormEditClient, reload)

    const editPrefillConfig = [
        { fieldIndex: 0, key: "id_client" },
        { fieldIndex: 1, key: "client_code" },
        { fieldIndex: 2, key: "name" },
        { fieldIndex: 3, key: "status" },
    ]

    const statusStyleClient = STATUS_STYLES[client?.status ?? ""]

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 text-sm text-[var(--color-subtitle)]">
                <Link to="/clients" className="cursor-pointer hover:font-semibold text-inherit no-underline">
                    Clientes
                </Link>

                <ChevronRight className="w-4 h-4" />

                <span className="font-semibold">{client?.name ?? ""}</span>
            </div>

            <DataState
                loading={clientLoading}
                error={clientError}
                isEmpty={!client}
                loadingText="Cargando cliente..."
                errorText="Error al cargar el cliente"
                emptyText="Cliente no encontrado"
            >
                <div className="flex justify-between items-start gap-6">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-baseline gap-3">
                            <h1 className="text-2xl font-bold text-[var(--color-main-title)]">
                                {client?.name ?? ""}
                            </h1>

                            <Tooltip label="Editar cliente">
                                <ActionButton
                                    variant="secondaryIcon"
                                    icon={SquarePen}
                                    onClick={() => editClientModal.openModal(client)}
                                />
                            </Tooltip>
                        </div>

                        <div className="flex items-center gap-3">
                            <p className="text-sm text-[var(--color-subtitle)]">
                                {client?.client_code ?? ""}
                            </p>

                            <span className="w-px h-4 bg-[var(--color-text)]/50" />

                            <StatusTag label={client?.status ?? ""} {...statusStyleClient} />
                        </div>
                    </div>
                </div>

                <nav className="flex items-center gap-1 border-b border-[var(--color-grey)] -mx-1 px-1 overflow-x-auto">
                    {TABS.map((tab) => (
                        <NavLink
                            key={tab.label}
                            to={tab.to}
                            end={tab.end}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-4 py-2.5 text-sm font-semibold no-underline transition-colors whitespace-nowrap border-b-2 ${
                                    isActive
                                        ? "text-[var(--color-primary-blue)] border-[var(--color-primary-blue)]"
                                        : "text-[var(--color-subtitle)] border-transparent hover:text-[var(--color-primary-blue)]"
                                }`
                            }
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </NavLink>
                    ))}
                </nav>
            </DataState>

            <Outlet context={{ client, reloadClient: reload }} />

            <DynamicModalForm
                modal={editClientModal}
                title="Modificar Cliente"
                description="Completa la información para modificar el cliente"
                prefillConfig={editPrefillConfig}
            />

            {!ELEMENTS.FORM_EDIT_CLIENT && (
                <p className="text-xs text-[var(--color-text)]">
                    {PENDING_ELEMENT_HINT}
                </p>
            )}
        </div>
    )
}

export default ClientShell

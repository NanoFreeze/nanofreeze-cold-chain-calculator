import { useMemo } from "react"
import { useOutletContext, useParams } from "react-router-dom"
import ActionButton from "../../../Components/ActionButton"
import DataState from "../../../Components/DataState"
import DynamicModalForm from "../../../Components/DynamicModalForm"
import GenericTable from "../../../Components/GenericTable"
import { useAppCreator } from "../../../Hooks/useAppCreator"
import { useModal } from "../../../Hooks/useModal"
import { useContactData } from "../Hooks/useContactData"
import { ELEMENTS, PENDING_ELEMENT_HINT } from "../elements"
import { Plus, SquarePen, BellRing, BellOff, Mail, Phone } from "lucide-react"

const getElementIdentifier = (elements, elementId) =>
    elements?.find((e) => Number(e?.id) === elementId)?.identifier ?? ""

const initials = (name) =>
    (name ?? "")
        .toString()
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "?"

const Contacts = () => {
    const { id_client } = useParams()
    const { client } = useOutletContext() ?? {}

    const { data, loading, error, reload } = useContactData(id_client)

    const { data: addElements } = useAppCreator("elements", {
        queryParams: { elementId: ELEMENTS.FORM_ADD_CONTACT ?? -1 },
    })
    const { data: editElements } = useAppCreator("elements", {
        queryParams: { elementId: ELEMENTS.FORM_EDIT_CONTACT ?? -1 },
    })

    const elmFormAddContact = ELEMENTS.FORM_ADD_CONTACT
        ? getElementIdentifier(addElements, ELEMENTS.FORM_ADD_CONTACT)
        : ""
    const elmFormEditContact = ELEMENTS.FORM_EDIT_CONTACT
        ? getElementIdentifier(editElements, ELEMENTS.FORM_EDIT_CONTACT)
        : ""

    const addContactModal = useModal(elmFormAddContact, reload)
    const editContactModal = useModal(elmFormEditContact, reload)

    const canCreate = ELEMENTS.FORM_ADD_CONTACT != null
    const canEdit = ELEMENTS.FORM_EDIT_CONTACT != null

    const columns = useMemo(
        () => [
            { key: "name", label: "Nombre" },
            { key: "position", label: "Cargo" },
            { key: "phone", label: "Teléfono" },
            { key: "email", label: "Correo electrónico" },
            { key: "receive_notifications", label: "Notificaciones" },
            { key: "edit", label: "Modificar" },
        ],
        []
    )

    const renderCell = (row, key) => {
        switch (key) {
            case "name":
                return (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--color-primary-soft-blue)] text-[var(--color-subtitle)] text-xs font-semibold">
                            {initials(row.name)}
                        </div>
                        <span className="font-semibold text-[var(--color-subtitle)]">{row.name}</span>
                    </div>
                )

            case "phone":
                return row.phone ? (
                    <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4 text-[var(--color-text)] stroke-[1.75]" />
                        <span>{row.phone}</span>
                    </div>
                ) : (
                    <span className="text-[var(--color-text)]">—</span>
                )

            case "email":
                return row.email ? (
                    <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4 text-[var(--color-text)] stroke-[1.75]" />
                        <a
                            href={`mailto:${row.email}`}
                            className="text-[var(--color-primary-blue)] hover:underline"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {row.email}
                        </a>
                    </div>
                ) : (
                    <span className="text-[var(--color-text)]">—</span>
                )

            case "receive_notifications":
                return row.receive_notifications ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-soft-green)] text-[var(--color-dark-green)]">
                        <BellRing className="w-3.5 h-3.5" />
                        Activadas
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-soft-grey)] text-[var(--color-text)]">
                        <BellOff className="w-3.5 h-3.5" />
                        Silenciadas
                    </span>
                )

            case "edit":
                return (
                    <span title={canEdit ? "" : PENDING_ELEMENT_HINT} onClick={(e) => e.stopPropagation()}>
                        <ActionButton
                            variant="secondaryIcon"
                            icon={SquarePen}
                            disabled={!canEdit}
                            onClick={() => canEdit && editContactModal.openModal(row)}
                        />
                    </span>
                )

            default:
                return row[key]
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-semibold text-[var(--color-subtitle)]">
                        Contactos
                    </h2>
                    <p className="text-sm text-[var(--color-text)]">
                        Personas autorizadas a recibir notificaciones, reportes y alertas
                        de {client?.name ?? "este cliente"}.
                    </p>
                </div>

                <span title={canCreate ? "" : PENDING_ELEMENT_HINT}>
                    <ActionButton
                        label="Agregar Contacto"
                        variant="primary"
                        icon={Plus}
                        disabled={!canCreate}
                        onClick={() => canCreate && addContactModal.openModal({ id_client })}
                    />
                </span>
            </div>

            <div className="flex flex-col gap-4 p-4 bg-white border border-[var(--color-grey)] rounded-2xl shadow-sm">
                <DataState
                    loading={loading}
                    error={error}
                    isEmpty={!data?.length}
                    loadingText="Cargando contactos..."
                    errorText="Error al cargar contactos"
                    emptyText="Aún no hay contactos para este cliente."
                >
                    <GenericTable columns={columns} data={data ?? []} renderCell={renderCell} />
                </DataState>
            </div>

            <DynamicModalForm
                modal={addContactModal}
                title="Agregar Contacto"
                description="Completa la información para crear un nuevo contacto"
            />

            <DynamicModalForm
                modal={editContactModal}
                title="Modificar Contacto"
                description="Actualiza la información del contacto"
                prefillConfig={[
                    { fieldIndex: 0, key: "id_contact" },
                    { fieldIndex: 1, key: "name" },
                    { fieldIndex: 2, key: "position" },
                    { fieldIndex: 3, key: "phone" },
                    { fieldIndex: 4, key: "email" },
                    { fieldIndex: 5, key: "receive_notifications" },
                ]}
            />
        </div>
    )
}

export default Contacts

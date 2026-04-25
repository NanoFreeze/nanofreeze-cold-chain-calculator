import { useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import ActionButton from "../../../Components/ActionButton"
import GenericTable from "../../../Components/GenericTable"
import StatusTag from "../../../Components/StatusTag"
import { STATUS_STYLES } from "../../../Components/StatusTag/status.styles"
import { Box, Thermometer, Snowflake, SquarePen } from "lucide-react"

const DevicesTable = ({ data, onEdit, editPendingHint = "" }) => {

    const navigate = useNavigate()

    const handleRowClick = useCallback((row) => {
        if  (!row.id_device) return
        navigate(`/clients/${row.id_client}/sale-points/${row.id_point_of_sale}/devices/${row.id_device}`)
    }, [navigate])

    const columns = useMemo(() => [
        { key: "name", label: "Nombre / ID" },
        { key: "type_device", label: "Tipo" },
        { key: "status", label: "Conectividad" },
        { key: "operational_status", label: "Estado operativo" },
        { key: "edit", label: "Modificar" },
    ], [])

    const renderCell = useCallback((row, key) => {
        const statusStyle = STATUS_STYLES[row.status]

        switch (key) {
            case "name": {
                const Icon = row.type_device === "Freezer" ? Snowflake : row.type_device === "Chiller" ? Thermometer : Box
                const bgClass = row.type_device === "Freezer" ? "bg-[var(--color-soft-blue)]" : row.type_device === "Chiller" ? "bg-[var(--color-soft-green)]" : "bg-[var(--color-primary-dark-blue)]"
                const textClass = row.type_device === "Freezer" ? "text-[var(--color-blue)]" : row.type_device === "Chiller" ? "text-[var(--color-green)]" : "bg-[var(--color-primary-soft-blue)]"

                return (
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${bgClass}`}>
                            <Icon className={`w-6 h-6 ${textClass} stroke-[1.75]`} />
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="font-semibold text-[var(--color-subtitle)]">
                                {row.name}
                            </span>

                            <span className="text-xs text-[var(--color-text)]">
                                {row.device_code}
                            </span>
                        </div>
                    </div>
                )
            }

            case "status":
                return (
                    <StatusTag
                        label={row.status}
                        {...statusStyle}
                    />
                )
                
            case "edit":
                return (
                    <div onClick={(e) => e.stopPropagation()} title={onEdit ? "" : editPendingHint}>
                        <ActionButton
                            variant="secondaryIcon"
                            icon={SquarePen}
                            disabled={!onEdit}
                            onClick={onEdit ? () => onEdit(row) : undefined}
                        />
                    </div>
                )

            default:
                return row[key]
        }
    }, [onEdit, editPendingHint])

    return (
        <GenericTable
            columns={columns}
            data={data}
            renderCell={renderCell}
            onRowClick={handleRowClick}
        />
    )
}

export default DevicesTable
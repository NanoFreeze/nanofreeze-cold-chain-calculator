import { useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import ActionButton from "../../../Components/ActionButton"
import GenericTable from "../../../Components/GenericTable"
import StatusTag from "../../../Components/StatusTag"
import { STATUS_STYLES } from "../../../Components/StatusTag/status.styles"
import { Store, MapPin, SquarePen } from "lucide-react"

const PointsTable = ({ data, onEdit, editPendingHint = "" }) => {

    const navigate = useNavigate()

    const handleRowClick = useCallback((row) => {
        if  (!row.id_point_of_sale) return
        navigate(`/clients/${row.id_client}/sale-points/${row.id_point_of_sale}`)
    }, [navigate])

    const columns = useMemo(() => [
        { key: "name_pos", label: "Nombre / ID" },
        { key: "type_industry", label: "Industria" },
        { key: "location", label: "Ubicación" },
        { key: "total_devices", label: "Equipos" },
        { key: "status", label: "Estado" },
        { key: "edit", label: "Modificar" },
    ], [])

    const renderCell = useCallback((row, key) => {
        const statusStyle = STATUS_STYLES[row.status]

        switch (key) {
            case "name_pos":
                return (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-[var(--color-primary-soft-blue)] rounded-xl">
                            <Store className="w-6 h-6 text-[var(--color-subtitle)] stroke-[1.75]" />
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="font-semibold text-[var(--color-subtitle)]">
                                {row.name_pos}
                            </span>

                            <span className="text-xs text-[var(--color-text)]">
                                {row.pos_code}
                            </span>
                        </div>
                    </div>
                )

            case "location":
                return (
                    <div className="flex items-center gap-1">
                        <MapPin className="w-5 h-5 text-[var(--color-text)] stroke-[1.75]" />
                        <span>
                            {row.location}
                        </span>
                    </div>
                )

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

export default PointsTable
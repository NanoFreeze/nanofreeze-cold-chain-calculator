import { useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import ActionButton from "../../../Components/ActionButton"
import GenericTable from "../../../Components/GenericTable"
import StatusTag from "../../../Components/StatusTag"
import { STATUS_STYLES } from "../../../Components/StatusTag/status.styles"
import { Building2, Thermometer, Snowflake, SquarePen } from "lucide-react"

const ClientsListTable = ({ data, onEdit }) => {

    const navigate = useNavigate()

    const handleRowClick = useCallback((row) => {
        if  (!row.id_client) return
        navigate(`/clients/${row.id_client}`)
    }, [navigate])

    const columns = useMemo(() => [
        { key: "name", label: "Cliente" },
        { key: "devices", label: "Total equipos" },
        { key: "status", label: "Estado" },
        { key: "edit", label: "Modificar" },
    ], [])

    const renderCell = useCallback((row, key) => {
        const statusStyle = STATUS_STYLES[row.status]
        
        switch (key) {
            case "name":
                return (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-[var(--color-primary-soft-blue)] rounded-xl">
                            <Building2 className="w-6 h-6 text-[var(--color-subtitle)] stroke-[1.75]" />
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="font-semibold text-[var(--color-subtitle)]">
                                {row.name}
                            </span>

                            <span>
                                {row.total_pos}{" "}
                                {row.total_pos === 1 ? "punto de venta" : "puntos de venta"}
                            </span>
                        </div>
                    </div>
                )

            case "devices":
                return (
                    <div className="flex items-center justify-start gap-4">
                        <span className="font-semibold text-[var(--color-subtitle)]">
                            {row.total_devices}
                        </span>

                        <div className="flex items-center gap-1">
                            <Snowflake className="w-5 h-5 text-[var(--color-blue)] stroke-[1.75]" />
                            <span>
                                {row.total_freezers}
                            </span>
                        </div>

                        <div className="flex items-center gap-1">
                            <Thermometer className="w-5 h-5 text-[var(--color-green)] stroke-[1.75]" />
                            <span>
                                {row.total_chillers}
                            </span>
                        </div>
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
                    <div onClick={(e) => e.stopPropagation()}>
                        <ActionButton
                            variant="secondaryIcon"
                            icon={SquarePen}
                            onClick={() => onEdit(row)}
                        />
                    </div>
                )

            default:
                return row[key]
        }
    }, [onEdit])

    return (
        <GenericTable
            columns={columns}
            data={data}
            renderCell={renderCell}
            onRowClick={handleRowClick}
        />
    )
}

export default ClientsListTable
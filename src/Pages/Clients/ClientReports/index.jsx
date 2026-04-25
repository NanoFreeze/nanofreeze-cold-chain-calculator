import { useMemo } from "react"
import { useOutletContext, useParams } from "react-router-dom"
import ActionButton from "../../../Components/ActionButton"
import Card from "../../../Components/Card"
import DataState from "../../../Components/DataState"
import GenericTable from "../../../Components/GenericTable"
import { useClientReportData } from "../Hooks/useClientReportData"
import { formatNumber } from "../../../Utils/formatters"
import { Download, FileText, CircleDollarSign, CheckCircle2, AlertCircle } from "lucide-react"

const formatPeriod = (start, end) => {
    if (!start && !end) return "—"
    const fmt = (d) => {
        if (!d) return ""
        const dateObj = new Date(d)
        if (Number.isNaN(dateObj.getTime())) return d
        return dateObj.toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "2-digit" })
    }
    return `${fmt(start)} → ${fmt(end)}`
}

const ClientReports = () => {
    const { id_client } = useParams()
    const { client } = useOutletContext() ?? {}

    const { data, loading, error, empty } = useClientReportData(id_client)

    const totals = useMemo(() => {
        if (!Array.isArray(data) || !data.length) return { total: 0, paid: 0, pending: 0, sum: 0 }
        return data.reduce(
            (acc, r) => {
                const amount = Number(r.total_to_pay ?? 0)
                acc.total += 1
                acc.sum += amount
                if (r.is_cancelled) acc.paid += 1
                else acc.pending += 1
                return acc
            },
            { total: 0, paid: 0, pending: 0, sum: 0 }
        )
    }, [data])

    const columns = useMemo(
        () => [
            { key: "period", label: "Período" },
            { key: "point", label: "Punto de venta" },
            { key: "total_to_pay", label: "Total a pagar" },
            { key: "currency_type", label: "Moneda" },
            { key: "is_cancelled", label: "Estado" },
            { key: "download", label: "Acciones" },
        ],
        []
    )

    const renderCell = (row, key) => {
        switch (key) {
            case "period":
                return (
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[var(--color-text)]" />
                        <span>{formatPeriod(row.period_start, row.period_end)}</span>
                    </div>
                )

            case "point":
                return (
                    <div className="flex flex-col">
                        <span className="font-semibold text-[var(--color-subtitle)]">
                            {row.point?.name_pos ?? "—"}
                        </span>
                        <span className="text-xs text-[var(--color-text)]">
                            {row.point?.pos_code ?? ""}
                        </span>
                    </div>
                )

            case "total_to_pay":
                return (
                    <span className="font-semibold text-[var(--color-subtitle)]">
                        {formatNumber(row.total_to_pay ?? 0)}
                    </span>
                )

            case "is_cancelled":
                return row.is_cancelled ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-soft-grey)] text-[var(--color-text)]">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Cancelado
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-soft-green)] text-[var(--color-dark-green)]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Vigente
                    </span>
                )

            case "download":
                return (
                    <span title="Descarga pendiente: endpoint de PDF aún no expuesto">
                        <ActionButton variant="secondaryIcon" icon={Download} disabled />
                    </span>
                )

            default:
                return row[key]
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-[var(--color-subtitle)]">Reportes</h2>
                <p className="text-sm text-[var(--color-text)]">
                    Facturas y reportes administrativos generados por punto de venta
                    de {client?.name ?? "este cliente"}.
                </p>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <Card title="Reportes" value={totals.total} icon={FileText} />
                <Card
                    title="Vigentes / Cancelados"
                    value={`${totals.pending} / ${totals.paid}`}
                    icon={CheckCircle2}
                    iconBgColor="bg-[var(--color-soft-green)]"
                    iconColor="text-[var(--color-dark-green)]"
                />
                <Card
                    title="Suma facturada"
                    value={formatNumber(totals.sum)}
                    icon={CircleDollarSign}
                    iconBgColor="bg-[var(--color-soft-green)]"
                    iconColor="text-[var(--color-dark-green)]"
                />
            </div>

            <div className="flex flex-col gap-4 p-4 bg-white border border-[var(--color-grey)] rounded-2xl shadow-sm">
                <DataState
                    loading={loading}
                    error={error}
                    isEmpty={empty || !data?.length}
                    loadingText="Cargando reportes..."
                    errorText="Error al cargar reportes"
                    emptyText="Aún no hay reportes administrativos para este cliente."
                >
                    <GenericTable columns={columns} data={data ?? []} renderCell={renderCell} />
                </DataState>
            </div>
        </div>
    )
}

export default ClientReports

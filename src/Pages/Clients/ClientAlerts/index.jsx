import { useMemo } from "react"
import { useOutletContext, useParams } from "react-router-dom"
import Card from "../../../Components/Card"
import DataState from "../../../Components/DataState"
import GenericTable from "../../../Components/GenericTable"
import { useClientAlertData } from "../Hooks/useClientAlertData"
import { AlertTriangle, BellRing, ShieldAlert } from "lucide-react"

const SEVERITY_BUCKETS = {
    critical: ["critical", "critico", "crítico", "alta"],
    warning: ["warning", "advertencia", "media"],
    info: ["info", "informativo", "baja"],
}

const classify = (level) => {
    const norm = (level ?? "").toString().toLowerCase()
    if (SEVERITY_BUCKETS.critical.some((s) => norm.includes(s))) return "critical"
    if (SEVERITY_BUCKETS.warning.some((s) => norm.includes(s))) return "warning"
    return "info"
}

const SEVERITY_BADGES = {
    critical: { label: "Crítica", classes: "bg-[var(--color-primary-soft-red)] text-[var(--color-red)]" },
    warning: { label: "Advertencia", classes: "bg-[var(--color-soft-yellow)] text-[var(--color-yellow)]" },
    info: { label: "Informativa", classes: "bg-[var(--color-primary-soft-blue)] text-[var(--color-primary-blue)]" },
}

const formatDateTime = (raw) => {
    if (!raw) return "—"
    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) return raw
    return d.toLocaleString("es-CO", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    })
}

const ClientAlerts = () => {
    const { id_client } = useParams()
    const { client } = useOutletContext() ?? {}

    const { data, loading, error, empty } = useClientAlertData(id_client)

    const counts = useMemo(() => {
        const acc = { total: 0, critical: 0, warning: 0, info: 0 }
        ;(data ?? []).forEach((a) => {
            acc.total += 1
            acc[classify(a?.severity ?? a?.level ?? a?.priority)] += 1
        })
        return acc
    }, [data])

    const columns = useMemo(
        () => [
            { key: "severity", label: "Severidad" },
            { key: "type", label: "Tipo" },
            { key: "device", label: "Dispositivo" },
            { key: "message", label: "Mensaje" },
            { key: "created_at", label: "Fecha" },
        ],
        []
    )

    const renderCell = (row, key) => {
        switch (key) {
            case "severity": {
                const cat = classify(row.severity ?? row.level ?? row.priority)
                const meta = SEVERITY_BADGES[cat]
                return (
                    <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${meta.classes}`}
                    >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        {meta.label}
                    </span>
                )
            }

            case "type":
                return row.type ?? row.alarm_type ?? "—"

            case "device":
                return (
                    <div className="flex flex-col">
                        <span className="font-semibold text-[var(--color-subtitle)]">
                            {row.device_name ?? row.name ?? row.id_device}
                        </span>
                        <span className="text-xs text-[var(--color-text)]">{row.device_code ?? ""}</span>
                    </div>
                )

            case "message":
                return row.message ?? row.description ?? "—"

            case "created_at":
                return formatDateTime(row.created_at ?? row.timestamp)

            default:
                return row[key]
        }
    }

    const isUnsupported =
        error && /404|400|alarms/i.test(String(error?.message ?? error))

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-[var(--color-subtitle)]">Alertas</h2>
                <p className="text-sm text-[var(--color-text)]">
                    Eventos detectados en los dispositivos de {client?.name ?? "este cliente"}.
                </p>
            </div>

            <div className="grid grid-cols-4 gap-6">
                <Card title="Total" value={counts.total} icon={BellRing} />
                <Card
                    title="Críticas"
                    value={counts.critical}
                    icon={AlertTriangle}
                    iconBgColor="bg-[var(--color-primary-soft-red)]"
                    iconColor="text-[var(--color-red)]"
                />
                <Card
                    title="Advertencias"
                    value={counts.warning}
                    icon={ShieldAlert}
                    iconBgColor="bg-[var(--color-soft-yellow)]"
                    iconColor="text-[var(--color-yellow)]"
                />
                <Card title="Informativas" value={counts.info} icon={BellRing} />
            </div>

            <div className="flex flex-col gap-4 p-4 bg-white border border-[var(--color-grey)] rounded-2xl shadow-sm">
                {isUnsupported ? (
                    <div className="text-sm text-[var(--color-text)] p-4">
                        La fuente de alertas (<code>alarms</code>) aún no está disponible en el backend. Esta vista
                        se hidratará automáticamente cuando la tabla esté expuesta.
                    </div>
                ) : (
                    <DataState
                        loading={loading}
                        error={error}
                        isEmpty={empty || !data?.length}
                        loadingText="Cargando alertas..."
                        errorText="Error al cargar alertas"
                        emptyText="Sin alertas para este cliente."
                    >
                        <GenericTable columns={columns} data={data ?? []} renderCell={renderCell} />
                    </DataState>
                )}
            </div>
        </div>
    )
}

export default ClientAlerts

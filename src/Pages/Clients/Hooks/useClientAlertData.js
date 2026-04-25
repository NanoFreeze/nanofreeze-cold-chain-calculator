import { useMemo } from "react"
import { useTable } from "../../../Hooks/useTable"
import { usePointData } from "./usePointData"

// Fetches all alarms and filters client-side. The backend only documents `=`
// and `>` comparators; once `in` (or a per-client/per-device endpoint) exists,
// switch to a server-side filter.
export const useClientAlertData = (id_client) => {
    const { data: points } = usePointData(id_client)

    const pointIdSet = useMemo(() => {
        const set = new Set()
        ;(points ?? []).forEach((p) => {
            if (p?.id_point_of_sale != null) set.add(String(p.id_point_of_sale))
        })
        return set
    }, [points])

    // Pull all devices (no client filter on the backend); we filter by point set.
    const { data: allDevices } = useTable("device", null, "rows")

    const deviceIdSet = useMemo(() => {
        const set = new Set()
        ;(allDevices ?? []).forEach((d) => {
            if (d?.id_point_of_sale != null && pointIdSet.has(String(d.id_point_of_sale))) {
                if (d?.id_device != null) set.add(String(d.id_device))
            }
        })
        return set
    }, [allDevices, pointIdSet])

    const devicesById = useMemo(() => {
        const map = {}
        ;(allDevices ?? []).forEach((d) => {
            if (d?.id_device != null) map[String(d.id_device)] = d
        })
        return map
    }, [allDevices])

    const { data: rawAlerts, loading, error, reload } = useTable("alarms", null, "rows")

    const filtered = useMemo(() => {
        if (!Array.isArray(rawAlerts)) return []
        return rawAlerts
            .filter((a) => a?.id_device != null && deviceIdSet.has(String(a.id_device)))
            .map((a) => ({
                ...a,
                device_name: devicesById[String(a.id_device)]?.name ?? null,
                device_code: devicesById[String(a.id_device)]?.device_code ?? null,
            }))
    }, [rawAlerts, deviceIdSet, devicesById])

    return {
        data: filtered,
        loading,
        error,
        reload,
        empty: deviceIdSet.size === 0,
    }
}

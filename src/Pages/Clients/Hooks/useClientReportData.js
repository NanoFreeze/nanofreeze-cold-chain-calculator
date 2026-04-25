import { useMemo } from "react"
import { useTable } from "../../../Hooks/useTable"
import { usePointData } from "./usePointData"

// Fetches all administrative reports and filters client-side to this client's
// points-of-sale. Once the backend exposes an `in` comparator (or a join API
// keyed by id_client), this hook should switch to a server-side filter.
export const useClientReportData = (id_client) => {
    const { data: points, loading: pointsLoading, error: pointsError } = usePointData(id_client)

    const pointIdSet = useMemo(() => {
        const set = new Set()
        ;(points ?? []).forEach((p) => {
            if (p?.id_point_of_sale != null) set.add(String(p.id_point_of_sale))
        })
        return set
    }, [points])

    const { data: reports, loading: reportsLoading, error: reportsError, reload } = useTable(
        "administrative_report",
        null,
        "rows"
    )

    const pointsById = useMemo(() => {
        const map = {}
        ;(points ?? []).forEach((p) => {
            if (p?.id_point_of_sale != null) map[String(p.id_point_of_sale)] = p
        })
        return map
    }, [points])

    const enrichedReports = useMemo(() => {
        if (!Array.isArray(reports)) return []
        return reports
            .filter((r) => r?.id_point_of_sale != null && pointIdSet.has(String(r.id_point_of_sale)))
            .map((r) => ({
                ...r,
                point: pointsById[String(r.id_point_of_sale)] ?? null,
            }))
    }, [reports, pointIdSet, pointsById])

    return {
        data: enrichedReports,
        loading: pointsLoading || reportsLoading,
        error: pointsError || reportsError,
        reload,
        empty: pointIdSet.size === 0,
    }
}

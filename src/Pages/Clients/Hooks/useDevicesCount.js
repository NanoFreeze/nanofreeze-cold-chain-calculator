import { useMemo } from "react"
import { useTable } from "../../../Hooks/useTable"

export const useDevicesCount = () => {

    const { data: totalDevices, loading: devicesLoading, error: devicesError } = useTable("device", null, "count")

    const activeQuery = useMemo(() => ({
        conditions: [
            {
                column: "type_device",
                comparator: "=",
                value: "Freezer",
                next: null
            }
        ]
    }), [])

    const { data: totalFreezers, loading: freezersLoading, error: freezersError } = useTable("device", activeQuery, "queryCount")

    const inactiveQuery = useMemo(() => ({
        conditions: [
            {
                column: "type_device",
                comparator: "=",
                value: "Chiller",
                next: null
            }
        ]
    }), [])

    const { data: totalChillers, loading: chillersLoading, error: chillersError } = useTable("device", inactiveQuery, "queryCount")

    return {
        counts: {
            total: totalDevices ?? 0,
            freezers: totalFreezers?.filtered ?? 0,
            chillers: totalChillers?.filtered ?? 0,
        },
        loading: devicesLoading || freezersLoading || chillersLoading,
        error: devicesError || freezersError || chillersError,
    }
}
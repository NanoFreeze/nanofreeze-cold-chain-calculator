import { useMemo } from "react"
import { useTable } from "../../../Hooks/useTable"

export const useClientsCount = () => {

    const { data: totalClients, loading: clientsLoading, error: clientsError } = useTable("clients", null, "count")

    const activeQuery = useMemo(() => ({
        conditions: [
            {
                column: "status",
                comparator: "=",
                value: "Activo",
                next: null
            }
        ]
    }), [])

    const { data: totalActives, loading: activesLoading, error: activesError } = useTable("clients", activeQuery, "queryCount")

    const inactiveQuery = useMemo(() => ({
        conditions: [
            {
                column: "status",
                comparator: "=",
                value: "Inactivo",
                next: null
            }
        ]
    }), [])

    const { data: totalInactives, loading: inactivesLoading, error: inactivesError } = useTable("clients", inactiveQuery, "queryCount")

    return {
        counts: {
            total: totalClients ?? 0,
            actives: totalActives?.filtered ?? 0,
            inactives: totalInactives?.filtered ?? 0,
        },
        loading: clientsLoading || activesLoading || inactivesLoading,
        error: clientsError || activesError || inactivesError,
    }
}
import { useMemo } from "react"
import { useTable } from "../../../Hooks/useTable"

export const usePointsCount = () => {

    const { data: totalPoints, loading: pointsLoading, error: pointsError } = useTable("point_of_sale", null, "count")

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

    const { data: totalActives, loading: activesLoading, error: activesError } = useTable("point_of_sale", activeQuery, "queryCount")

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

    const { data: totalInactives, loading: inactivesLoading, error: inactivesError } = useTable("point_of_sale", inactiveQuery, "queryCount")

    return {
        counts: {
            total: totalPoints ?? 0,
            actives: totalActives?.filtered ?? 0,
            inactives: totalInactives?.filtered ?? 0,
        },
        loading: pointsLoading || activesLoading || inactivesLoading,
        error: pointsError || activesError || inactivesError,
    }
}
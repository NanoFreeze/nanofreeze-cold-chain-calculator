import { useMemo } from "react"
import { useAppCreator } from "../../../Hooks/useAppCreator"
import { useTable } from "../../../Hooks/useTable"

const APP_ID = 2
const MODULE_ID = 1
const ELM_VW_POINTS = 2

export const usePointData = (id_client) => {

    const { data: elements } = useAppCreator("elements", {
        queryParams: { elementId: ELM_VW_POINTS }
    })

    const elementVwPoints = elements?.find((e) => Number(e?.id) === ELM_VW_POINTS)?.identifier ?? ""

    const query = useMemo(() => {
        if (!id_client) return null

        return {
            limit: 1000,
            conditions: [
                {
                    column: "id_client",
                    comparator: "=",
                    value: id_client,
                    next: null
                }
            ]
        }
    }, [id_client])

    const { data, loading, error } = useTable(elementVwPoints, query, "query")

    return {
        data,
        loading,
        error,
    }
}
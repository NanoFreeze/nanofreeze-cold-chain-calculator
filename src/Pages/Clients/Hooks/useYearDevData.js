import { useMemo } from "react"
import { useAppCreator } from "../../../Hooks/useAppCreator"
import { useTable } from "../../../Hooks/useTable"

const APP_ID = 2
const MODULE_ID = 1
const ELM_VW_YEAR_DEV = 5

export const useYearDevData = (id_device) => {

    const { data: elements } = useAppCreator("elements", {
        queryParams: { elementId: ELM_VW_YEAR_DEV }
    })

    const elementVwYearDev = elements?.find((e) => Number(e?.id) === ELM_VW_YEAR_DEV)?.identifier ?? ""

    const query = useMemo(() => {
        if (!id_device) return null

        return {
            limit: 12,
            orderBy: [
                {
                    column: "period_end",
                    direction: "DESC"
                }
            ],
            conditions: [
                {
                    column: "id_device",
                    comparator: "=",
                    value: id_device,
                    next: null
                }
            ]
        }
    }, [id_device])

    const { data, loading, error } = useTable(elementVwYearDev, query, "query")

    return {
        data,
        loading,
        error,
    }
}
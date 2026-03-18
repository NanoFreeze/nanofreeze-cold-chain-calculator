import { useMemo } from "react"
import { useAppCreator } from "../../../Hooks/useAppCreator"
import { useTable } from "../../../Hooks/useTable"

const APP_ID = 2
const MODULE_ID = 1
const ELM_VW_DAY_DEV = 7

export const useDayDevData = (id_device) => {

    const { data: elements } = useAppCreator("elements", {
        queryParams: { elementId: ELM_VW_DAY_DEV }
    })

    const elementVwDayDev = elements?.find((e) => Number(e?.id) === ELM_VW_DAY_DEV)?.identifier ?? ""

    const query = useMemo(() => {
        if (!id_device) return null

        return {
            limit: 31,
            orderBy: [
                {
                    column: "date",
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

    const { data, loading, error } = useTable(elementVwDayDev, query, "query")

    return {
        data,
        loading,
        error,
    }
}
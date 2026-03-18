import { useMemo } from "react"
import { useAppCreator } from "../../../Hooks/useAppCreator"
import { useTable } from "../../../Hooks/useTable"

const APP_ID = 2
const MODULE_ID = 1
const ELM_VW_HOUR_DEV = 6

export const useHourDevData = (id_device) => {

    const { data: elements } = useAppCreator("elements", {
        queryParams: { elementId: ELM_VW_HOUR_DEV }
    })

    const elementVwHourDev = elements?.find((e) => Number(e?.id) === ELM_VW_HOUR_DEV)?.identifier ?? ""

    const query = useMemo(() => {
        if (!id_device) return null

        return {
            limit: 100,
            orderBy: [
                {
                    column: "datetime",
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

    const { data, loading, error } = useTable(elementVwHourDev, query, "query")

    return {
        data,
        loading,
        error,
    }
}
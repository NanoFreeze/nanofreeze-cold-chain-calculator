import { useMemo } from "react"
import { useAppCreator } from "../../../Hooks/useAppCreator"
import { useTable } from "../../../Hooks/useTable"

const APP_ID = 2
const MODULE_ID = 1
const ELM_VW_SEMESTER_DEV = 4

export const useSemesterDevData = (id_device) => {

    const { data: elements } = useAppCreator("elements", {
        queryParams: { elementId: ELM_VW_SEMESTER_DEV }
    })

    const elementVwSemesterDev = elements?.find((e) => Number(e?.id) === ELM_VW_SEMESTER_DEV)?.identifier ?? ""

    const query = useMemo(() => {
        if (!id_device) return null

        return {
            limit: 6,
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

    const { data, loading, error } = useTable(elementVwSemesterDev, query, "query")

    return {
        data,
        loading,
        error,
    }
}
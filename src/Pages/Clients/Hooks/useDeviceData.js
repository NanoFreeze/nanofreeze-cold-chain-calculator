import { useMemo } from "react"
import { useAppCreator } from "../../../Hooks/useAppCreator"
import { useTable } from "../../../Hooks/useTable"

const APP_ID = 2
const MODULE_ID = 1
const ELM_VW_DEVICES = 3

export const useDeviceData = (id_client, id_point_of_sale) => {

    const { data: elements } = useAppCreator("elements", {
        queryParams: { elementId: ELM_VW_DEVICES }
    })

    const elementVwDevices = elements?.find((e) => Number(e?.id) === ELM_VW_DEVICES)?.identifier ?? ""

    const query = useMemo(() => {
        if (!id_client || !id_point_of_sale) return null

        return {
            limit: 1000,
            conditions: [
                {
                    column: "id_client",
                    comparator: "=",
                    value: id_client,
                    next: "AND"
                },
                {
                    column: "id_point_of_sale",
                    comparator: "=",
                    value: id_point_of_sale,
                    next: null
                }
            ]
        }
    }, [id_client, id_point_of_sale])

    const { data, loading, error } = useTable(elementVwDevices, query, "query")

    return {
        data,
        loading,
        error,
    }
}
import { useMemo } from "react"
import { useAppCreator } from "../../../Hooks/useAppCreator"
import { useTable } from "../../../Hooks/useTable"

const APP_ID = 2
const MODULE_ID = 1
const ELM_VW_CLIENTS = 1

export const useClientData = (id_client) => {

    const { data: elements } = useAppCreator("elements", {
        queryParams: { elementId: ELM_VW_CLIENTS }
    })

    const elementVwClients = elements?.find((e) => Number(e?.id) === ELM_VW_CLIENTS)?.identifier ?? ""

    const query = useMemo(() => {
        if (!id_client) return null

        return {
            limit: 1,
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

    const { data, loading, error } = useTable(elementVwClients, query, "query")

    return {
        data,
        loading,
        error,
    }
}
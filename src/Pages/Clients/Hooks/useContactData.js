import { useMemo } from "react"
import { useTable } from "../../../Hooks/useTable"

export const useContactData = (id_client) => {
    const query = useMemo(() => {
        if (!id_client) return null
        return {
            limit: 1000,
            conditions: [
                {
                    column: "id_client",
                    comparator: "=",
                    value: id_client,
                    next: null,
                },
            ],
        }
    }, [id_client])

    const { data, loading, error, reload } = useTable("customer_contact", query, "query")

    return { data, loading, error, reload }
}

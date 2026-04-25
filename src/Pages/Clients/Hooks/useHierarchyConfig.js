import { useCallback, useEffect, useState } from "react"
import { loadHierarchyConfig, saveHierarchyConfig, clearHierarchyConfig } from "../Hierarchy/storage"
import { buildDefaultConfig } from "../Hierarchy/defaultConfigs"

export const useHierarchyConfig = (id_client) => {
    const [config, setConfig] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id_client) {
            setConfig(null)
            setLoading(false)
            return
        }

        const stored = loadHierarchyConfig(id_client)
        setConfig(stored ?? buildDefaultConfig(id_client))
        setLoading(false)
    }, [id_client])

    const updateConfig = useCallback((next) => {
        if (!id_client) return
        const merged = {
            ...next,
            clientId: String(id_client),
            updatedAt: new Date().toISOString(),
        }
        saveHierarchyConfig(merged)
        setConfig(merged)
    }, [id_client])

    const resetConfig = useCallback(() => {
        if (!id_client) return
        clearHierarchyConfig(id_client)
        setConfig(buildDefaultConfig(id_client))
    }, [id_client])

    return { config, loading, updateConfig, resetConfig }
}

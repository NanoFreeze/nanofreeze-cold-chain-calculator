const STORAGE_KEY = "nf:hierarchyConfigs"

const readAll = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return {}
        const parsed = JSON.parse(raw)
        return parsed && typeof parsed === "object" ? parsed : {}
    } catch {
        return {}
    }
}

const writeAll = (configs) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(configs))
    } catch {
        // Storage may be unavailable (private mode, quota); ignore.
    }
}

export const loadHierarchyConfig = (clientId) => {
    if (clientId == null) return null
    const all = readAll()
    return all[String(clientId)] ?? null
}

export const saveHierarchyConfig = (config) => {
    if (!config?.clientId) return
    const all = readAll()
    all[String(config.clientId)] = {
        ...config,
        updatedAt: new Date().toISOString(),
    }
    writeAll(all)
}

export const clearHierarchyConfig = (clientId) => {
    if (clientId == null) return
    const all = readAll()
    delete all[String(clientId)]
    writeAll(all)
}

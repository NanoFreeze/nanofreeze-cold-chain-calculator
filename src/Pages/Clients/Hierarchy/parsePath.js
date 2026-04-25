export const parseLocationPath = (location, separator = "/") => {
    if (typeof location !== "string" || !location.length) return []
    return location
        .split(separator)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
}

export const matchesPath = (point, separator, requiredPath) => {
    if (!Array.isArray(requiredPath) || requiredPath.length === 0) return true
    const segments = parseLocationPath(point?.location, separator)
    return requiredPath.every((needle, idx) => {
        if (needle == null) return true
        return (segments[idx] ?? "").toLowerCase() === String(needle).toLowerCase()
    })
}

export const segmentAtLevel = (point, separator, levelIndex) => {
    const segments = parseLocationPath(point?.location, separator)
    return segments[levelIndex] ?? null
}

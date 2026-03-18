export const getValidLimitNumber = (limit) => {
    if (['', false, null].includes(limit)) return undefined
    if (isNaN(limit)) return undefined
    return Number(limit)
}
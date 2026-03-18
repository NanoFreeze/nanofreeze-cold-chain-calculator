export const formatToMillions = (value, decimals = 2) => {
    const num = Number(value ?? 0)
    return (num / 1_000_000).toFixed(decimals)
}

export const formatNumber = (value, decimals = 2, locale = "es-CO") => {
    const num = Number(value ?? 0)

    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num)
}
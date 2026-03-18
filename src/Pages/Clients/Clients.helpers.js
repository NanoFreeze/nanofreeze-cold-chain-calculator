export const includesInsensitive = (itemValue, filterValue) =>
    itemValue
        ?.toString()
        .toLowerCase()
        .includes(filterValue?.toLowerCase())

export const buildSelectOptions = (data, key) => {
    const unique = [...new Set(data?.map(v => v[key]).filter(Boolean))]

    const opts = unique
        .sort()
        .map(val => ({ id: val, label: val }))

    return [{ id: "__all__", label: "Todos" }, ...opts]
}

export const countByKey = (items, groupKey, {filterKey, filterValue} = {}) => {
    if (!Array.isArray(items)) return {}

    return items.reduce((acc, item) => {
        if (filterKey && item[filterKey] !== filterValue) return acc

        const id = item[groupKey]
        if (id == null) return acc

        const mapKey = String(id)
        acc[mapKey] = (acc[mapKey] ?? 0) + 1
        return acc
    }, {})
}
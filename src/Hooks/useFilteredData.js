import { useMemo } from "react"

export const useFilteredData = (data = [], filters = {}, config = {}) => {
    const filteredData = useMemo(() => {
        if (!Array.isArray(data)) return []
    
        const activeFilters = Object.entries(filters).filter(([_, v]) => v !== null && v !== "" && v !== undefined)
        if (!activeFilters.length) return data
    
        return data.filter((item) => {
            return activeFilters.every(([key, filterValue]) => {
                const itemValue = item[key]
        
                //Funcion personalizada
                if (typeof config[key] === "function") {
                    try {
                        return config[key](itemValue, filterValue, item)
                    } catch (err) {
                        return true
                    }
                }
        
                //Filtros genericos
                if (typeof filterValue === "string") {
                    if (itemValue == null) return false
                    return itemValue.toString().toLowerCase().includes(filterValue.toLowerCase())
                }
        
                if (filterValue instanceof Date) {
                    if (!itemValue) return false
                    return new Date(itemValue).toDateString() === filterValue.toDateString()
                }
        
                if (typeof filterValue === "boolean") return Boolean(itemValue) === filterValue
                if (typeof filterValue === "number") return Number(itemValue) === filterValue
                if (Array.isArray(filterValue)) return filterValue.includes(itemValue)
        
                return itemValue === filterValue
            })
        })
    }, [data, filters, config])
    
    return filteredData
}
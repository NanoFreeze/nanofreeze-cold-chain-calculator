import { useState } from "react"

export const useFilters = (initialFilters = {}) => {
    const [filters, setFilters] = useState(initialFilters)

    const updateFilter = (key, value) => {
        setFilters(prev => ({
          ...prev,
          [key]: value
        }))
      }
    
    const resetFilters = () => setFilters(initialFilters)

    return { filters, updateFilter, resetFilters }
}
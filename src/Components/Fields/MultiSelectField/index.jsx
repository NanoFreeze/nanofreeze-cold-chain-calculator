import { memo, useEffect, useMemo, useState } from "react"
import CustomMultiSelect from "../../CustomMultiSelect" 

const MultiSelect = ({ field, setFieldValue, disabled, forceRender }) => {
    const options = useMemo(() => {
        if (!field?.options || !Array.isArray(field.options)) {
            return []
        }
        return field.options
            .filter(o => o?.name)
            .map(o => ({
                id: o._id ?? o.name,
                label: o.name,
                default: o.default
            }))
    }, [field?.options])

    const normalize = (values) => {
        if (!values || !Array.isArray(values)) return []
        return values
            .map(val => options.find(o => o.label === val))
            .filter(Boolean)
    }

    const [selected, setSelected] = useState(() => normalize(field?.value?.multivalues ?? []))

    //Sincroniza con forceRender o cambios en field.value
    useEffect(() => {
        setSelected(normalize(field?.value?.multivalues ?? []))
    }, [field?.value?.multivalues, forceRender, options])

    //Asigna opciones por defecto si no hay valor
    useEffect(() => {
        if (selected.length > 0) return

        const defaultOptions = options.filter(o => o.default)
        if (defaultOptions.length > 0) {
            setSelected(defaultOptions)
            setFieldValue(defaultOptions.map(o => o.label))
        }
    }, [options, selected.length])

    //Maneja cambio de seleccion
    const handleChange = (newSelected) => {
        setSelected(newSelected)
        setFieldValue(newSelected.map(o => o.label))
    }

    return (
        <CustomMultiSelect
            options={options}
            value={selected}
            disabled={disabled}
            onChange={handleChange}
        />
    )
}

export const MultiSelectField = memo (
    MultiSelect,
    (prev, next) => 
        prev.field === next.field &&
        prev.disabled === next.disabled &&
        prev.forceRender === next.forceRender
)

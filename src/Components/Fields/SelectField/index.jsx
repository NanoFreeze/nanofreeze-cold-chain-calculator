import { memo, useEffect, useMemo, useState } from "react"
import CustomSelect from "../../CustomSelect" 

const Select = ({ field, setFieldValue, disabled, forceRender }) => {
    const options = useMemo(() => {
        return (field?.options ?? [])
            .filter(o => o?.name)
            .map(o => ({
                id: o._id ?? o.name,
                label: o.name,
                default: o.default
            }))
    }, [field?.options])

    const normalize = (val) => {
        if (!val) return null
        return options.find(o => o.label === val) ?? null
    }

    const [selected, setSelected] = useState(() => normalize(field?.value?.value))

    //Sincroniza con forceRender o cambios en field.value
    useEffect(() => {
        setSelected(normalize(field?.value?.value))
    }, [field?.value?.value, forceRender, options])

    //Asigna opcion por defecto si no hay valor
    useEffect(() => {
        if (selected) return

        const defaultOption = options.find(o => o.default)
        if (defaultOption) {
            setSelected(defaultOption)
            setFieldValue(defaultOption.label) //Envia string a setFieldValue
        }
    }, [options, selected])

    //Maneja cambio de seleccion
    const handleChange = (opt) => {
        setSelected(opt)
        setFieldValue(opt?.label ?? "") //Envia string a setFieldValue
    }
    
    return (
        <CustomSelect
            options={options}
            value={selected}
            disabled={disabled}
            onChange={handleChange}
            isSearchable={false}
        />
    )
}

export const SelectField = memo (
    Select,
    (prev, next) => 
        prev.field === next.field &&
        prev.disabled === next.disabled &&
        prev.forceRender === next.forceRender
)
import { memo, useEffect, useMemo, useState } from "react"
import CustomSelect from "../../CustomSelect"
import AutoFields from "../AutoFields"
import { oneValueTypes, specialTypes } from "../AutoFields"

const SmartSelect = ({ field, index, setFieldValue, fields, disabled, forceRender }) => {
    const options = useMemo(() => {
        return (field?.options ?? [])
            .map((o, idx) => ({
            ...o,
            idx,
            id: o._id ?? idx,
            label: o.name
        }))
    }, [field?.options])

    const normalize = (val) => {
        if (val === null || val === undefined || val === "") return null
        return options.find(o => o.idx === val) ?? null
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
            setFieldValue(defaultOption.idx) //Envia string a setFieldValue
        }
    }, [options, selected])


    //Maneja cambio de seleccion
    const handleChange = (opt) => {
        setSelected(opt)
        setFieldValue(opt?.idx ?? null) //Envia string a setFieldValue
    }

    //Setter de subcampos
    const setSubFields = (fieldIndex, optionIndex) => {
        return (index, field, value) => {
            if (oneValueTypes.includes(field?.type_field)) {
                fields[fieldIndex].options[optionIndex].fields[index].value.value = value
            } else if (specialTypes.includes(field?.type_field)) {
                fields[fieldIndex].options[optionIndex].fields[index].value.tablevalues = value
            }
        }
    }

    return (
        <>
            <CustomSelect
                options={options}
                value={selected}
                disabled={disabled}
                onChange={handleChange}
            />

            {(selected || selected?.idx === 0) && (
                options.map((option, optionIndex) => {
                    if (selected?.idx !== optionIndex) return null

                    return (
                        <AutoFields
                            key={optionIndex}
                            fields={option.fields}
                            setFields={setSubFields(index, optionIndex)}
                            disabled={disabled}
                            nested
                        />
                    )
                })
            )}
        </>
    )
}

export const SmartSelectField = memo(
    SmartSelect,
    (prev, next) =>
        prev.field === next.field &&
        prev.disabled === next.disabled &&
        prev.forceRender === next.forceRender
)

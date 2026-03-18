import React, { useCallback, useEffect, useRef, useState } from "react"
import AutoFieldsLayout from "./AutoFieldsLayout"

export const oneValueTypes = ["comment", "date", "number", "select", "smart_select", "text"]
export const multiValueTypes = ["multiselect"]
export const specialTypes = ["table"]

const clone = (obj) => {
    //Intenta usar structuredClone primero (mas rapido y seguro)
    if (typeof structuredClone === "function") {
        return structuredClone(obj)
    }
    //Fallback menos ideal para navegadores sin structuredClone
    return obj ? JSON.parse(JSON.stringify(obj)) : obj
}

const AutoFields = ({
    fields: formFields = [],
    setFields = () => {},
    disabled = false,
    nested = false,
    fieldClassName,
    prefillData = null,
    prefillConfig = null,
    onGetCurrentFields = null,
    fieldsConfig = null,
    tableCellRenderers = null,
    fieldsVisibility = null,
}) => {
    
    //Patron apperator-main: inicializa una vez al montar, no sincroniza despues
    const fieldsRef = useRef(clone(formFields)) //Inicializa directamente como apperator-main línea 46
    const hasPrefilled = useRef(false) //Guarda un flag que indica si ya se hizo el prefill inicial para que no se vuelva a ejecutar al renderizar otra vez
    const previousPrefillDataRef = useRef(null) //Guarda los datos de prefill anteriores para detectar cambios
    const [forceRender, setForceRender] = useState(0) //Contador para forzar un re-render del componente

    const setFieldsRef = useRef(setFields)
    useEffect(() => { setFieldsRef.current = setFields }, [setFields])

    const setFieldValue = useCallback((index, field, ...values) => {
        //Si es nested, delega directamente a setFields (como en apperator-main)
        if (nested) {
            return setFieldsRef.current(index, field, values[0])
        }
        
        //Asegura que el campo existe en fieldsRef
        if (!fieldsRef.current[index]) {
            fieldsRef.current[index] = { ...field }
        }
        
        //
        //Asegura que existe la propiedad value
        if (!fieldsRef.current[index].value) {
            fieldsRef.current[index].value = {}
        }
        
        if (oneValueTypes.includes(field.type_field)) {
            fieldsRef.current[index].value.value = values[0]
        }
        else if (multiValueTypes.includes(field.type_field)) {
            if (field.type_field === 'multiselect') {
                fieldsRef.current[index].value.multivalues = values[0]
            }
        }
        else if (specialTypes.includes(field.type_field)) {
            if (field.type_field === 'table') {
                fieldsRef.current[index].value.tablevalues = values[0]
            }
        }
        
        //Actualiza el estado padre con una copia del array
        setFieldsRef.current([...fieldsRef.current])
        
        //Forza re-render despues de actualizar el valor
        setForceRender(prev => prev + 1)
    }, [nested])

    //Patron apperator-main: solo resetea cuando formFields se vacia completamente
    //NO sincroniza cuando formFields cambia despues de la inicializacion
    useEffect(() => {
        //Si no hay campos, se resetean los campos y se reinicia el flag de prefill
        if (!formFields.length) {
            fieldsRef.current = []
            hasPrefilled.current = false
            previousPrefillDataRef.current = null
            setForceRender(prev => prev + 1)
            return
        }

        //Solo inicializa si esta vacío (como apperator-main - no sincroniza despues)
        if (!fieldsRef.current.length && formFields.length) {
            fieldsRef.current = clone(formFields)
            hasPrefilled.current = false
        }
        //No sincroniza si fieldsRef.current ya tiene campos (patron apperator-main)
    }, [formFields])
        
    useEffect(() => {
        //Aplica configuracion de fields (por ejemplo, enableExcelUpload para TableField)
        //Se aplica siempre que haya configuración disponible y fields inicializados
        if (!fieldsConfig || !Array.isArray(fieldsConfig)) return
        if (!fieldsRef.current.length) return

        fieldsConfig.forEach((config) => {
            const fieldIndex = config.fieldIndex
            const fieldName = config.fieldName
                
            if (fieldIndex !== undefined && fieldsRef.current[fieldIndex]) {
                Object.assign(fieldsRef.current[fieldIndex], config.properties || {})
            } else if (fieldName) {
                const field = fieldsRef.current.find(f => f.name === fieldName)
                if (field) {
                    Object.assign(field, config.properties || {})
                }
            }
        })
        setForceRender(prev => prev + 1)
    }, [fieldsConfig])
    
    useEffect(() => {
        //Detecta cambios en prefillData y resetea hasPrefilled si cambio
        const prefillDataString = JSON.stringify(prefillData)
        const previousPrefillDataString = JSON.stringify(previousPrefillDataRef.current)

        if (prefillDataString !== previousPrefillDataString) {
            hasPrefilled.current = false
            previousPrefillDataRef.current = prefillData ? JSON.parse(prefillDataString) : null
        }
    }, [prefillData])
    
    //Comprueba si hay un prefillConfig definido (configuracion de datos iniciales) y que aun no se haya prellenado (hasPrefilled.current === false)
    //Esto asegura que el prefill solo se ejecute una vez, o cuando cambien los datos
    useEffect(() => {
        if (!prefillConfig) {
            return
        }
        if (hasPrefilled.current) {
            return
        }
        if (!fieldsRef.current.length) {
            return
        }

        const configs = Array.isArray(prefillConfig) ? prefillConfig : [prefillConfig] //Normaliza a un array si es necesario
        
        //Asegura que fieldsRef.current este inicializado antes del prefill
        if (!fieldsRef.current.length && formFields.length) {
            fieldsRef.current = clone(formFields)
        }
        
        configs.forEach((config) => {//Indice del campo que se quiere llenar y la clave del dato a prellenar
            const { fieldIndex, key, type } = config
            //Intenta obtener el campo de fieldsRef.current, si no existe, usar formFields como fallback
            let field = fieldsRef.current[fieldIndex]
            if (!field && formFields[fieldIndex]) {
                // Inicializar el campo en fieldsRef.current
                fieldsRef.current[fieldIndex] = clone(formFields[fieldIndex])
                field = fieldsRef.current[fieldIndex]
            }
            
            if (!field) {
                return
            }
        
            let value = prefillData?.[key]
            
            //Solo prellena si el valor no es null o undefined
            if (value === null || value === undefined) {
                return
            }
            if (!field.value) field.value = {}
            
            //Determina si es un campo de tipo table o multiselect
            const isTableField = type === "table" || field.type_field === "table"
            const isMultiSelect = type === "multiselect" || field.type_field === "multiselect"
            const isSmartSelect = field.type_field === "smart_select"
            
            if (isTableField) {
                //Prefill para TableField: el valor debe ser un array
                if (Array.isArray(value)) {
                    field.value.tablevalues = value.length > 0 ? value : [{}]
                } else {
                    field.value.tablevalues = [{}]
                }
            } else if (isMultiSelect) {
                //Prefill para MultiSelectField: el valor debe ser un array
                if (Array.isArray(value)) {
                    field.value.multivalues = value
                } else {
                    field.value.multivalues = []
                }
            } else if (isSmartSelect) {
                //Prefill para SmartSelectField: busca la opcion por nombre y usa su indice
                if (field.options && Array.isArray(field.options)) {
                    //Normaliza el valor para comparacion (trim y uppercase)
                    const normalizedValue = String(value || "").trim().toUpperCase()
                    const optionIndex = field.options.findIndex(opt => {
                        const optName = String(opt.name || "").trim().toUpperCase()
                        return optName === normalizedValue
                    })
                    
                    if (optionIndex !== -1) {
                        field.value.value = optionIndex
                        const selectedOption = field.options[optionIndex]
                        
                        //Precarga campos anidados si estan configurados
                        if (config.nestedFields && Array.isArray(config.nestedFields) && selectedOption.fields) {
                            const nestedConfig = config.nestedFields.find(nf => {
                                const nfValue = String(nf.optionValue || "").trim().toUpperCase()
                                return nfValue === normalizedValue
                            })
                            
                            if (nestedConfig && nestedConfig.fields) {
                                nestedConfig.fields.forEach((nestedFieldConfig) => {
                                    const nestedFieldIndex = nestedFieldConfig.fieldIndex
                                    const nestedFieldKey = nestedFieldConfig.key
                                    
                                    if (selectedOption.fields[nestedFieldIndex]) {
                                        const nestedField = selectedOption.fields[nestedFieldIndex]
                                        const nestedValue = prefillData?.[nestedFieldKey]
                                        
                                        if (nestedValue !== null && nestedValue !== undefined) {
                                            if (!nestedField.value) nestedField.value = {}
                                            nestedField.value.value = nestedValue
                                        }
                                    }
                                })
                            }
                        }
                    }
                }
            } else {
                //Prefill para oneValueTypes
                field.value.value = value
            }
        })
        hasPrefilled.current = true
        setForceRender(prev => prev + 1)
    }, [prefillData, prefillConfig])

    useEffect(() => {
        if (onGetCurrentFields) {
            onGetCurrentFields.current = () => {
                return [...fieldsRef.current]
            }
        }
    }, [onGetCurrentFields])

    const fieldsToRender = fieldsRef.current.length ? fieldsRef.current : formFields

    return (
        <AutoFieldsLayout
            fields={fieldsToRender}
            setFieldValue={setFieldValue}
            disabled={disabled}
            forceRender={forceRender}
            fieldClassName={fieldClassName}
            tableCellRenderers={tableCellRenderers}
            fieldsVisibility={fieldsVisibility}
        />
    )
}

export default AutoFields
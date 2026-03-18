import React from "react"
import { CommentField } from "./CommentField"
import { DateField } from "./DateField"
import { MultiSelectField } from "./MultiSelectField"
import { NumberField } from "./NumberField"
import { SelectField } from "./SelectField"
import { SmartSelectField } from "./SmartSelectField"
import { TableField } from "./TableField"
import { TextField } from "./TextField"
import FormLabel from "../Form/FormLabel"

const AutoFieldsLayout = ({
    fields = [],
    setFieldValue,
    disabled,
    forceRender,
    fieldClassName = "flex flex-col gap-2",
    tableCellRenderers = null,
    fieldsVisibility = null //Configuracion de visibilidad: { 0: true, 1: false } o [true, false, true]
}) => {

    //Funcion para determinar si un campo debe mostrarse
    const isFieldVisible = (index) => {
        //Si no hay configuracion, todos los campos son visibles por defecto
        if (!fieldsVisibility) {
            return true
        }

        //Si es un array, usar el indice directamente
        if (Array.isArray(fieldsVisibility)) {
            return fieldsVisibility[index] !== false // true si no está definido o es true
        }

        //Si es un objeto, buscar por indice
        if (typeof fieldsVisibility === 'object') {
            //Si el indice esta explicitamente definido, usar ese valor
            if (index in fieldsVisibility) {
                return fieldsVisibility[index] === true
            }
            //Si no esta definido, mostrar por defecto
            return true
        }

        //Por defecto, mostrar
        return true
    }

    return (
        <div className={fieldClassName}>
            {fields.map((field, index) => {
                if (!field || !field.type_field) {
                    return null
                }

                //Verificar visibilidad del campo
                if (!isFieldVisible(index)) {
                    return null
                }

                const commonProps = {
                    field,
                    disabled,
                    forceRender,
                    setFieldValue: (value, sync = false) => setFieldValue(index, field, value, sync)
                }

                return (
                    <div key={field.id || field.name || index} className="flex flex-col gap-2">

                        {field.type_field !== "comment" && field.type_field !== "table" && (
                            <FormLabel label={field.label || field.name} />
                        )}

                        {["select", "autocomplete"].includes(field.type_field) && (
                            <SelectField {...commonProps} />
                        )}
                        
                        {field.type_field === "multiselect" && (
                            <MultiSelectField {...commonProps} />
                        )}
                        
                        {field.type_field === "smart_select" && (
                            <SmartSelectField {...commonProps} fields={fields} index={index} />
                        )}

                        {field.type_field === "text" && (
                            <TextField {...commonProps} />
                        )}

                        {field.type_field === "number" && (
                            <NumberField {...commonProps} />
                        )}

                        {field.type_field === "date" && (
                            <DateField {...commonProps} />
                        )}

                        {field.type_field === "comment" && (
                            <CommentField {...commonProps} />
                        )}

                        {field.type_field === "table" && (
                            <TableField {...commonProps} tableCellRenderers={tableCellRenderers} />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default AutoFieldsLayout

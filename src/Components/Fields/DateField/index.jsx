import { memo, useEffect, useMemo, useState } from "react"
import FormInput from "../../Form/FormInput" 
import { getValidLimitNumber } from "../../../Utils/getValidLimitNumber"

const DateTime = ({ field, setFieldValue, disabled, forceRender }) => {
    const [value, setValue] = useState(field.value?.value ?? "")
   
    useEffect(() => {
        setValue(field.value?.value ?? "")
    }, [forceRender])
  
    const inputType = !field.dateType || field.dateType === "normal" 
            ? "datetime-local"    
            : "date"

    const min = useMemo(() => {
        if (!field.min) return undefined
        if (field.dateLimitType === "dynamic") {
            const limit = getValidLimitNumber(field.min)
            
            if (!limit && limit !== 0) return null

            return formatDate(
                new Date(Date.now() - limit * 1000),
                field.dateType
            )
        }

        return formatDate(new Date(field.min), field.dateType)
    }, [])

    const max = useMemo(() => {
        if (!field.max) return undefined
        if (field.dateLimitType === "dynamic") {
            const limit = getValidLimitNumber(field.max)

            if (!limit && limit !== 0) return null

            return formatDate(
                new Date(Date.now() + limit * 1000),
                field.dateType
            )
        }

        return formatDate(new Date(field.max), field.dateType)
    }, [])
  
    return (
        <FormInput
            type={inputType}
            placeHolder={field.name}
            value={value}
            disabled={disabled}
            required={!field.optional}
            min={min ?? undefined}
            max={max ?? undefined}
            onChange={(e) => {
                setValue(e.target.value)
                setFieldValue(e.target.value)
            }}
            className="w-full"
        />    
    )
}

export const formatDate = (date, type) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")

    if (type === "normal") return `${year}-${month}-${day}T${hours}:${minutes}`
    return `${year}-${month}-${day}`
}

export const DateField = memo (
    DateTime,
    (prev, next) => 
        prev.field === next.field &&
        prev.disabled === next.disabled &&
        prev.forceRender === next.forceRender
)
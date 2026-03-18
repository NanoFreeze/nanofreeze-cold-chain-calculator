import { memo, useEffect, useState } from "react"
import FormInput from "../../Form/FormInput" 
import { getValidLimitNumber } from "../../../Utils/getValidLimitNumber"

const Number = ({ field, setFieldValue, disabled, forceRender }) => {
    const [value, setValue] = useState(field.value?.value ?? "")

    const min = getValidLimitNumber(field.min)
    const max = getValidLimitNumber(field.max)

    useEffect(() => {
        setValue(field.value?.value ?? "")
    }, [forceRender])
  
    return (
        <FormInput
            type="number"
            placeHolder={field.name}
            value={value ?? ""}
            disabled={disabled}
            required={!field.optional}
            onWheel={(e) => e.target.blur()}
            min={min}
            max={max}
            step={field.onlyIntegers ? 1 : undefined}
            onChange={(e) => {
                setValue(e.target.value)
                setFieldValue(e.target.value)
            }}        
            className="w-full"
        />
    )
}

export const NumberField = memo (
    Number,
    (prev, next) => 
        prev.field === next.field &&
        prev.disabled === next.disabled &&
        prev.forceRender === next.forceRender
)
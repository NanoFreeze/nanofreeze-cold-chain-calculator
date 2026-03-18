import { memo, useEffect, useState } from "react"
import FormInput from "../../Form/FormInput"
import { getValidLimitNumber } from "../../../Utils/getValidLimitNumber" 

const Text = ({ field, setFieldValue, disabled, forceRender }) => {
    const [value, setValue] = useState(field.value?.value ?? "")

    const min = getValidLimitNumber(field.min)
    const max = getValidLimitNumber(field.max)

    useEffect(() => {
        setValue(field.value?.value ?? "")
    }, [forceRender])
  
    return (
        <FormInput
            type="text"
            placeHolder={field.name}
            value={value ?? ""}
            disabled={disabled}
            required={!field.optional}
            minLength={min}
            maxLength={max}
            onChange={(e) => {
                setValue(e.target.value)
                setFieldValue(e.target.value)
            }}
            className="w-full"
        />
    )
}

export const TextField = memo (
    Text,
    (prev, next) => 
        prev.field === next.field &&
        prev.disabled === next.disabled &&
        prev.forceRender === next.forceRender
)
import { memo, useEffect, useState, useMemo } from "react"
import CustomSelect from "../../../CustomSelect"
import FormInput from "../../../Form/FormInput"
import { normalizeColumnName } from "../../../UploadFile/uploadFileUtils"

const simpleInputTypes = ["text", "number", "date"]

const Cell = ({ row, column, setRowValue, disabled, required, forceRender, field, tableCellRenderers }) => {
    const normalizedKey = normalizeColumnName(column.name)
    
    const defaultValue = column.type === "boolean" ? true : ""
    const [value, setValue] = useState(row?.[normalizedKey] ?? row?.[column.name] ?? defaultValue) //Estado local de la celda

    //Se ejecuta cada vez que cambia el valor de la fila o se renderiza la celda
    useEffect(() => {
        const currentValue = row?.[normalizedKey] ?? row?.[column.name]
        const newValue = currentValue !== undefined && currentValue !== null ? currentValue : defaultValue
        setValue(newValue)
        // Si es booleano y no tiene valor, establecer true en el estado de la fila
        // Solo si la fila existe (no es undefined)
        if (column.type === "boolean" && row && (currentValue === undefined || currentValue === null || currentValue === "")) {
            setRowValue(true)
        }
    }, [row, normalizedKey, column.name])

    //Normaliza renderers una sola vez (mejor rendimiento)
    const normalizedRenderers = useMemo(() => {
        if (!tableCellRenderers || typeof tableCellRenderers !== "object") return {}

        const normalizeKey = (key) => String(key ?? "")
                .toLowerCase()
                .trim()
                .replace(/\s+/g, "")

        const map = {}

        for (const key of Object.keys(tableCellRenderers)) {
            const normalized = normalizeKey(key)
            map[normalized] = tableCellRenderers[key]
        }

        return map
    }, [tableCellRenderers])

    const normalizedColumnKey = String(column?.name ?? "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "")

    //Obtiene renderer en O(1)
    const customRenderer = normalizedRenderers[normalizedColumnKey]
        
    if (typeof customRenderer === "function") {
        try {
            const rendered = customRenderer({
                row,
                column,
                value,
                setValue,
                setRowValue,
                disabled,
                required,
                field
            })
                
            //Si el renderer retorna algo, lo usa; si retorna null/undefined, continua con logica por defecto
            if (rendered !== null && rendered !== undefined) {
                return rendered
            }
        } catch (error) {
            // Error en custom renderer
        }
    }

    if (column.type === "readOnly") return (
        <div className="read-only-text">
            {value}
        </div>
    )

    if (simpleInputTypes.includes(column.type)) {
        return (
            <FormInput
                type={column.type === "date" ? "datetime-local" : column.type ?? "text"}
                value={value}
                onChange={(e) => {
                    const newVal = e.target.value
                    setValue(newVal)
                    setRowValue(newVal)
                }}
                disabled={disabled}
                required={required}
                placeHolder={column.name}
                className="w-full"
            />
        )
    }

    if (column.type === "boolean") {
        return (
            <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => {
                    const newValue = e.target.checked
                    setValue(newValue)
                    setRowValue(newValue)
                }}
                disabled={disabled}
                className="w-[16px] h-[16px] accent-[var(--color-primary-green)] cursor-pointer"
            />
        )
    }

    if (column.type === "select") {
        //Normaliza options a la forma que espera CustomSelect
        const options = useMemo(() => {
            if (!column?.options) return []

            if (typeof column.options[0] === "string") {
                return column.options.map((opt, index) => ({ id: String(index), label: opt, value: opt }))
            }
            
            return column.options
              .map((opt) => opt ? { id: opt._id, label: opt.name, value: opt.name, ...opt } : null)
              .filter(Boolean)
        }, [column?.options])
    
        const selectValue = value ? { value } : null
    
        const handleChange = (opt) => {
            const newValue = opt?.value ?? opt?.label ?? ""
            setValue(newValue)
            setRowValue(newValue)
        }

        return (
            <CustomSelect
                options={options}
                value={selectValue}
                onChange={handleChange}
                disabled={disabled}
                placeholder={!required ? "Ninguna" : undefined}
            />
        )
    }
    return null
}

export const TableCell = memo(
    Cell,
    (prev, next) => {
    const prevNormalizedKey = normalizeColumnName(prev.column.name)
    const nextNormalizedKey = normalizeColumnName(next.column.name)
    return (
        (prev.row?.[prevNormalizedKey] ?? prev.row?.[prev.column.name]) === (next.row?.[nextNormalizedKey] ?? next.row?.[next.column.name]) &&
        prev.column.name === next.column.name &&
        prev.disabled === next.disabled &&
        JSON.stringify(prev.tableCellRenderers) === JSON.stringify(next.tableCellRenderers)
    )
})

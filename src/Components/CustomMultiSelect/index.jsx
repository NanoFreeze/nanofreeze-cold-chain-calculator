import { useEffect, useState, Fragment, useRef } from "react"
import { Listbox, Transition, Portal } from "@headlessui/react"
import { Check, ChevronDown, X } from "lucide-react"

const CustomMultiSelect = ({ options, value = [], onChange }) => {
    const [selected, setSelected] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const buttonRef = useRef(null)
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })

    useEffect(() => {
        if (Array.isArray(value)) {
            const normalized = value
                .map(v =>
                    typeof v === "object"
                        ? v
                        : options.find(o => o.value === v)
                )
                .filter(Boolean)
            setSelected(normalized)
        }
    }, [value, options])

    //Calcula posicion exacta del boton
    const updatePosition = () => {
        if (!buttonRef.current) return
        const rect = buttonRef.current.getBoundingClientRect()
        setPosition({
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width
        })
    }

    const isSelected = (opt) =>
        selected.some(item => item.id === opt.id)

    const removeOption = (opt) => {
        const updated = selected.filter(item => item.id !== opt.id)
        setSelected(updated)
        onChange(updated)
    }

    return (
        <Listbox
            value={selected}
            multiple
            onChange={(opts) => {
                setSelected(opts)
                onChange(opts)
                setIsOpen(false) //Cierra el dropdown
            }}
        >
            <div className="flex flex-col gap-4 w-full">
                {/* Button */}
                <Listbox.Button
                    ref={buttonRef}
                    onClick={() => {
                        updatePosition()
                        setIsOpen(prev => !prev)
                    }}
                    className="flex items-center justify-between gap-2 w-full p-2 text-sm text-[var(--color-text)] bg-[var(--color-soft-grey)] border border-[var(--color-grey)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-red)]"
                >
                    <span>
                        {selected.length > 0
                            ? "Modificar selección"
                            : "Seleccionar"}
                    </span>
                    <ChevronDown className="w-[16px] h-[16px]" />
                </Listbox.Button>

                {/* Dropdown */}
                <Transition
                    show={isOpen}
                    as={Fragment}
                >
                    <Portal>
                        <Listbox.Options
                            static
                            className="absolute max-h-[240px] overflow-auto bg-white border border-[var(--color-grey)] rounded-lg shadow-md text-sm z-[9999]"
                            style={{
                                position: "fixed",
                                top: position.top,
                                left: position.left,
                                width: position.width
                            }}
                        >
                            {options.map(opt => {
                                const disabled = isSelected(opt)

                                return (
                                    <Listbox.Option
                                        key={opt.id}
                                        value={opt}
                                        disabled={disabled}
                                        className={({ active, disabled }) =>
                                            `flex items-center justify-between p-2 m-1 rounded-lg ${
                                                disabled
                                                    ? "opacity-40 cursor-not-allowed"
                                                    : active
                                                    ? "bg-[var(--color-primary-red)] text-white cursor-pointer"
                                                    : "cursor-pointer text-[var(--color-text)]"
                                            }`
                                        }
                                    >
                                        <span>{opt.label}</span>
                                        {disabled && (
                                            <Check className="w-[18px] h-[18px] text-white" />
                                        )}
                                    </Listbox.Option>
                                )
                            })}
                        </Listbox.Options>
                    </Portal>
                </Transition>

                {/* Selected tags */}
                {selected.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {selected.map(opt => (
                            <div
                                key={opt.id}
                                className="flex items-center py-1 px-3 text-sm bg-[var(--color-soft-grey)] border border-[var(--color-grey)] rounded-full"
                            >
                                <span>{opt.label}</span>
                                <button
                                    type="button"
                                    onClick={() => removeOption(opt)}
                                >
                                    <X className="text-[var(--color-primary-red)] cursor-pointer" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Listbox>
    )
}

export default CustomMultiSelect

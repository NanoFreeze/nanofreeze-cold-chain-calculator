import { useEffect, useState, Fragment, useRef } from "react"
import { Transition, Portal } from "@headlessui/react"
import { Check, ChevronDown } from "lucide-react"

const CustomSelect = ({
    options,
    value,
    onChange,
    icon,
    placeholder = "Seleccionar o buscar...",
    bgColor = "bg-[var(--color-light-grey)]",
    isSearchable = true
}) => {
    const [selected, setSelected] = useState(value)
    const [searchQuery, setSearchQuery] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const buttonRef = useRef(null)
    const inputRef = useRef(null)
    const searchQueryRef = useRef("")
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
    const [hoveredId, setHoveredId] = useState(null)

    searchQueryRef.current = searchQuery

    const normalizedValue =
        value?.label
            ? value
            : value?.value
            ? options.find(o => o.label === value.value)
            : null

    useEffect(() => {
        setSelected(normalizedValue)
        if (!isOpen) {
            setSearchQuery("")
        }
    }, [value, normalizedValue, isOpen])

    //Cierra dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            const dropdown = document.querySelector('[role="listbox"]')
            if (
                buttonRef.current &&
                !buttonRef.current.contains(event.target) &&
                dropdown &&
                !dropdown.contains(event.target)
            ) {
                closeDropdown(true)
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
            return () => {
                document.removeEventListener("mousedown", handleClickOutside)
            }
        }
    }, [isOpen])

    //Calcula posicion exacta del boton
    const updatePosition = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            setPosition({
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width
            })
        }
    }

    //Filtra opciones con base en la busqueda (solo si es searchable)
    const effectiveSearch = isSearchable ? searchQuery : ""
    const filteredOptions = effectiveSearch
        ? options.filter((opt) =>
              opt.label?.toLowerCase().includes(effectiveSearch.toLowerCase())
          )
        : options

    //Maneja cambio de seleccion
    const handleChange = (opt) => {
        setSelected(opt)
        onChange(opt)
        setSearchQuery("")
        setIsOpen(false)
    }

    //Maneja input de busqueda
    const handleInputChange = (e) => {
        if (!isSearchable) return
        const value = e.target.value
        setSearchQuery(value)
        if (!isOpen) {
            setIsOpen(true)
        }
    }

    //Al abrir, inicializa busqueda con el valor seleccionado para poder editarlo o borrarlo (solo si es searchable)
    const openDropdown = () => {
        updatePosition()
        if (isSearchable) {
            setSearchQuery(selected?.label ?? "")
        }
        setIsOpen(true)
        if (isSearchable) {
            setTimeout(() => {
                inputRef.current?.focus()
            }, 100)
        }
    }

    //Al cerrar, si el usuario dejó el campo vacío, limpiar la selección (usa ref para tener valor actual en handlers async, solo si es searchable)
    const closeDropdown = (clearSelectionIfEmpty = false) => {
        const currentQuery = searchQueryRef.current
        if (clearSelectionIfEmpty && isSearchable && currentQuery === "") {
            setSelected(null)
            onChange(null)
        }
        setIsOpen(false)
        setSearchQuery("")
    }

    //Cuando está abierto mostramos siempre searchQuery (aunque esté vacío) para poder borrar con teclado (solo si es searchable)
    const displayValue = isSearchable
        ? (isOpen ? searchQuery : (selected?.label || ""))
        : (selected?.label || "")

    return (
        <div className="relative w-full">
            {/* Input editable que funciona como boton */}
            <div
                ref={buttonRef}
                className={`flex items-center gap-2 w-full p-2 text-sm text-[var(--color-text)] ${bgColor} border border-[var(--color-grey)] rounded-lg focus-within:outline-none focus-within:ring-1 focus-within:ring-[var(--color-primary-medium-blue)]`}
                onClick={openDropdown}
            >
                {/* Icono opcional al inicio */}
                {icon && (
                    <div className="flex-shrink-0 flex items-center justify-center">
                        {typeof icon === "function" 
                            ? icon() 
                            : icon
                        }
                    </div>
                )}
                <input
                    ref={inputRef}
                    type="text"
                    value={displayValue}
                    onChange={isSearchable ? handleInputChange : undefined}
                    onFocus={openDropdown}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--color-text)] placeholder:text-[var(--color-text)] placeholder:opacity-50"
                    readOnly={!isSearchable}
                    onClick={(e) => {
                        e.stopPropagation()
                        openDropdown()
                    }}
                    onKeyDown={isSearchable ? ((e) => {
                        if (e.key === "Enter" && filteredOptions.length > 0) {
                            e.preventDefault()
                            handleChange(filteredOptions[0])
                        } else if (e.key === "Escape") {
                            closeDropdown(true)
                        } else if (e.key === "ArrowDown" && isOpen) {
                            e.preventDefault()
                        }
                    }) : undefined}
                />
                <ChevronDown className="w-4 h-4 text-[var(--color-primary-medium-blue)] flex-shrink-0" />
            </div>

            {/* Dropdown */}
            {isOpen && (
                <Transition
                    as={Fragment}
                    show={isOpen}
                    enter="transition ease-out duration-100"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <Portal>
                        <div
                            role="listbox"
                            className="absolute max-h-[240px] overflow-auto bg-white border border-[var(--color-grey)] rounded-xl shadow-md text-sm z-[9999]"
                            style={{
                                position: "fixed",
                                top: position.top,
                                left: position.left,
                                width: position.width
                            }}
                        >
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt) => {
                                    const isSelected = selected?.id === opt.id
                                    const isHovered = hoveredId === opt.id
                                    const isAnyHovered = hoveredId !== null

                                    const baseClasses = "flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer"

                                    let stateClasses = " text-[var(--color-text)]"

                                    if (isHovered) {
                                        stateClasses = " bg-[var(--color-secondary-blue)] text-white"
                                    } else if (isSelected && !isAnyHovered) {
                                        stateClasses = " bg-[var(--color-secondary-blue)] text-white"
                                    }

                                    return (
                                        <div
                                            key={opt.id}
                                            onClick={() => handleChange(opt)}
                                            onMouseEnter={() => setHoveredId(opt.id)}
                                            onMouseLeave={() => setHoveredId(null)}
                                            className={`${baseClasses}${stateClasses}`}
                                        >
                                            <span>{opt.label}</span>
                                            {isSelected && (
                                                <Check className={`w-4 h-4 ${isHovered || (!isAnyHovered && isSelected) ? "text-white" : "text-[var(--color-secondary-blue)]"}`} />
                                            )}
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="p-4 text-center text-sm text-[var(--color-text)]">
                                    No se encontraron resultados
                                </div>
                            )}
                        </div>
                    </Portal>
                </Transition>
            )}
        </div>
    )
}

export default CustomSelect

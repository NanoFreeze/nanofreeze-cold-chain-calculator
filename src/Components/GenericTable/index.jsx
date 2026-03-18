import { useState } from "react"
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline"

const GenericTable = ({ bodyAlignment={}, bodyFont={}, bodyColorText={}, columns, data, renderCell, onRowClick }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" })

    //cambia la direccion de ordenamiento
    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                //Cambia entre ascendente y descendente
                return { key, direction: prev.direction === "asc" ? "desc" : "asc" }
            }
            return { key, direction: "asc" }
        })
    }

    //Ordena los datos
    const sortedData = [...data].sort((a, b) => {
        if (!sortConfig.key) return 0
        const valueA = a[sortConfig.key] ?? ""
        const valueB = b[sortConfig.key] ?? ""

        //Orden numerico si ambos son numeros
        if (!isNaN(valueA) && !isNaN(valueB)) {
            return sortConfig.direction === "asc" 
                ? Number(valueA) - Number(valueB)
                : Number(valueB) - Number(valueA)
        }

        //Orden alfabetico
        return sortConfig.direction === "asc"
            ? valueA.toString().localeCompare(valueB.toString())
            : valueB.toString().localeCompare(valueA.toString())
    })

    return (
        <table className="w-full table-auto border-collapse">
            <thead>
                <tr className="text-sm text-[var(--color-subtitle)] font-semibold text-left border-b border-[var(--color-grey)]">
                    {/* Recorre array de columnas */}
                    {columns.map((column, index) => (
                    <th key={index}
                        className="p-2 cursor-pointer select-none hover:text-[var(--color-primary-green)]"
                        onClick={() => handleSort(column.key)}
                    >
                        <div className="flex items-center gap-2">
                            {column.label}
                            {sortConfig.key === column.key && (
                                sortConfig.direction === "asc" ? 
                                    <ChevronUpIcon className="w-4 h-4" /> : 
                                    <ChevronDownIcon className="w-4 h-4" />
                            )}
                        </div>
                    </th>
                    ))}
                </tr>
            </thead>

            <tbody>
                {/* Recorre el array de datos */}
                {sortedData.map((row, i) => (
                <tr key={i}
                    role={onRowClick ? "button" : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    onClick={onRowClick ? () => onRowClick(row, i) : undefined}
                    onKeyDown={onRowClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onRowClick(row, i); } } : undefined}
                    className={`text-sm font-regular text-[var(--color-text)] border-b border-[var(--color-grey)] hover:bg-[var(--color-light-grey)] ${onRowClick ? "cursor-pointer" : ""}`}>
                    {/* Recorre un item del array de datos con base en las columnas */}
                    {columns.map((column, j) => {
                        const alignment = bodyAlignment[column.key] || "text-left"
                        const font = bodyFont[column.key] || "font-normal"
                        const colorText = bodyColorText[column.key] || "text-[var(--color-text)]"
                        return (
                            <td key={j} className={`p-2 ${alignment} ${font} ${colorText}`}>
                                {column.renderCell ? column.renderCell(row, i) : (renderCell ? renderCell(row, column.key) : row[column.key])}
                            </td>
                        )
                    })}
                </tr>
            ))}
            </tbody>
        </table> 
    )
}

export default GenericTable
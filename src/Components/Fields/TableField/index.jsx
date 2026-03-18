import { useEffect, useState, memo } from "react"
import AddButton from "../../ActionButton/AddButton"
import DeleteButton from "../../ActionButton/DeleteButton"
import GenericTable from "../../GenericTable"
import UploadFile from "../../UploadFile"
import { TableCell } from "./TableCell"
import { normalizeColumnName } from "../../UploadFile/uploadFileUtils"

const Table = ({ field, setFieldValue, disabled, forceRender, tableCellRenderers }) => {
    const [value, setValue] = useState(
        field.value.tablevalues?.length ? field.value.tablevalues : [{}]
    )

    useEffect(() => {
        if (!field.value.tablevalues?.length) {
            setFieldValue([{}])
            setValue([{}])
        } else {
            // Sincronizar con field.value.tablevalues cuando cambia
            // Esto es necesario para reflejar cambios externos (como prefill)
            // pero preserva las ediciones del usuario porque setRowValue actualiza field.value.tablevalues directamente
            setValue(field.value.tablevalues)
        }
    }, [forceRender, field.value.tablevalues])

    const addRow = () => {
        if (value.length >= (field.rowsLimit ?? 20)) return

        const newValue = [...field.value.tablevalues, {}]
        setValue(newValue)
        setFieldValue(newValue)
    }

    const deleteRow = (rowIndex) => {
        const newValue = [...field.value.tablevalues]
        newValue.splice(rowIndex, 1)

        setValue(newValue)
        setFieldValue(newValue)
    }

    const setRowValue = (val, rowIndex, colIndex) => {
        const newValue = [...field.value.tablevalues]
        const column = field.columns[colIndex]
        const normalizedKey = normalizeColumnName(column.name)

        //Inicializar la fila si no existe
        if (!newValue[rowIndex]) newValue[rowIndex] = {}
        if (Array.isArray(newValue[rowIndex])) newValue[rowIndex] = {}

        // Preservar todas las propiedades existentes de la fila (incluyendo datos precargados)
        const existingRow = { ...newValue[rowIndex] }

        //Exclusividad de checkboxes booleanos
        if (field.exclusiveChecks && column.type === "boolean" && column.group) {
            for (const [i, col] of field.columns.entries()) {
                if (i !== colIndex && col.type === "boolean" && col.group === column.group) {
                    const normalizedColKey = normalizeColumnName(col.name)
                    existingRow[normalizedColKey] = false
                }
            }
        }

        // Actualizar el valor de la columna específica preservando el resto
        existingRow[normalizedKey] = val
        newValue[rowIndex] = existingRow

        setValue(newValue)
        setFieldValue(newValue)
    }

    const handleExcelData = (rows) => {
        if (!Array.isArray(rows) || rows.length === 0) return
        
        // Verificar límite de filas si existe
        const rowsLimit = field.rowsLimit ?? 20
        const rowsToAdd = rows.slice(0, rowsLimit)
        
        // Reemplazar las filas existentes con las nuevas del Excel
        setValue(rowsToAdd)
        setFieldValue(rowsToAdd)
    }

    const columns = [
        ...field.columns.map((col, colIndex) => ({
            key: normalizeColumnName(col.name),
            label: col.name + (col.required ? "*" : ""),
            renderCell: (row, rowIndex) => (
                <TableCell
                    field={field}
                    row={row}
                    column={col}
                    required={col.required}
                    disabled={disabled}
                    setRowValue={(val) => setRowValue(val, rowIndex, colIndex)}
                    forceRender={forceRender}
                    tableCellRenderers={tableCellRenderers}
                />
            )
        })),
        !field.noEditable && {
            key: "delete",
            label: "",
            renderCell: (_, rowIndex) => (
                <DeleteButton
                    onClick={() => deleteRow(rowIndex)}
                    disabled={disabled}
                />
            )
        }
    ].filter(Boolean)

    return (
        <div className="w-full flex flex-col gap-1 pt-3">
            {!field.noEditable && field.enableExcelUpload && (
                <UploadFile
                    onDataParsed={handleExcelData}
                    columns={field.columns}
                    inputId={`table-field-upload-${field.name || 'default'}`}
                    showLabel={true}
                    maxSizeMB={5}
                />
            )}
            <GenericTable columns={columns} data={value} />

            {!field.noEditable && (
                <div className="flex justify-center mt-2">
                    <AddButton
                        onClick={addRow}
                        disabled={disabled || value.length >= (field.rowsLimit ?? 20)}
                    />
                </div>
            )}
        </div>
    )
}

export const TableField = memo(
    Table,
    (prev, next) =>
        prev.field === next.field &&
        prev.disabled === next.disabled &&
        prev.forceRender === next.forceRender &&
        JSON.stringify(prev.tableCellRenderers) === JSON.stringify(next.tableCellRenderers) &&
        JSON.stringify(prev.field?.value?.tablevalues) === JSON.stringify(next.field?.value?.tablevalues)
)
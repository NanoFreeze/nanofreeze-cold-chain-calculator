import { useCallback, useRef, useState, useMemo } from "react"
import { Camera } from "lucide-react"
import { processExcelFile } from "./uploadFileUtils"

const UploadFile = ({
    onDataParsed,
    columns = [],
    inputId,
    showLabel = true,
    maxSizeMB = 5,
    onError
}) => {

    const fileInputRef = useRef(null)
    const [fileName, setFileName] = useState("")
    const [loading, setLoading] = useState(false)

    const showError = useCallback((msg, code) => {
        if (onError) {
            onError({ message: msg, code })
        } else {
            alert(msg)
        }
        setFileName("")
        setLoading(false)
    }, [onError])
    

    const handleFileChange = useCallback(async(e) => {
        //Lee el archivo
        const file = e.target.files[0]
        if (!file) return

        setFileName(file.name)
        setLoading(true)
        
        try {
            const rows = await processExcelFile(file, columns, { maxSizeMB })
            onDataParsed?.(rows)
        } catch (error) {
            //Manejo de errores segun codigo
            const code = error?.message
            if (code === "invalid_file") showError("Formato inválido. Solo .xls/.xlsx o archivo demasiado grande.", code)
            else if (code === "empty_excel") showError("El archivo Excel está vacío.", code)
            else if (code === "no_valid_rows") showError("No se encontraron datos válidos en el archivo.", code)
            else {
                showError("Error al procesar el archivo Excel.", "unknown")
            }
        } finally {
            setLoading(false)
            //Reset input para permitir seleccionar el mismo archivo nuevamente, si la primera vez no se subio correctamente
            if (fileInputRef.current) fileInputRef.current.value = ""
        }    
    }, [columns, onDataParsed, showError, maxSizeMB])

    const inputIdToUse = inputId || "file-upload"

    const message = useMemo(() => {
        if (loading) return
            <p className="text-sm text-[var(--color-text)] font-regular">
                Procesando archivo...
            </p>
        return fileName ? (
            <p className="text-sm text-[var(--color-primary-green)] font-regular">
                ¡Archivo cargado correctamente! {fileName}
            </p>
        ) : (
            <p className="text-sm text-[var(--color-text)] font-regular">
                *Ningún archivo seleccionado
            </p>
        )
    }, [fileName, loading])

    return (
        <div className="flex items-center gap-x-4 pb-4">
            {showLabel && (
                <label
                    htmlFor={inputIdToUse}
                    className="
                        p-1 bg-[var(--color-primary-green)] text-white rounded-lg
                        cursor-pointer transition-all duration-200
                        hover:bg-[var(--color-primary-dark-green)] hover:shadow-md hover:-translate-y-0.5"
                    >
                    <Camera />
                </label>
            )}
            <input
                type="file"
                id={inputIdToUse}
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleFileChange} //Evento que se dispara cuando el usuario carga un archivo
            />
            {message}
        </div>
    )
}

export default UploadFile
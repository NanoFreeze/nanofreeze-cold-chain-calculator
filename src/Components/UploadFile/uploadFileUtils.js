import * as XLSX from "xlsx"

const DEFAULT_ALLOWED_EXT = ["xlsx", "xls"]
const DEFAULT_MAX_SIZE_MB = 5

//Funcion para validar el tipo de archivo
export const validateExcelFile = (file, { allowedExt = DEFAULT_ALLOWED_EXT, maxSizeMB = DEFAULT_MAX_SIZE_MB } = {}) => {
    if (!file || !file.name) return false
    const ext = file.name.split(".").pop().toLowerCase()
    if (!allowedExt.includes(ext)) return false
    if (maxSizeMB && file.size && file.size > maxSizeMB * 1024 * 1024) return false
    return true
}

//Funcion para normalizar el nombre de las columnas de Excel
export const normalizeColumnName = (name) => {
    if (!name) return ""
    return name
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
}

//Funcion para hacer match entre el index de la columna de Excel y el name de la columna de TableField
export const findMatchingColumn = (excelColumnName, columns = []) => {
    const normalized = normalizeColumnName(excelColumnName)
    return columns?.find(col => {
        const colName = normalizeColumnName(col.name)
        return (
            colName === normalized ||
            colName.includes(normalized) ||
            normalized.includes(colName)
        )
    })
}

//Funcion para filtrar filas vacias
export const isNotEmptyRow = (row) =>
    row.some(cell => cell !== undefined && cell !== null && cell !== "")

//Funcion parseo de Excel a JSON
export const parseExcelToJson = (arrayBuffer) => {
    const data = new Uint8Array(arrayBuffer)
    const workbook = XLSX.read(data, { type: "array" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    return XLSX.utils.sheet_to_json(worksheet, { header: 1 })
}

//Funcion para construir columnMap: { excelIndex: tableFieldName }
export const buildColumnMap = (headers = [], columns = []) => {
    const columnMap = {}
    headers.forEach((excelHeader, index) => {
        const match = findMatchingColumn(excelHeader, columns)
        if (match) columnMap[index] = match.name
    })
    return columnMap
}

//Funcion para transformar las filas de Excel a objetos con columnMap
export const transformRowsWithMapping = (jsonData, columnMap = {}, columns = []) => {
    if (!Array.isArray(jsonData) || !Object.keys(columnMap).length) return []
    return jsonData
      .slice(1) //Toma todas las filas excepto la primera (headers)
      .filter(isNotEmptyRow)
      .map(row => {
        const mappedRow = {}
        Object.keys(columnMap).forEach(excelIndex => {
          const tableFieldColumnName = columnMap[excelIndex]
          const cellValue = row[excelIndex]
          const column = columns?.find(col => col.name === tableFieldColumnName)
          //Normaliza la clave para que coincida con el formato esperado (minúsculas, sin tildes)
          const normalizedKey = normalizeColumnName(tableFieldColumnName)
          mappedRow[normalizedKey] = cellValue !== undefined && cellValue !== null ? String(cellValue) : ""
        })
        return mappedRow
    })
  }

//Funcion para transformar filas sin mapping: usa headers como keys
export const transformRowsWithoutMapping = (jsonData, headers = []) => {
    return jsonData
      .slice(1)
      .filter(isNotEmptyRow)
      .map(row => {
        const rowObj = {}
        headers.forEach((header, index) => {
            const headerName = header?.toString() || `Column${index + 1}`
            rowObj[headerName] = row[index] !== undefined && row[index] !== null ? String(row[index]) : ""
        })
        return rowObj
    })
  }
  
//Proceso de mas alto nivel: acepta File y columnas; devuelve rows o lanza Error
export const processExcelFile = async (file, columns = [], opts = {}) => {
    //Valida extension y tamano de archivo
    if (!validateExcelFile(file, opts)) {
        throw new Error("invalid_file")
    }
  
    //Lee como arrayBuffer (browser FileReader)
    const arrayBuffer = await file.arrayBuffer()
    const jsonData = parseExcelToJson(arrayBuffer)
  
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
        throw new Error("empty_excel")
    }
  
    const headers = jsonData[0] || []
    let rows = []
  
    if (Array.isArray(columns) && columns.length) {
        const columnMap = buildColumnMap(headers, columns)
        rows = transformRowsWithMapping(jsonData, columnMap, columns)
    } else {
        rows = transformRowsWithoutMapping(jsonData, headers)
    }
  
    if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error("no_valid_rows")
    }
  
    return rows
}
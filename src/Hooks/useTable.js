import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "../Contexts/AuthContext/AuthContext"
import { Environments } from "@/Environments/Environments"

const API_URL = `${Environments.tables}rows`

export const useTable = (tableName, queryOptions = null, mode = "rows") => {
    const { token, logout } = useAuth()
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(!!tableName)
    const [error, setError] = useState(null)
    const fetchDataRef = useRef(null)

    const fetchData = useCallback(async () => {
        //No hace la peticion si no hay token
        if (!token) {
            setLoading(false)
            setError(new Error("No authentication token available"))
            return
        }

        //No hace la peticion si no hay nombre de tabla (ej: mientras se carga el elemento)
        if (!tableName) {
            setLoading(false)
            setError(null)
            setData([])
            return
        }

        try {
            setLoading(true)
            setError(null)

            let res

            switch (mode) {
                case "count":
                    res = await fetch(`${API_URL}/${tableName}/count`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    })
                    break

                case "query":
                    res = await fetch(`${API_URL}/query/${tableName}`, {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(queryOptions)
                    })
                    break

                case "queryCount":
                    res = await fetch(`${API_URL}/query/${tableName}/count`, {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(queryOptions)
                    })
                    break

                default:
                    res = await fetch(`${API_URL}/${tableName}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    })
            }
            
            //Maneja errores de autenticacion (401, 403)
            if (res.status === 401 || res.status === 403) {
                setError(new Error(`Authentication error: ${res.status}`))
                logout()
                return
            }
            
            if (!res.ok) throw new Error(`Error ${res.status}`)
                
            const result = await res.json()

            switch (mode) {
                case "count":
                    setData(result?.data?.total ?? 0)
                    break

                case "queryCount":
                    setData({
                        total: result?.data?.total ?? 0,
                        filtered: result?.data?.filtered ?? 0,
                    })
                    break

                default:
                    setData(result.data ?? [])
            }

        } catch (err) {
            setError(err)
        } finally {
            setLoading(false)
        }
    }, [tableName, mode, JSON.stringify(queryOptions), token, logout])

    //Guarda referencia a fetchData para poder usarla en reload
    fetchDataRef.current = fetchData

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const reload = useCallback(() => {
        fetchDataRef.current?.()
    }, [])

    return { data, loading, error, reload }
}

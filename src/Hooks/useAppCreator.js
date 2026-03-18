import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "../Contexts/AuthContext/AuthContext"
import { Environments } from "@/Environments/Environments"

/**
 * Base URL de la API App Creator (debe terminar en /).
 * Ej: https://nanofreeze.app-creator.ibisagroup.com/api/v1/
 */
const getApiBase = () => {
	const base = Environments.appCreator
	return base ? (base.endsWith("/") ? base : `${base}/`) : ""
}

/**
 * Construye la URL del recurso con opciones.
 * @param {string} resource - 'apps' | 'modules' | 'elements' | 'deploys'
 * @param {{ id?: string|number, subPath?: string, queryParams?: Record<string, string|number|boolean|undefined> }} options
 */
const buildUrl = (resource, options = null) => {
	const base = getApiBase()
	let path = resource

	if (options?.id != null) {
		path = `${path}/${options.id}`
		if (options.subPath) {
			path = `${path}/${options.subPath}`
		}
	}

	const url = new URL(path, base)
	if (options?.queryParams && typeof options.queryParams === "object") {
		Object.entries(options.queryParams).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				url.searchParams.set(key, String(value))
			}
		})
	}
	return url.toString()
}

/**
 * Hook para consultar la API App Creator (apps, modules, elements, deploys).
 * Sigue el mismo patrón que useTable: token de Auth, fetch con Bearer, manejo de 401/403 y reload.
 *
 * @param {string} resource - Recurso: 'apps' | 'modules' | 'elements' | 'deploys'
 * @param {null|{ id?: string|number, subPath?: string, queryParams?: Record<string, string|number|boolean|undefined> }} options
 *   - id: para GET por id (ej: /apps/1, /apps/1/structure)
 *   - subPath: subruta tras el id (ej: 'structure' -> /apps/1/structure, 'dataflows' -> /apps/1/dataflows)
 *   - queryParams: objeto para query string (ej: { limit: 30, status: 'active', count: true })
 * @returns {{ data: any, loading: boolean, error: Error|null, reload: () => void }}
 *
 * @example
 * // Listar apps
 * const { data: apps, loading, error, reload } = useAppCreator('apps')
 *
 * @example
 * // Una app por id (con módulos y elementos)
 * const { data: app } = useAppCreator('apps', { id: 1 })
 *
 * @example
 * // Estructura de una app
 * const { data: structure } = useAppCreator('apps', { id: 1, subPath: 'structure' })
 *
 * @example
 * // Apps con paginación y filtros
 * const { data } = useAppCreator('apps', { queryParams: { limit: 10, page: 1, count: true } })
 */
export const useAppCreator = (resource, options = null) => {
	const { token, logout } = useAuth()
	const [data, setData] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const fetchDataRef = useRef(null)

	const fetchData = useCallback(async () => {
		if (!getApiBase()) {
			setLoading(false)
			setError(new Error("VITE_APP_APP_CREATOR no está configurada"))
			return
		}

		if (!token) {
			setLoading(false)
			setError(new Error("No hay token de autenticación"))
			return
		}

		try {
			setLoading(true)
			setError(null)

			const url = buildUrl(resource, options)
			const res = await fetch(url, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			})

			if (res.status === 401 || res.status === 403) {
				setError(new Error(`Error de autenticación: ${res.status}`))
				logout()
				return
			}

			if (!res.ok) throw new Error(`Error ${res.status}`)

			const result = await res.json()
			setData(result.data ?? result)
		} catch (err) {
			setError(err)
		} finally {
			setLoading(false)
		}
	}, [resource, JSON.stringify(options), token, logout])

	fetchDataRef.current = fetchData

	useEffect(() => {
		fetchData()
	}, [fetchData])

	const reload = useCallback(() => {
		if (fetchDataRef.current) fetchDataRef.current()
	}, [])

	return { data, loading, error, reload }
}

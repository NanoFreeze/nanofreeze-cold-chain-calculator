import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/Contexts/AuthContext/AuthContext"
import { Environments } from "@/Environments/Environments"

export const useDynamicForm = ({
    formId,
    enabled = true,
    tokenOverride,
}) => {
    const { token: contextToken, isAuthenticated } = useAuth()
    const token = tokenOverride ?? contextToken

    const [form, setForm] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [version, setVersion] = useState(0)

    useEffect(() => {
        if (!enabled) {
            setForm(null)
            setError("")
            setLoading(false)
        }
    }, [enabled])

    useEffect(() => {
        if (!enabled) return

        if (!formId || !token || !isAuthenticated) {
            setForm(null)
            setError("")
            return
        }

        const abortController = new AbortController()

        const fetchForm = async () => {
            try {
                setLoading(true)
                setError("")

                const response = await fetch(
                    `${Environments.toolbox}forms?cacheBust=${Date.now()}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                            "Cache-Control": "no-cache",
                            Pragma: "no-cache",
                        },
                        cache: "no-store",
                        signal: abortController.signal,
                    }
                )

                if (response.status === 304) return

                if (!response.ok) {
                    throw new Error(`Error ${response.status}`)
                }

                const data = await response.json()
                const forms = data?.data ?? []
                const target = forms.find((item) => item?._id === formId)

                if (!target) {
                    setForm(null)
                    setError(`No se encontró el formulario con id ${formId}.`)
                    return
                }

                // Deep clone
                setForm(JSON.parse(JSON.stringify(target)))
            } catch (err) {
                if (err?.name === "AbortError") return

                setError(err?.message || "No fue posible cargar el formulario.")
                setForm(null)
            } finally {
                setLoading(false)
            }
        }

        fetchForm()
        return () => abortController.abort()
    }, [formId, token, isAuthenticated, version, enabled])

    const fields = useMemo(() => form?.fields ?? [], [form])

    return {
        form,
        fields,
        loading,
        error,
        reload: () => setVersion(prev => prev + 1),
    }
}

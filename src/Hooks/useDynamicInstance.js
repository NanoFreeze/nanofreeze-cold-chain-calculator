import { useState } from "react"
import { Environments } from "@/Environments/Environments"
import { useAuth } from "@/Contexts/AuthContext/AuthContext"

const createInstancePayload = (form) => ({
    form: {
        _id: form._id,
        name: form.name,
        sections: form.sections ?? [],
        fields: form.fields ?? [],
    },
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
})

export const useDynamicInstance = (form) => {
    const { token } = useAuth()
    const [instance, setInstance] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const submitInstance = async (fields) => {
        if (!form?._id) {
            console.warn("[useDynamicInstance] No hay formulario", { formId: form?._id, formName: form?.name })
            return false
        }

        setLoading(true)
        setError("")

        try {
            const payload = createInstancePayload(form)
            const resCreate = await fetch(`${Environments.toolbox}instances`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })

            if (!resCreate.ok) throw new Error(`Error ${resCreate.status}`)

            const data = await resCreate.json()
            const newInstance = data?.data ?? data

            if (!newInstance?._id) {
                setLoading(false)
                return false
            }

            const validFields = fields.filter((field) => field && field.type_field)
            const updatePayload = {
                ...newInstance,
                form: {
                    ...newInstance.form,
                    fields: validFields,
                },
                status: "sent",
                sentTime: Date.now(),
            }

            const url = `${Environments.toolbox}instances/${newInstance._id}`
            const resUpdate = await fetch(url, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatePayload),
            })

            if (!resUpdate.ok) {
                const errorText = await resUpdate.text()
                console.error("[useDynamicInstance] Error en respuesta del servidor", {
                    instanceId: newInstance._id,
                    status: resUpdate.status,
                    statusText: resUpdate.statusText,
                    errorText,
                })
                throw new Error(`Error ${resUpdate.status}: ${resUpdate.statusText}`)
            }

            setInstance(newInstance)
            return true
        } catch (err) {
            console.error("[useDynamicInstance] Error al enviar instancia", {
                formId: form?._id,
                formName: form?.name,
                error: err?.message,
                stack: err?.stack,
            })
            setError(err?.message || "Error al enviar formulario")
            return false
        } finally {
            setLoading(false)
        }
    }

    return { instance, loading, error, submitInstance }
}

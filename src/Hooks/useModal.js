import { useEffect, useState } from "react"
import { useDynamicForm } from "@/Hooks/useDynamicForm"
import { useDynamicInstance } from "@/Hooks/useDynamicInstance"

export const useModal = (formId, onSuccess = null) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [fieldsState, setFieldsState] = useState([])
    const [data, setData] = useState(null)

    const {
        form,
        fields,
        loading: formLoading,
        error: formError,
        reload,
    } = useDynamicForm ({
            formId,
            enabled: isOpen,
        })
    
    const {
        submitInstance,
        loading: instanceLoading,
        error: instanceError,
    } = useDynamicInstance(form)

    //Inicializa fieldsState al cargar formulario
    useEffect(() => {
        if (fields) setFieldsState(fields)
    }, [fields])
    
    const openModal = (item, modalData = null) => {
        setSelectedItem(item || null)
        setData(modalData || null)
        if (!isOpen) {
            reload()
            setIsOpen(true)
        }
    }
    
    const updateData = (modalData) => {
        setData(modalData)
    }
    
    const closeModal = () => {
        setSelectedItem(null)
        setData(null)
        setIsOpen(false)
    }
    
    const submit = async (fieldsToSubmit) => {
        try {
            const success = await submitInstance(fieldsToSubmit)
            
            if (success) {
                const item = selectedItem
                closeModal()
                // Ejecutar callback obligatorio para recargar datos sin recargar la página
                if (!onSuccess || typeof onSuccess !== 'function') {
                    console.error("[useModal] El callback 'onSuccess' es obligatorio. Debe ser una función que recargue los datos necesarios.", {
                        formId,
                        formName: form?.name
                    })
                    return
                }
                onSuccess(item)
            } else {
                console.warn("[useModal] El formulario no se pudo enviar", {
                    formId,
                    formName: form?.name
                })
            }
        } catch (err) {
            console.error("[useModal] Error al enviar formulario", {
                formId,
                formName: form?.name,
                error: err?.message
            })
            // Error handled by submitInstance
        }
    }

    return {
        isOpen,
        form,
        fields: fieldsState,
        setFields: setFieldsState,
        formLoading,
        instanceLoading,
        formError,
        instanceError,
        selectedItem,
        data,
        openModal,
        updateData,
        closeModal,
        submit, 
    }
}
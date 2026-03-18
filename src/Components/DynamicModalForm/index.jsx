import React, { memo, useCallback, useRef, useEffect } from "react"
import AutoFields from "../Fields/AutoFields"
import ModalForm from "../Form/ModalForm"

const DynamicModalForm = ({
    modal,
    title,
    description,
    width,
    children,
    overflow = "overflow-auto",
    fieldClassName,
    prefillConfig,
    fieldsConfig,
    tableCellRenderers,
    fieldsVisibility,
    getPrefillData = null, //Funcion opcional que recibe el modal y devuelve el objeto prefillData
}) => {
    const getCurrentFieldsRef = useRef(null)

    const handleSubmit = useCallback((e) => {
        e.preventDefault()

        let fieldsToSubmit = modal.fields

        if (getCurrentFieldsRef.current) {
            const currentFields = getCurrentFieldsRef.current()
            if (currentFields && currentFields.length > 0) {
                fieldsToSubmit = currentFields
                modal.setFields(currentFields)
            }
        }
        
        modal.submit(fieldsToSubmit)
    }, [modal, title])

    //Early return despues de todos los hooks
    if (!modal?.isOpen || !modal?.form) return null

    const isLoading  = modal.formLoading  || modal.instanceLoading
    const hasError   = modal.formError    || modal.instanceError
    
    //Si se proporciona getPrefillData, usarla; sino, usar comportamiento por defecto
    const prefillData = getPrefillData
        ? getPrefillData(modal)
        : (modal.selectedItem || modal.data
            ? { ...(modal.selectedItem || {}), ...(modal.data || {}) }
            : null)

    return (
        <ModalForm
            title={title}
            description={description}
            width={width}
            onClose={modal.closeModal}
            onSubmit={handleSubmit}
            overflow={overflow}
        >
            {isLoading ? (
                <p className="text-sm font-normal text-[var(--color-text)]">
                    Cargando...
                </p>
            ) : hasError ? (
                <p className="text-sm font-normal text-[var(--color-red)]">
                    {modal.formError || modal.instanceError}
                </p>
            ) : (
                <>
                    {children}

                    <AutoFields
                        fields={modal.fields}
                        setFields={modal.setFields}
                        disabled={isLoading}
                        fieldClassName={fieldClassName}
                        prefillData={prefillData}
                        prefillConfig={prefillConfig}
                        onGetCurrentFields={getCurrentFieldsRef}
                        fieldsConfig={fieldsConfig}
                        tableCellRenderers={tableCellRenderers}
                        fieldsVisibility={fieldsVisibility}
                    />
                </>
            )}
        </ModalForm>
    )
}

const DynamicModalFormMemo = memo(
    DynamicModalForm,
    (prev, next) => {

        const prevIsClosed = !prev.modal?.isOpen || !prev.modal?.form
        const nextIsClosed = !next.modal?.isOpen || !next.modal?.form

        if (prevIsClosed && nextIsClosed) {
            return true
        }

        // Resolver prefillData para comparación usando getPrefillData si está disponible
        const getPrevPrefillData = prev.getPrefillData || ((modal) => 
            modal?.selectedItem || modal?.data
                ? { ...(modal?.selectedItem || {}), ...(modal?.data || {}) }
                : null
        )
        const getNextPrefillData = next.getPrefillData || ((modal) => 
            modal?.selectedItem || modal?.data
                ? { ...(modal?.selectedItem || {}), ...(modal?.data || {}) }
                : null
        )
        
        const prevPrefillData = getPrevPrefillData(prev.modal)
        const nextPrefillData = getNextPrefillData(next.modal)
        
        const modalChanged =
            prev.modal?.isOpen !== next.modal?.isOpen ||
            prev.modal?.form?.id !== next.modal?.form?.id ||
            prev.modal?.fields?.length !== next.modal?.fields?.length ||
            JSON.stringify(prevPrefillData) !== JSON.stringify(nextPrefillData) ||
            prev.modal?.formLoading !== next.modal?.formLoading ||
            prev.modal?.instanceLoading !== next.modal?.instanceLoading ||
            prev.modal?.formError !== next.modal?.formError ||
            prev.modal?.instanceError !== next.modal?.instanceError

        const otherPropsChanged =
            prev.title !== next.title ||
            prev.description !== next.description ||
            prev.overflow !== next.overflow ||
            prev.fieldClassName !== next.fieldClassName ||
            JSON.stringify(prev.prefillConfig) !== JSON.stringify(next.prefillConfig) ||
            JSON.stringify(prev.fieldsConfig) !== JSON.stringify(next.fieldsConfig) ||
            JSON.stringify(prev.tableCellRenderers) !== JSON.stringify(next.tableCellRenderers) ||
            JSON.stringify(prev.fieldsVisibility) !== JSON.stringify(next.fieldsVisibility) ||
            prev.getPrefillData !== next.getPrefillData

        const shouldSkip = !modalChanged && !otherPropsChanged

        return shouldSkip
    }
)

export default DynamicModalFormMemo

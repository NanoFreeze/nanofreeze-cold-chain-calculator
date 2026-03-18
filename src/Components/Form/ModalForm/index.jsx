import React from "react"
import ActionButton from "../../ActionButton"

const ModalForm = ({ title, description, children, onClose, onSubmit }) => {

    return (
        <div className="z-[50] flex items-center justify-center fixed inset-0 bg-black/60">
            <form
                onSubmit={onSubmit}
                className="flex flex-col w-[600px] h-auto max-h-[520px] px-6 py-4 bg-white border border-[var(--color-grey)] rounded-xl shadow-sm">
                <header className="pb-4">
                    <h3 className="text-lg text-[var(--color-subtitle)] font-semibold">
                        {title}
                    </h3>

                    <p className="pt-1 text-[var(--color-text)]">
                        {description}
                    </p>
                </header>

                <div className="flex-1 p-0.5 overflow-y-auto">
                    {children}
                </div>

                <footer className="flex gap-4 justify-end mt-auto pt-4">
                    <ActionButton
                        type="button"
                        label="Cancelar"
                        variant="secondary"
                        onClick={onClose}
                    />
                    <ActionButton
                        type="submit"
                        label="Guardar"
                        variant="primary"
                    />
                </footer>
            </form>
        </div>
    )
}

export default ModalForm
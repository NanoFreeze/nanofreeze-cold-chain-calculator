const DataState = ({
    loading,
    error,
    isEmpty,
    loadingText = "Cargando información...",
    errorText = "Error al cargar información",
    emptyText = "No hay información disponible",
    children
}) => {
    if (loading) {
        return <p className="text-sm text-[var(--color-text)]/70 italic">{loadingText}</p>
    }

    if (error) {
        return <p className="text-sm text-red-500/70 italic">{errorText}</p>
    }

    if (isEmpty) {
        return emptyText ? (
            <p className="text-sm text-[var(--color-text)]/70 italic">{emptyText}</p>
        ) : null
    }

    return children
}

export default DataState

import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import ActionButton from "../../../Components/ActionButton"
import DataState from "../../../Components/DataState"
import { useClientData } from "../Hooks/useClientData"
import { useHierarchyConfig } from "../Hooks/useHierarchyConfig"
import { TEMPLATE_OPTIONS } from "../Hierarchy/defaultConfigs"
import { ChevronRight, Plus, Trash2, ArrowUp, ArrowDown, RotateCcw, Save } from "lucide-react"

const slugify = (s) =>
    s
        ?.toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "") || ""

const ensureUniqueKey = (base, existing, ignoreIndex = -1) => {
    let candidate = base || "level"
    let suffix = 2
    while (existing.some((l, idx) => idx !== ignoreIndex && l.key === candidate)) {
        candidate = `${base}_${suffix++}`
    }
    return candidate
}

const HierarchySettings = () => {
    const { id_client } = useParams()
    const { data: clientData, loading: clientLoading, error: clientError } = useClientData(id_client)
    const client = clientData?.[0]

    const { config, loading: configLoading, updateConfig, resetConfig } = useHierarchyConfig(id_client)
    const [draft, setDraft] = useState(null)
    const [savedAt, setSavedAt] = useState(null)

    useEffect(() => {
        if (config) setDraft(structuredClone(config))
    }, [config])

    const updateLevel = (idx, patch) => {
        setDraft((prev) => {
            const levels = prev.levels.map((l, i) => (i === idx ? { ...l, ...patch } : l))
            return { ...prev, levels }
        })
    }

    const addLevel = () => {
        setDraft((prev) => {
            const base = `nivel_${prev.levels.length + 1}`
            const key = ensureUniqueKey(base, prev.levels)
            return {
                ...prev,
                levels: [
                    ...prev.levels,
                    { key, label: `Nivel ${prev.levels.length + 1}`, pluralLabel: `Niveles ${prev.levels.length + 1}` },
                ],
            }
        })
    }

    const removeLevel = (idx) => {
        setDraft((prev) => {
            if (prev.levels.length <= 1) return prev
            return { ...prev, levels: prev.levels.filter((_, i) => i !== idx) }
        })
    }

    const moveLevel = (idx, dir) => {
        setDraft((prev) => {
            const target = idx + dir
            if (target < 0 || target >= prev.levels.length) return prev
            const levels = [...prev.levels]
            const [item] = levels.splice(idx, 1)
            levels.splice(target, 0, item)
            return { ...prev, levels }
        })
    }

    const applyTemplate = (templateId) => {
        const opt = TEMPLATE_OPTIONS.find((t) => t.id === templateId)
        if (!opt) return
        setDraft((prev) => ({
            ...prev,
            separator: opt.template.separator,
            levels: opt.template.levels.map((l) => ({ ...l })),
        }))
    }

    const save = () => {
        if (!draft) return

        const cleanLevels = draft.levels.map((l, idx) => {
            const baseKey = l.key?.trim() ? l.key.trim() : slugify(l.label) || `nivel_${idx + 1}`
            return {
                ...l,
                label: (l.label ?? "").trim() || `Nivel ${idx + 1}`,
                pluralLabel: (l.pluralLabel ?? "").trim() || (l.label ?? `Nivel ${idx + 1}`),
                key: slugify(baseKey) || `nivel_${idx + 1}`,
            }
        })

        const dedupedLevels = cleanLevels.map((l, idx, arr) => ({
            ...l,
            key: ensureUniqueKey(l.key, arr, idx),
        }))

        updateConfig({ ...draft, levels: dedupedLevels })
        setSavedAt(new Date().toLocaleTimeString())
    }

    const isDirty =
        draft && config && JSON.stringify({ ...draft, updatedAt: 0 }) !== JSON.stringify({ ...config, updatedAt: 0 })

    return (
        <div>
            <div className="flex items-center gap-2 pb-4 text-sm text-[var(--color-subtitle)]">
                <Link to="/clients" className="cursor-pointer hover:font-semibold text-inherit no-underline">
                    Clientes
                </Link>

                <ChevronRight className="w-4 h-4" />

                <Link
                    to={`/clients/${id_client}`}
                    className="cursor-pointer hover:font-semibold text-inherit no-underline"
                >
                    {client?.name ?? ""}
                </Link>

                <ChevronRight className="w-4 h-4" />

                <span className="font-semibold">Jerarquía</span>
            </div>

            <DataState
                loading={clientLoading || configLoading || !draft}
                error={clientError}
                isEmpty={!client}
                loadingText="Cargando configuración..."
                errorText="Error al cargar el cliente"
                emptyText="Cliente no encontrado"
            >
                <div className="flex flex-col gap-8">
                    <div className="flex justify-between items-start gap-6">
                        <div className="flex flex-col gap-3">
                            <h1 className="text-2xl font-bold text-[var(--color-main-title)]">
                                Jerarquía organizacional
                            </h1>

                            <p className="font-semibold text-[var(--color-subtitle)]">
                                Define los niveles bajo los cuales {client?.name ?? "el cliente"} agrupa sus puntos de venta.
                                El último nivel siempre representa la tienda o sucursal y contiene los equipos.
                            </p>

                            <p className="text-sm text-[var(--color-text)]">
                                Los valores de cada nivel se leen del campo <code>location</code> del punto de venta,
                                separados por <code>{draft?.separator}</code>.
                                Ej: <code>Colombia {draft?.separator} Cundinamarca {draft?.separator} Bogotá {draft?.separator} Centro</code>.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <ActionButton
                                label="Restablecer"
                                variant="secondary"
                                icon={RotateCcw}
                                onClick={() => {
                                    resetConfig()
                                    setSavedAt(null)
                                }}
                            />
                            <ActionButton
                                label="Guardar"
                                variant="primary"
                                icon={Save}
                                onClick={save}
                                disabled={!isDirty}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 p-4 bg-white border border-[var(--color-grey)] rounded-2xl shadow-sm">
                        <h2 className="text-lg font-semibold text-[var(--color-subtitle)]">
                            Plantillas
                        </h2>

                        <div className="flex flex-wrap gap-2">
                            {TEMPLATE_OPTIONS.map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => applyTemplate(opt.id)}
                                    className="text-sm px-3 py-1.5 border border-[var(--color-grey)] rounded-xl text-[var(--color-subtitle)] hover:bg-[var(--color-soft-grey)] cursor-pointer"
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <label className="text-sm text-[var(--color-subtitle)]">Separador:</label>
                            <input
                                type="text"
                                maxLength={3}
                                value={draft?.separator ?? "/"}
                                onChange={(e) => setDraft((prev) => ({ ...prev, separator: e.target.value || "/" }))}
                                className="w-16 px-2 py-1 text-sm border border-[var(--color-grey)] rounded-lg"
                            />
                            <span className="text-xs text-[var(--color-text)]">
                                Carácter usado para separar los niveles dentro del campo location.
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-[var(--color-subtitle)]">
                                Niveles ({draft?.levels.length ?? 0})
                            </h2>
                            <ActionButton label="Agregar Nivel" variant="secondary" icon={Plus} onClick={addLevel} />
                        </div>

                        <div className="flex flex-col gap-3">
                            {draft?.levels.map((level, idx) => {
                                const isLast = idx === draft.levels.length - 1
                                return (
                                    <div
                                        key={idx}
                                        className="flex flex-col gap-3 p-4 bg-white border border-[var(--color-grey)] rounded-2xl shadow-sm"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-primary-soft-blue)] text-[var(--color-subtitle)] font-semibold text-sm">
                                                    {idx + 1}
                                                </span>
                                                <span className="text-xs uppercase font-semibold tracking-wide text-[var(--color-text)]">
                                                    {isLast ? "Hoja (tiendas)" : "Agrupador"}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => moveLevel(idx, -1)}
                                                    disabled={idx === 0}
                                                    aria-label="Subir nivel"
                                                    className="p-1.5 rounded-full hover:bg-[var(--color-primary-soft-blue)] text-[var(--color-primary-blue)] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                                                >
                                                    <ArrowUp className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveLevel(idx, 1)}
                                                    disabled={idx === draft.levels.length - 1}
                                                    aria-label="Bajar nivel"
                                                    className="p-1.5 rounded-full hover:bg-[var(--color-primary-soft-blue)] text-[var(--color-primary-blue)] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                                                >
                                                    <ArrowDown className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeLevel(idx)}
                                                    disabled={draft.levels.length <= 1}
                                                    aria-label="Eliminar nivel"
                                                    className="p-1.5 rounded-full hover:bg-[var(--color-primary-soft-red)] text-[var(--color-primary-blue)] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs text-[var(--color-text)]">Etiqueta</label>
                                                <input
                                                    type="text"
                                                    value={level.label}
                                                    onChange={(e) => updateLevel(idx, { label: e.target.value })}
                                                    className="px-3 py-2 text-sm border border-[var(--color-grey)] rounded-lg"
                                                    placeholder="País"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs text-[var(--color-text)]">Plural</label>
                                                <input
                                                    type="text"
                                                    value={level.pluralLabel}
                                                    onChange={(e) => updateLevel(idx, { pluralLabel: e.target.value })}
                                                    className="px-3 py-2 text-sm border border-[var(--color-grey)] rounded-lg"
                                                    placeholder="Países"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs text-[var(--color-text)]">Clave</label>
                                                <input
                                                    type="text"
                                                    value={level.key}
                                                    onChange={(e) => updateLevel(idx, { key: e.target.value })}
                                                    className="px-3 py-2 text-sm border border-[var(--color-grey)] rounded-lg font-mono"
                                                    placeholder="country"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {savedAt && (
                        <p className="text-sm text-[var(--color-dark-green)]">
                            Configuración guardada localmente a las {savedAt}.
                        </p>
                    )}
                </div>
            </DataState>
        </div>
    )
}

export default HierarchySettings

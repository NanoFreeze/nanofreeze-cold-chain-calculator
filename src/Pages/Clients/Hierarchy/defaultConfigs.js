export const FLAT_CONFIG = {
    separator: "/",
    levels: [
        { key: "store", label: "Punto de venta", pluralLabel: "Puntos de venta", icon: "Store" },
    ],
}

export const BAVARIA_TEMPLATE = {
    separator: "/",
    levels: [
        { key: "country", label: "País", pluralLabel: "Países", icon: "Globe2" },
        { key: "region", label: "Región", pluralLabel: "Regiones", icon: "Map" },
        { key: "departamento", label: "Departamento", pluralLabel: "Departamentos", icon: "MapPinned" },
        { key: "city", label: "Ciudad", pluralLabel: "Ciudades", icon: "Building" },
        { key: "store", label: "Tienda", pluralLabel: "Tiendas", icon: "Store" },
    ],
}

export const TEMPLATE_OPTIONS = [
    { id: "flat", label: "Solo puntos de venta", template: FLAT_CONFIG },
    { id: "bavaria", label: "País → Región → Departamento → Ciudad → Tienda", template: BAVARIA_TEMPLATE },
]

export const buildDefaultConfig = (clientId) => ({
    clientId: String(clientId),
    separator: FLAT_CONFIG.separator,
    levels: FLAT_CONFIG.levels.map((l) => ({ ...l })),
    updatedAt: new Date().toISOString(),
})

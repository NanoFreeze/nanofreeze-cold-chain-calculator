import { useMemo, useEffect } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { useMap, MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import "leaflet/dist/leaflet.css"

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const Map = ({ locations = [], height = "300px", children, icon: Icon, }) => {

    const markerIcon = useMemo(() => {
        if (!Icon) return undefined

        const svgString = renderToStaticMarkup(
            <Icon size={20} color="white" strokeWidth={1.5} />
        )
    
        return L.divIcon({
            className: "",
            html: `
                <div class="group cursor-pointer">
                    <div class="flex items-center justify-center w-9 h-9 bg-[var(--color-secondary-blue)] rounded-full shadow-sm transition-transform duration-200 group-hover:scale-110 group-hover:shadow-xl">
                        ${svgString}
                    </div>
                </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -36],
        })
    }, [Icon])

    const FitBounds = ({ locations }) => {
        const map = useMap()

        useEffect(() => {
            if (!locations?.length) return

            const bounds = L.latLngBounds(
                locations.map(loc => [loc.lat, loc.lng])
            )

            map.fitBounds(bounds, { padding: [50, 50] })
        }, [locations, map])

        return null
    }

    return (
        <div className="w-full rounded-sm overflow-hidden shadow-md">
            <MapContainer
                center={[0, 0]}
                zoom={2}
                scrollWheelZoom={true}
                style={{ height }}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitBounds locations={locations} />

                {locations.map((loc) => (
                    <Marker
                        key={loc.id}
                        position={[loc.lat, loc.lng]}
                        icon={markerIcon}
                    >
                        <Popup contentClassName="!m-2 !p-0">
                            {children ? children(loc) : null}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    )
}

export default Map
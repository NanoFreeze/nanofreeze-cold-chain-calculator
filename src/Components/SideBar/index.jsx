import { useNavigate } from "react-router-dom"
import BarItem from "./BarItem"
import { useAuth } from "../../Contexts/AuthContext/AuthContext"
import { useAppCreator } from "@/Hooks/useAppCreator"
import { SIDEBAR_BASE } from "./sideBarConfig"
import { ArrowLeftStartOnRectangleIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"
import nf_logo_blue from "../../assets/images/nf-logo-blue.svg"

const APP_ID = 2

const SideBar = ({ isExpanded, onToggle }) => {

    const { logout } = useAuth()
    const navigate = useNavigate()
    const { data: modules, loading: modulesLoading, error: modulesError } = useAppCreator("modules", {
        queryParams: { appId: APP_ID }
    })

    const sideBarItems = (modules ?? [])
        .slice()
        .sort((a, b) => a.id - b.id)
        .map(module => {
            const base = SIDEBAR_BASE[module.id]

            if (!base) {
                console.warn(`Módulo sin configuración en sidebar: ${module.name}`)
                return null
            }

            return {
                label: module.name,
                path: base.path,
                icon: base.icon,
            }
        })
        .filter(Boolean)

    const handleLogout = () => {
        logout()
        navigate("/auth/login")
    }

    return (
        <nav
            className={`fixed top-0 left-0 h-full flex flex-col bg-[var(--color-primary-blue)]/2 border-r border-[var(--color-primary-blue)]/10 shadow-md
            ${isExpanded ? "w-[240px]" : "w-[72px]"} transition-all duration-200 ease-in-out`}
        >
            <div className={`h-[64px] flex items-center justify-center border-b border-[var(--color-primary-blue)]/10 ${isExpanded ? "" : "px-2"}`}>
                <img
                    src={isExpanded ? nf_logo_blue : nf_logo_blue}
                    alt="NanoFreeze"
                    className={`${isExpanded ? "h-[40px]" : "h-[28px]"} w-auto cursor-pointer transition-all duration-200`}
                />
            </div>

            <button
                onClick={() => onToggle(!isExpanded)}
                className="absolute right-[-12px] top-[64px] -translate-y-1/2 w-[24px] h-[24px] flex items-center justify-center bg-white rounded-full border border-[var(--color-subtitle)]/50 cursor-pointer shadow-sm"
                aria-label={ isExpanded ? "Contraer sidebar" : "Expandir sidebar" }
            >
                {isExpanded
                    ? <ChevronLeftIcon className="w-4 h-4 text-[var(--color-subtitle)]" />
                    : <ChevronRightIcon className="w-4 h-4 text-[var(--color-subtitle)]" />
                }
            </button>

            <ul className="flex flex-col flex-1 p-4 gap-1">
                {sideBarItems?.map(item => (
                    <BarItem
                        key={item.path}
                        Icon={item.icon}
                        label={item.label}
                        link={item.path}
                        showLabel={isExpanded}
                        rounded={isExpanded ? "rounded-2xl" : "rounded-full"}
                        onClick={() => isExpanded && onToggle(false)}
                    />
                ))}
            </ul>

            <div className="h-[64px] flex items-center justify-center border-t border-[var(--color-primary-blue)]/10 text-sm">
                <button 
                    onClick={handleLogout}
                    className="w-full h-[40px] flex items-center justify-center cursor-pointer"
                    aria-label="Cerrar sesión"
                >
                    <ArrowLeftStartOnRectangleIcon className="w-6 h-6 text-[var(--color-subtitle)]" />

                    {isExpanded && <span className="pl-3">Cerrar sesión</span>}
                </button>
            </div>
        </nav>
    )
}

export default SideBar
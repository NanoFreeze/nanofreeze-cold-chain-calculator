import { Link, useLocation } from "react-router-dom" 

const BarItem = ({ Icon, label, link, onClick, showLabel = true, rounded = "rounded-2xl" }) => {

    const location = useLocation() //Obtiene la ruta actual
    const isActive = location.pathname === link //Detecta si la ruta actual coincide

    return (
        <li className="flex items-center justify-center h-[44px]">
            <Link
                to={link}
                onClick={onClick}
                className={`w-full h-[40px] gap-2 p-2 flex items-center rounded-2xl cursor-pointer transition-colors duration-200 ease-in-out
                    ${rounded}
                    ${isActive ? "bg-[var(--color-primary-blue)]" : "hover:bg-[var(--color-primary-blue)]/10" }`}
            >
                <Icon
                    className={`w-6 h-6 transition-colors duration-200
                        ${isActive ? "text-white" : "text-[var(--color-subtitle)] group-hover:text-[var(--color-primary-blue)]" }`}
                />

                {showLabel && (
                    <span
                        className={`px-2 text-sm font-medium transition-colors duration-200
                        ${isActive ? "text-white" : "text-[var(--color-subtitle)]" }`}
                    >
                        {label}
                    </span>
                )}
            </Link>
        </li>
    )
}

export default BarItem
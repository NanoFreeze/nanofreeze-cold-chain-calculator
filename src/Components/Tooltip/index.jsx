const Tooltip = ({ children, label }) => {
    return (
        <div className="relative group inline-flex">
            {children}

            <span className="absolute top-1/2 left-full ml-2 -translate-y-1/2 z-50 rounded-lg bg-[var(--color-primary-blue)] px-2 py-1 text-xs text-white
                opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
            >
                {label}
            </span>
        </div>
    )
}

export default Tooltip
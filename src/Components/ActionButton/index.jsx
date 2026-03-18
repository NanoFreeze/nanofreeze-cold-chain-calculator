import React from "react"

const VARIANTS = {
    primary: "py-2 px-4 text-white bg-[var(--color-primary-blue)] rounded-xl hover:bg-[var(--color-primary-medium-blue)] hover:shadow-md hover:-translate-y-0.5",
    secondary: "py-2 px-4 text-[var(--color-subtitle)] bg-[var(--color-soft-grey)] border border-[var(--color-grey)] rounded-xl hover:bg-[var(--color-primary-soft-red)] hover:shadow-md hover:-translate-y-0.5",
    primaryIcon: "p-1.5 rounded-full text-white bg-[var(--color-primary-blue)]",
    secondaryIcon: "p-1.5 rounded-full text-[var(--color-primary-blue)] hover:bg-[var(--color-primary-soft-blue)]",
}

const ActionButton = ({
    label,
    type = "button",
    onClick,
    icon: Icon,
    iconPosition = "left",
    iconClassName = "w-5 h-5 stroke-[1.75]",
    variant = "primary",
    className = "",
    disabled = false,
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-200
                ${VARIANTS[variant]}
                ${disabled ? "opacity-60 cursor-not-allowed pointer-events-none" : "cursor-pointer"}
                ${className}`}
        >
            {Icon && iconPosition === "left" && <Icon className={iconClassName} />}

            {label}

            {Icon && iconPosition === "right" && <Icon className={iconClassName} />}
        </button>
    )
}

export default ActionButton

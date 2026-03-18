import React from "react"

const Card = ({ title, value, unit, description, icon: Icon, iconBgColor = "bg-[var(--color-primary-soft-blue)]", iconColor = "text-[var(--color-subtitle)]"}) => {
    return (
        <div className="flex justify-between gap-10 p-5 bg-white border border-[var(--color-grey)] rounded-2xl shadow-sm">
            <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-[var(--color-subtitle)]">
                    {title}
                </h3>

                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[var(--color-subtitle)]">
                        {value}
                    </span>

                    {unit && (
                        <span className="text-sm text-[var(--color-text)]">
                            {unit}
                        </span>
                    )}
                </div>

                {description && (
                    <p className="text-sm text-[var(--color-text)]">
                        {description}
                    </p>
                )}
            </div>

            <div className={`flex items-center justify-center w-10 h-10 ${iconBgColor} rounded-xl`}>
                <Icon className={`w-6 h-6 ${iconColor} stroke-[1.75]`} />
            </div>
        </div>
    )
}

export default Card
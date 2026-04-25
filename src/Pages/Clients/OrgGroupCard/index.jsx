import { Building2, ChevronRight } from "lucide-react"
import { formatNumber, formatToMillions } from "../../../Utils/formatters"

const OrgGroupCard = ({ unit, onClick }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className="text-left w-full flex flex-col gap-3 p-4 bg-white border border-[var(--color-grey)] rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-[var(--color-primary-soft-blue)] rounded-xl">
                        <Building2 className="w-6 h-6 text-[var(--color-subtitle)] stroke-[1.75]" />
                    </div>

                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wide text-[var(--color-text)]">
                            {unit.level?.label}
                        </span>
                        <span className="font-semibold text-[var(--color-subtitle)]">{unit.value}</span>
                    </div>
                </div>

                <ChevronRight className="w-5 h-5 text-[var(--color-text)]" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-[var(--color-text)]">
                <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide">Puntos</span>
                    <span className="font-semibold text-[var(--color-subtitle)]">
                        {unit.totalPoints} ({unit.activePoints} act.)
                    </span>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide">Equipos</span>
                    <span className="font-semibold text-[var(--color-subtitle)]">{unit.totalDevices}</span>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide">Consumo</span>
                    <span className="font-semibold text-[var(--color-subtitle)]">
                        {formatNumber(unit.energyConsumption)} kWh
                    </span>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide">Ahorro</span>
                    <span className="font-semibold text-[var(--color-subtitle)]">
                        ${formatToMillions(unit.costSaving)}M
                    </span>
                </div>
            </div>
        </button>
    )
}

export default OrgGroupCard

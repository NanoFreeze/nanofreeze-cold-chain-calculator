const ChartContainer = ({ title, children, metricOptions = [], activeMetric, onMetricChange, timeOptions = [], activeTime, onTimeChange }) => {

    const showMetricOptions = metricOptions.length > 0 && onMetricChange
    const showTimeOptions = timeOptions.length > 0 && onTimeChange

    return (
        <div className="border border-[var(--color-grey)] rounded-2xl shadow-sm">
            <div className="flex items-center p-4 bg-[var(--color-soft-grey)] border-b border-[var(--color-grey)] rounded-t-2xl">
                <h3 className="font-semibold text-[var(--color-subtitle)]">
                    {title}
                </h3>
            </div>

            <div className="flex flex-col gap-6 p-4 bg-white rounded-b-2xl">
                
                {showMetricOptions && (
                    <div className="flex items-center w-fit self-end gap-2 bg-[var(--color-grey)] rounded-lg p-1">
                        {metricOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => onMetricChange(option.id)}
                                className={`
                                    py-1 px-2 text-sm font-semibold cursor-pointer
                                    ${activeMetric === option.id
                                        ? "text-[var(--color-subtitle)] bg-white rounded-md"
                                        : "text-[var(--color-secondary-text)]"}`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}

                <div className="w-full h-full">
                    {children}
                </div>

                {showTimeOptions && (
                    <div className="flex items-center w-fit self-center gap-2 bg-[var(--color-grey)] rounded-lg p-1">
                        {timeOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => onTimeChange(option.id)}
                                className={`
                                    py-1 px-2 text-sm font-semibold cursor-pointer
                                    ${activeTime === option.id
                                        ? "text-[var(--color-subtitle)] bg-white rounded-md"
                                        : "text-[var(--color-secondary-text)]"}`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ChartContainer
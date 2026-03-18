const StatusTag = ({ label, bgColor, dotColor, textColor }) => {
    return (
        <div className={`inline-flex items-center gap-2 py-1 px-2 w-fit ${bgColor} rounded-xl`}>
            <span className={`inline-block w-2 h-2 ${dotColor} rounded-full`} />

            <span className={`text-xs font-semibold ${textColor}`}>
                {label}
            </span>
        </div>
    )
}

export default StatusTag
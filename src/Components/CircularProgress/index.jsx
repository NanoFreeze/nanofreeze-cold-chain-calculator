const CircularProgress = ({
    size = 50,
    strokeWidth = 5,
    progress,
    color = "var(--color-primary-red)",
    bgColor = "var(--color-grey)",
  }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (progress / 100) * circumference
  
    return (
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Fondo */}
        <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={bgColor}
            strokeWidth={strokeWidth}
            fill="transparent"
        />
        {/* Progreso */}
        <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
        />
      </svg>
    )
  }
  
  export default CircularProgress
  
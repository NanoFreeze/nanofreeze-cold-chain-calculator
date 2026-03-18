const formatDate = (dateString) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()

    return `${day}-${month}-${year}`
}

const formatDateTime = (dateObj) => {
    const day = String(dateObj.getDate()).padStart(2, "0")
    const month = String(dateObj.getMonth() + 1).padStart(2, "0")
    const year = dateObj.getFullYear()

    const hours = String(dateObj.getHours()).padStart(2, "0")
    const minutes = String(dateObj.getMinutes()).padStart(2, "0")
    const seconds = String(dateObj.getSeconds()).padStart(2, "0")

    return `${day}-${month}-${year} ${hours}-${minutes}-${seconds}`
}

const formatMonthYearShort = (dateObj) => {

    const monthRaw = dateObj.toLocaleString("es-CO", { month: "short" })
    const monthWithoutDot = monthRaw.replace(".", "")

    const capitalizedMonth =
        monthWithoutDot.charAt(0).toUpperCase() +
        monthWithoutDot.slice(1)

    const year = dateObj.getFullYear()

    return `${capitalizedMonth} ${year}`
}

export const formatHourData = (data = [], metricsMap = {}) => {

    const result = {}

    Object.keys(metricsMap).forEach(metricKey => {
        result[metricKey] = []
    })

    const sortedData = [...data]
        .filter(item => item?.datetime)
        .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))

    sortedData.forEach(item => {

        const startDate = new Date(item.datetime)

        if (isNaN(startDate.getTime())) return

        const hourLabel = startDate.toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })

        const baseObject = {
            date: startDate.toISOString().split("T")[0],
            hour: hourLabel,
            hourNumber: startDate.getHours(),
            fullDateTime: formatDateTime(startDate),
        }

        Object.entries(metricsMap).forEach(([metricKey, dataField]) => {
            result[metricKey].push({
                ...baseObject,
                value: parseFloat(item[dataField] ?? 0)
            })
        })
    })

    return result
}


export const formatDayData = (data = [], metricsMap = {}) => {

    const result = {}

    Object.keys(metricsMap).forEach(metricKey => {
        result[metricKey] = []
    })

    const sortedData = [...data]
        .filter(item => item?.date)
        .sort((a, b) => new Date(a.date) - new Date(b.date))

    sortedData.forEach(item => {

        const dateObj = new Date(item.date)

        if (isNaN(dateObj.getTime())) return

        const baseObject = {
            date: item.date,
            day: dateObj.getDate(),
            month: dateObj.toLocaleString("es-CO", { month: "short" }),
            fullDate: formatDate(item.date),
        }

        Object.entries(metricsMap).forEach(([metricKey, dataField]) => {
            result[metricKey].push({
                ...baseObject,
                value: parseFloat(item[dataField] ?? 0)
            })
        })
    })

    return result
}


export const formatMonthData = (data = [], metricsMap = {}) => {

    const monthNames = [
        "Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
    ]

    const sortedData = [...data].sort(
        (a, b) => new Date(a.period_start) - new Date(b.period_start)
    )

    const result = {}

    Object.keys(metricsMap).forEach(metricKey => {
        result[metricKey] = []
    })

    sortedData?.forEach(item => {
        const startDate = new Date(item.period_start);
        const monthName = monthNames[startDate.getMonth()];

        const baseObject = {
            year: startDate.getFullYear(),
            month: monthName,
            monthIndex: startDate.getMonth() + 1,
            monthYearShort: formatMonthYearShort(startDate),
        }

        Object.entries(metricsMap).forEach(([metricKey, dataField]) => {
            result[metricKey].push({
                ...baseObject,
                value: parseFloat(item[dataField] ?? 0)
            })
        })
    })

    return result
}
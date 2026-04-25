import { useMemo } from "react"
import { matchesPath, segmentAtLevel } from "../Hierarchy/parsePath"

const sumNumber = (a, b) => Number(a ?? 0) + Number(b ?? 0)

export const useOrgUnits = (points, config, currentPath) => {
    return useMemo(() => {
        if (!config || !Array.isArray(points)) return { units: [], leafPoints: [], levelIndex: 0 }

        const levelIndex = currentPath?.length ?? 0
        const levels = config.levels ?? []
        const isLastLevel = levelIndex >= levels.length - 1

        const filtered = points.filter((p) => matchesPath(p, config.separator, currentPath))

        if (isLastLevel) {
            return { units: [], leafPoints: filtered, levelIndex }
        }

        const groups = new Map()

        filtered.forEach((p) => {
            const segment = segmentAtLevel(p, config.separator, levelIndex)
            const key = segment ?? "Sin asignar"

            if (!groups.has(key)) {
                groups.set(key, {
                    level: levels[levelIndex],
                    value: key,
                    path: [...(currentPath ?? []), key],
                    totalPoints: 0,
                    totalDevices: 0,
                    activePoints: 0,
                    inactivePoints: 0,
                    energyConsumption: 0,
                    co2Avoided: 0,
                    costSaving: 0,
                })
            }

            const group = groups.get(key)
            group.totalPoints += 1
            group.totalDevices += Number(p.total_devices ?? 0)
            group.energyConsumption = sumNumber(group.energyConsumption, p.energy_consumption)
            group.co2Avoided = sumNumber(group.co2Avoided, p.co2_avoided)
            group.costSaving = sumNumber(group.costSaving, p.cost_saving)
            if ((p.status ?? "").toLowerCase().startsWith("activ")) {
                group.activePoints += 1
            } else {
                group.inactivePoints += 1
            }
        })

        const units = Array.from(groups.values()).sort((a, b) => a.value.localeCompare(b.value))

        return { units, leafPoints: filtered, levelIndex }
    }, [points, config, currentPath])
}

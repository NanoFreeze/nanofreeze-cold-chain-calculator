import CustomSelect from "../../../Components/CustomSelect"

const PointsFilter = ({ pointsOptions, filters, onFilterChange }) => {
    return (
        <div>
            <CustomSelect
                options={pointsOptions}
                value={filters.points ? { id: filters.points, label: filters.points } : null}
                onChange={(opt) => onFilterChange("points", opt == null || opt?.id === "__all__" ? "" : (opt?.label ?? ""))}
            />
        </div>

    )
}

export default PointsFilter
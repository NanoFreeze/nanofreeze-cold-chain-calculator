import CustomSelect from "../../../Components/CustomSelect"

const DevicesFilter = ({ devicesOptions, filters, onFilterChange }) => {
    return (
        <div>
            <CustomSelect
                options={devicesOptions}
                value={filters.devices ? { id: filters.devices, label: filters.devices } : null}
                onChange={(opt) => onFilterChange("devices", opt == null || opt?.id === "__all__" ? "" : (opt?.label ?? ""))}
            />
        </div>

    )
}

export default DevicesFilter
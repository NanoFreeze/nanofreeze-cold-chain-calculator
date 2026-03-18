import CustomSelect from "../../../Components/CustomSelect"

const ClientsFilter = ({ clientsOptions, filters, onFilterChange }) => {
    return (
        <div>
            <CustomSelect
                options={clientsOptions}
                value={filters.clients ? { id: filters.clients, label: filters.clients } : null}
                onChange={(opt) => onFilterChange("clients", opt == null || opt?.id === "__all__" ? "" : (opt?.label ?? ""))}
            />
        </div>

    )
}

export default ClientsFilter
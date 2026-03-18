import { Search } from "lucide-react"

const SearchBar = () => {
    return (
        <div className="flex items-center w-full py-1 bg-[var(--color-light-grey)] border border-[var(--color-grey)] rounded-xl">
            <input
                type="text"
                placeholder="Buscar"
                className="flex-1 px-3 text-xs text-[var(--color-text)] focus:outline-none"
            />
            <Search className="w-4 h-4 mr-3 text-[var(--color-text)]" />
        </div>
    )
}

export default SearchBar

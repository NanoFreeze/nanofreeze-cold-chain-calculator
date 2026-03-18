import { CirclePlus } from "lucide-react"
import ActionButton from ".."

const AddButton = ({ onClick }) => {
    return (
        <ActionButton
            label=""
            onClick={onClick}
            icon={CirclePlus}
            className="
                p-1.5 rounded-full text-white bg-[var(--color-primary-green)] 
                hover:bg-[var(--color-primary-dark-green)]"
        />
    )
}

export default AddButton
import { Trash2 } from "lucide-react"
import ActionButton from ".."

const DeleteButton = ({ onClick }) => {
    return (
        <ActionButton
            label=""
            onClick={onClick}
            icon={Trash2}
            className="
                p-1.5 rounded-full text-white bg-[var(--color-red)] 
                hover:bg-[var(--color-dark-red)]"
        />
    )
}

export default DeleteButton
  
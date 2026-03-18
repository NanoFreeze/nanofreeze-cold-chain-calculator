export const CommentField = ({ field }) => {
    return (
        <div className="text-[var(--color-primary-red)] font-medium">
            <b className="text-base">{field.name}:</b> {field.value?.value}
        </div>
    )
}
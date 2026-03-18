const FormInput = ({
    type,
    placeHolder,
    value,
    onChange,
    disabled,
    className,
    ...rest
}) => {
    return (
        <input
            type={type}
            placeholder={placeHolder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`w-full p-2 text-sm text-[var(--color-text)] bg-[var(--color-soft-grey)] border border-[var(--color-grey)] rounded-lg placeholder:text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-blue)] ${className}`}
            {...rest}
        />
    )
}

export default FormInput
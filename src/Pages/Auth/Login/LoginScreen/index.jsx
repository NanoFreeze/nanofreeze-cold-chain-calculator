import { useState } from "react"
import ActionButton from "../../../../Components/ActionButton"
import FormInput from "../../../../Components/Form/FormInput"
import nf_logo_blue from "../../../../assets/images/nf-logo-blue.svg"

const LoginScreen = ({ login }) => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = (e) => {
        e?.preventDefault()
        if (email && password) {
            login(email, password)
        }
    }

    return (
        <div className="flex justify-center items-center h-screen p-5 bg-[var(--color-soft-grey)]">
            <div className="flex gap-5 w-full max-w-6xl h-[600px] mx-auto overflow-hidden ">

                {/* Panel izquierdo */}
                <div className="relative w-1/2 rounded-2xl overflow-hidden">
                    <img
                        src="https://images.pexels.com/photos/3184634/pexels-photo-3184634.jpeg"
                        alt="business team office"
                        className="w-full h-full object-cover object-right"
                    />
                </div>

                {/* Panel derecho */}
                <div className="flex flex-col justify-center items-center w-1/2 gap-12 py-4 px-20 text-center rounded-2xl bg-white">
                    <img
                        src={nf_logo_blue}
                        alt="logo"
                        className="h-[74px]"
                    />

                    <div className="flex flex-col gap-2">
                        <h2 className="text-xl font-bold text-[var(--color-main-title)]">
                            Iniciar sesión
                        </h2>

                        <p className="text-base text-[var(--color-subtitle)]">
                            Ingresa tu usuario y contraseña para continuar
                        </p>

                        <p className="text-base text-[var(--color-text)]">
                            ¿No tienes una cuenta? <span className="text-[var(--color-primary-red)] underline cursor-pointer">Regístrate</span>
                        </p>
                    </div>
                    
                    <form className="w-full" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-4">
                            <FormInput 
                                type="email" 
                                placeholder="usuario@ejemplo.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <FormInput 
                                type="password" 
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </form>

                    <ActionButton
                        label="Iniciar sesión"
                        onClick={handleSubmit}
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    )
}

export default LoginScreen
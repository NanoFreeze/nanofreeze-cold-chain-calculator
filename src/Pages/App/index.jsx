import "./App.css"
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "../../Contexts/AuthContext/AuthContext"
import { Routes } from "@/Routes/Routes"

function App() {
    return (
        <AuthProvider>
            <Routes />
        </AuthProvider>
    )
}

export default App
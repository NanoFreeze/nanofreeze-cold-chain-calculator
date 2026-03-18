import { Navigate, Route, Routes, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useAuth } from "@/Contexts/AuthContext/AuthContext"
import { Login } from "@/Pages/Auth/Login/Login"
// import { Register } from "../Components/Auth/Register/Register"
import { Callback } from "@/Pages/Auth/Callback/Callback"

const AuthLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (pathname === "/auth" || pathname === "/auth/") {
      navigate("/auth/login");
    }
  }, [pathname, navigate]);

  if (isAuthenticated) {
    return <Navigate to="/" />
  }

  return <Outlet />
}

export const AuthRoutes = () => <Routes>
  <Route path="/" element={<AuthLayout />}>
    <Route path="/login" element={<Login />} />
    {/* <Route path="/register" element={<Register />} /> */}
    <Route path="/login/callback" element={<Callback />} />
  </Route>
  <Route path="*" element={<Navigate to="/auth/login" />} />
</Routes>
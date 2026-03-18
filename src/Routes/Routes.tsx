import { BrowserRouter, Route, Routes as Router } from "react-router-dom"
import { AuthRoutes } from "./AuthRoutes"
import { ProtectedRoutes } from "./ProtectedRoutes"

export const Routes = () => {
  return <BrowserRouter>
    <Router>
      <Route path="/auth/*" element={<AuthRoutes />} />
      <Route path="/*" element={<ProtectedRoutes />} />
      <Route path="*" element={<div>404</div>} />
    </Router>
  </BrowserRouter>
}
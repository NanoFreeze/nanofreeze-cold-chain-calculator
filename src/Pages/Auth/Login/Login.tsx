import LoginScreen from "./LoginScreen"
import { useMemo } from "react"
import { auth0Login } from "@/Services/Auth0/Auth0"
import { useAuth } from "@/Contexts/AuthContext/AuthContext"
import { jwtDecode } from "jwt-decode"
import { useTranslation } from "react-i18next"

interface IdTokenPayload {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

export const Login = () => {
  const { t } = useTranslation(); 
  const { login } = useAuth();

  const errorCases = useMemo(() => ({
    "invalid_credentials": t("error.invalidCredentials"),
    "invalid_grant": t("error.invalidCredentials"),
    "invalid_request": t("error.invalidCredentials"),
    "invalid_token": t("error.invalidCredentials"),
    "invalid_client": t("error.invalidCredentials"),
    "invalid_scope": t("error.invalidCredentials"),
    "invalid_redirect_uri": t("error.invalidCredentials"),
    "invalid_client_secret": t("error.invalidCredentials"),
    "invalid_client_id": t("error.invalidCredentials"),
  }), [ t ]);

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await auth0Login(email, password);
      
      if (result.access_token && result.id_token) {
        const idTokenPayload = jwtDecode<IdTokenPayload>(result.id_token);
        
        const user = {
          id: idTokenPayload.sub,
          email: idTokenPayload.email,
          name: idTokenPayload.name,
          picture: idTokenPayload.picture,
        };

        login(result.access_token, user, result.refresh_token);
      }
    } catch (err) {
      const authError = err as { description?: string; error_description?: string; error?: string };
      console.error("Login error:", err);
      const errorMessage = errorCases[authError.error as keyof typeof errorCases] || authError.description || authError.error_description || t("error.generic");
      console.error(errorMessage);
    }
  }

  return <LoginScreen login={handleLogin} />
}

import { useEffect, useState } from "react"
import { useAuth } from "@/Contexts/AuthContext/AuthContext"
import { useNavigate } from "react-router-dom"
import { parseHash } from "@/Services/Auth0/Auth0"
import type { User } from "@/Contexts/AuthContext/AuthContext.types"
import { useTranslation } from "react-i18next"

export const Callback = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const result = await parseHash();

        if (result && result.accessToken && result.idTokenPayload) {
          const user: User = {
            id: result.idTokenPayload.sub,
            email: result.idTokenPayload.email,
            name: result.idTokenPayload.name,
            picture: result.idTokenPayload.picture,
          };
          login(result.accessToken, user);
          navigate('/');
        } else {
          setError(t('auth.callback.noAuthInfo'));
        }
      } catch (err) {
        const authError = err as { description?: string; error_description?: string };
        setError(authError.description || authError.error_description || t('auth.callback.processError'));
      }
    };

    handleCallback();
  }, [login, navigate, t]);

  if (error) return <div id="callback">
    <p>{error}</p>
    <button onClick={() => navigate('/login')}>{t('auth.callback.backToLogin')}</button>
  </div>

  return <div>...</div>
}

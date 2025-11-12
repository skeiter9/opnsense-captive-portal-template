import { useState } from 'react';
import { captivePortalApi } from '../services/captivePortalApi';
import { useSession } from '../contexts/SessionContext';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState('invalid');
  const [authType, setAuthType] = useState(null);
  const { updateSession } = useSession();

  const authenticate = async (credentials, type = 'normal') => {
    setLoading(true);
    setError(null);
    setErrorType('invalid');
    setAuthType(type);

    try {
      const data = await captivePortalApi.logon(credentials);
      
      if (data.clientState === 'AUTHORIZED') {
        updateSession(data);
        return { success: true, data };
      } else {
        const errType = data.errorType || 'invalid';
        setErrorType(errType);
        setError(data.error || 'Authentication failed');
        return { success: false, errorType: errType };
      }
    } catch (err) {
      setError('Connection failed');
      return { success: false, errorType: 'connection' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await captivePortalApi.logoff();
      updateSession(null);
      window.location.href = '/';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return {
    authenticate,
    logout,
    loading,
    error,
    errorType,
    authType,
  };
}

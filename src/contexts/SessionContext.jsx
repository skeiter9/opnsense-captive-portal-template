import { createContext, useContext, useState } from 'react';

const SessionContext = createContext();

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const updateSession = (sessionData) => {
    setSession(sessionData);
    setIsAuthenticated(!!sessionData);
  };

  const clearSession = () => {
    setSession(null);
    setIsAuthenticated(false);
  };

  return (
    <SessionContext.Provider value={{
      session,
      isAuthenticated,
      updateSession,
      clearSession,
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};

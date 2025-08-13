import React, { useEffect, useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

// Visual feedback components
const Loading = () => <div style={{textAlign:'center',marginTop:'2rem'}}>Loading authentication...</div>;
const Error = ({ error }) => <div style={{color:'red',textAlign:'center',marginTop:'2rem'}}>Auth Error: {error.message || error.toString()}</div>;

// Only allow @somaiya.edu emails
function isSomaiyaEmail(user) {
  return user?.email?.endsWith('@somaiya.edu');
}

export const AuthWrapper = ({ children }) => {
  const {
    isLoading,
    error,
    isAuthenticated,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    getIdTokenClaims,
  } = useAuth0();
  const [checked, setChecked] = useState(false);
  const [domainError, setDomainError] = useState(null);

  // Persist auth state in localStorage
  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [isAuthenticated, user]);

  // Enforce @somaiya.edu domain
  useEffect(() => {
    if (isAuthenticated && user && !isSomaiyaEmail(user)) {
      setDomainError('Only @somaiya.edu emails are allowed.');
      setTimeout(() => {
        logout({ returnTo: window.location.origin });
      }, 2000);
    } else {
      setDomainError(null);
    }
    setChecked(true);
  }, [isAuthenticated, user, logout]);

  // Handle session expiration
  useEffect(() => {
    const checkSession = async () => {
      try {
        if (isAuthenticated) {
          await getAccessTokenSilently();
        }
      } catch (e) {
        // Token expired or network error
        logout({ returnTo: window.location.origin });
      }
    };
    checkSession();
    // Optionally, poll every X minutes
    // const interval = setInterval(checkSession, 5 * 60 * 1000);
    // return () => clearInterval(interval);
  }, [isAuthenticated, getAccessTokenSilently, logout]);

  if (isLoading || !checked) return <Loading />;
  if (error) return <Error error={error} />;
  if (domainError) return <Error error={domainError} />;

  return children;
};

// ProtectedRoute wrapper for route-level protection
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loginWithRedirect, isLoading, user } = useAuth0();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isSomaiyaEmail(user))) {
      setRedirecting(true);
      loginWithRedirect({ appState: { returnTo: window.location.pathname } });
    }
  }, [isAuthenticated, isLoading, loginWithRedirect, user]);

  if (isLoading || redirecting) return <div style={{textAlign:'center',marginTop:'2rem'}}>Redirecting to login...</div>;
  if (!isAuthenticated || !isSomaiyaEmail(user)) return null;
  return children;
}; 
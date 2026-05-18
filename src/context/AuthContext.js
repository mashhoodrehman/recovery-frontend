import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { authService } from 'services/auth.service';
import { tokenStore } from 'services/tokenStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => tokenStore.getUser());
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(Boolean(tokenStore.getAccess()));

  const hydrate = useCallback(async () => {
    if (!tokenStore.getAccess()) {
      setLoading(false);
      return;
    }
    try {
      const data = await authService.me();
      setUser(data.user);
      setPermissions(data.permissions || []);
      tokenStore.set({ user: data.user });
    } catch (err) {
      tokenStore.clear();
      setUser(null);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = useCallback(async (creds) => {
    const data = await authService.login(creds);
    tokenStore.set({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    });
    setUser(data.user);
    const me = await authService.me();
    setPermissions(me.permissions || []);
    return data.user;
  }, []);

  const signup = useCallback(async (payload) => {
    const data = await authService.signup(payload);
    tokenStore.set({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    });
    setUser(data.user);
    const me = await authService.me();
    setPermissions(me.permissions || []);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore — clearing locally regardless
    }
    tokenStore.clear();
    setUser(null);
    setPermissions([]);
  }, []);

  const can = useCallback(
    (...required) => {
      if (!permissions.length) return false;
      if (permissions.includes('*')) return true;
      return required.some((p) => permissions.includes(p));
    },
    [permissions]
  );

  const value = useMemo(
    () => ({
      user,
      permissions,
      isAuthenticated: Boolean(user),
      loading,
      can,
      login,
      signup,
      logout,
      refreshMe: hydrate,
    }),
    [user, permissions, loading, can, login, signup, logout, hydrate]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

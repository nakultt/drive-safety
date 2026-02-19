// AuthContext removed — authentication disabled for frontend. Keep an empty placeholder to avoid import errors.
export const authPlaceholder = null;

// Authentication removed. No-op exports to prevent import errors.
export const AuthProvider = ({ children }: any) => children;
export function useAuth() { return { isAuthenticated: false, login: async () => '', logout: () => {} }; }

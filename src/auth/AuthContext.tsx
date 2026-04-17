import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { User } from "../models/User";
import { userManager } from "../api/userManager";
import { notificationService } from "../services/notificationService";
import { SUPER_ADMIN_EMAIL } from "../config";
import type { GoogleProfile } from "./googleAuth";
import { googleSignOut } from "./googleAuth";

interface AuthContextType {
  currentUser: User | null;
  /** Wywoływane po pomyślnej autoryzacji Google (lub w trybie dev). */
  loginWithProfile: (profile: GoogleProfile) => Promise<User>;
  logout: () => void;
  /** Pozwala zsynchronizować stan po zmianie roli / blokady w widoku list. */
  refreshCurrentUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loginWithProfile: async () => {
    throw new Error("AuthContext not initialized");
  },
  logout: () => {},
  refreshCurrentUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const id = userManager.getCurrentUserId();
    if (!id) return null;
    return userManager.getById(id) ?? null;
  });

  // Jeśli zapisany id nie wskazuje na istniejącego usera — wyczyść.
  useEffect(() => {
    const id = userManager.getCurrentUserId();
    if (id && !userManager.getById(id)) {
      userManager.setCurrentUserId(null);
      setCurrentUser(null);
    }
  }, []);

  const loginWithProfile = useCallback(async (profile: GoogleProfile): Promise<User> => {
    const email = profile.email.trim();
    if (!email) throw new Error("Profil Google nie zawiera e-maila");

    const existing = userManager.getByEmail(email);
    if (existing) {
      userManager.setCurrentUserId(existing.id);
      setCurrentUser(existing);
      return existing;
    }

    // Pierwsze logowanie — tworzymy nowego użytkownika.
    const isSuperAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

    const created = await userManager.create({
      firstName: profile.givenName || profile.name,
      lastName: profile.familyName,
      email,
      role: isSuperAdmin ? "admin" : "guest",
      isBlocked: false,
      picture: profile.picture,
    });

    userManager.setCurrentUserId(created.id);
    setCurrentUser(created);

    // Powiadomienie do wszystkich adminów o nowym koncie
    // (super-admin też tworzy powiadomienie — sam do siebie, zgodnie z treścią
    //  polecenia: "pierwsze logowanie nowego użytkownika powinno utworzyć
    //  powiadomienie dla administratorów").
    notificationService.notifyUserRegistered(
      `${created.firstName} ${created.lastName}`.trim() || email,
      email
    );

    return created;
  }, []);

  const logout = useCallback(() => {
    googleSignOut();
    userManager.setCurrentUserId(null);
    setCurrentUser(null);
  }, []);

  const refreshCurrentUser = useCallback(() => {
    const id = userManager.getCurrentUserId();
    if (!id) {
      setCurrentUser(null);
      return;
    }
    const u = userManager.getById(id);
    setCurrentUser(u ?? null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loginWithProfile, logout, refreshCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}


import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { AuthService } from '../services/authService';
import { StorageService } from '../services/storageService';

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => boolean;
    register: (username: string, password: string) => boolean;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);

            // Attempt migration on first load if needed
            // Ideally this would be smarter, but eager migration is okay for this scale
            const migratedCount = StorageService.migrateLegacyData(currentUser.id);
            if (migratedCount > 0) {
                console.log(`Migrated ${migratedCount} legacy items to user ${currentUser.username}`);
            }
        }
    }, []);

    const login = (username: string, password: string): boolean => {
        const user = AuthService.login(username, password);
        if (user) {
            setUser(user);
            setIsAuthenticated(true);
            AuthService.setCurrentUser(user);
            StorageService.migrateLegacyData(user.id); // Check migration on login too
            return true;
        }
        return false;
    };

    const register = (username: string, password: string): boolean => {
        const user = AuthService.register(username, password);
        if (user) {
            setUser(user);
            setIsAuthenticated(true);
            AuthService.setCurrentUser(user);
            StorageService.migrateLegacyData(user.id);
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        AuthService.setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

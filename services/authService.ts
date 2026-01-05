
import { User } from '../types';

const USERS_KEY = 'scope_users';
const CURRENT_USER_KEY = 'scope_current_user';

export const AuthService = {
    getUsers: (): User[] => {
        const users = localStorage.getItem(USERS_KEY);
        return users ? JSON.parse(users) : [];
    },

    register: (username: string, password: string): User | null => {
        const users = AuthService.getUsers();
        if (users.find(u => u.username === username)) {
            return null; // User already exists
        }

        const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            username,
            password // In a real app, hash this!
        };

        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        return newUser;
    },

    login: (username: string, password: string): User | null => {
        const users = AuthService.getUsers();
        const user = users.find(u => u.username === username && u.password === password);
        return user || null;
    },

    getCurrentUser: (): User | null => {
        const stored = localStorage.getItem(CURRENT_USER_KEY);
        return stored ? JSON.parse(stored) : null;
    },

    setCurrentUser: (user: User | null) => {
        if (user) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(CURRENT_USER_KEY);
        }
    }
};

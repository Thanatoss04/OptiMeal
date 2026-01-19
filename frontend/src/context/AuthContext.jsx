import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const ROLES = {
    WAITER: 'waiter',
    KITCHEN: 'kitchen',
    MANAGER: 'manager'
};

export const ROLE_CONFIG = {
    [ROLES.WAITER]: {
        label: 'Waiter',
        icon: '🍽️',
        description: 'Take orders and serve customers',
        color: '#f59e0b'
    },
    [ROLES.KITCHEN]: {
        label: 'Kitchen',
        icon: '👨‍🍳',
        description: 'Prepare and manage orders',
        color: '#ef4444'
    },
    [ROLES.MANAGER]: {
        label: 'Manager',
        icon: '📊',
        description: 'View analytics and manage operations',
        color: '#3b82f6'
    }
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from sessionStorage on mount
    useEffect(() => {
        const savedUser = sessionStorage.getItem('restaurant_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                sessionStorage.removeItem('restaurant_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (name, role) => {
        const userData = {
            name: name || ROLE_CONFIG[role].label,
            role,
            loginTime: new Date().toISOString()
        };
        setUser(userData);
        sessionStorage.setItem('restaurant_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('restaurant_user');
    };

    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        currentRole: user?.role
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

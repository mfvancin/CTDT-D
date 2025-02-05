// import React, { createContext, useContext, useState, useEffect} from 'react';
// import { User, AuthState } from './types';

// interface AuthContextType extends AuthState {
//     login: (email: string, password: string) => Promise<void>;
//     register: (email: string, password: string, name: string) => Promise<void>;
//     logout: () => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//     const [authState, setAuthState] = useState<AuthState>({
//         user: null,
//         isAuthenticated: false,
//     });

//     const login = async (email: string, password: string) => {
//         try {
//             const response = await fetch('https://ctdt-d.onrender.com/login', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ email, password }),
//             });

//             const responseBody = await response.json();

//             if (!response.ok) {
//                 throw new Error(responseBody.detail || 'Login failed');
//             }

//             localStorage.setItem('token', responseBody.access_token);
//             setAuthState({
//                 user: {
//                     id: responseBody.user.id,
//                     email: responseBody.user.email,
//                     name: responseBody.user.name
//                 },
//                 isAuthenticated: true
//             });

//         } catch (error) {
//             console.error('Login error:', error);
//             throw error;
//         }
//     };

//     const register = async (email: string, password: string, name: string) => {
//         try {
//             const response = await fetch('https://ctdt-d.onrender.com/register', {
//                 method: 'POST',
//                 headers: { 
//                     'Content-Type': 'application/json',
//                     'Accept': 'application/json'
//                 },
//                 body: JSON.stringify({ email, password, name }),
//             });

//             const responseBody = await response.json();

//             if (!response.ok) {
//                 throw new Error(responseBody.detail || 'Registration failed');
//             }

//             await login(email, password);

//         } catch (error) {
//             console.error('Registration error:', error);
//             throw error;
//         }
//     };

//     const verifyToken = async () => {
//         const token = localStorage.getItem('token');
//         if (!token) {
//             setAuthState({ user: null, isAuthenticated: false });
//             return;
//         }
//         try {
//             const response = await fetch('https://ctdt-d.onrender.com/me', {
//                 method: 'GET',
//                 headers: { 
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 },
//             });

//             if (!response.ok) {
//                 throw new Error('Token verification failed');
//             }

//             const userData = await response.json();
//             setAuthState({
//                 user: userData,
//                 isAuthenticated: true
//             });
//         } catch (error) {
//             console.error('Token verification error:', error);
//             localStorage.removeItem('token');
//             setAuthState({ user: null, isAuthenticated: false });
//         }
//     };
    
//     useEffect(() => {
//         verifyToken();
//     }, []);

//     const logout = () => {
//         localStorage.removeItem('token');
//         setAuthState({ user: null, isAuthenticated: false });
//     };

//     return (
//         <AuthContext.Provider value={{ ...authState, login, register, logout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => {
//     const context = useContext(AuthContext);
//     if (context === undefined) {
//         throw new Error('useAuth must be used within an AuthProvider');
//     }
//     return context;
// };
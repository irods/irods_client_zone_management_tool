import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext({ });

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState();

    const updateToken = (newToken) => {
        setToken(newToken);
    }

    return (
        <AuthContext.Provider value={{ token: token, updateToken: updateToken }}>
            {children}
        </AuthContext.Provider >
    )
}

export const useAuth = () => useContext(AuthContext);
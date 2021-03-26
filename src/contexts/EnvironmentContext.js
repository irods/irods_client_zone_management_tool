import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export const EnvironmentContext = createContext();

export const EnvironmentProvider = ({ children }) => {
    const [auth, setAuth] = useState(Cookies.get('token'));

    return (
        <EnvironmentContext.Provider value={{
            restApiLocation: process.env.REACT_APP_REST_API_URL,
            restApiTimeout: process.env.REACT_APP_REST_API_CONNECTION_TIMEOUT_SECOND,
            primaryColor: process.env.REACT_APP_PRIMARY_COLOR,
            appbarLogo: process.env.REACT_APP_APPBAR_LOGO,
            loginLogo: process.env.REACT_APP_LOGIN_LOGO,
            brandingName: process.env.REACT_APP_BRANDING_NAME,
            auth
        }}>
            {children}
        </EnvironmentContext.Provider>
    )
}

export const useEnvironment = () => useContext(EnvironmentContext);
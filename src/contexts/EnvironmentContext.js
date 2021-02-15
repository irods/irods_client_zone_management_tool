import React, { createContext, useContext, useEffect, useState } from 'react';

export const EnvironmentContext = createContext();

export const EnvironmentProvider = ({ children }) => {

    return (
        <EnvironmentContext.Provider value={{
            restApiLocation: process.env.REACT_APP_REST_API_HOSTNAME + ":" + process.env.REACT_APP_REST_API_PORT,
            primaryColor: process.env.REACT_APP_PRIMARY_COLOR,
            appbarLogo: process.env.REACT_APP_APPBAR_LOGO,
            loginLogo: process.env.REACT_APP_LOGIN_LOGO,
            brandingName: process.env.REACT_APP_BRANDING_NAME
        }}>
            {children}
        </EnvironmentContext.Provider>
    )
}

export const useEnvironment = () => useContext(EnvironmentContext);
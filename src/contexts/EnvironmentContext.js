import React, { useEffect, useState, createContext, useContext } from 'react';
import PropTypes from 'prop-types';

export const EnvironmentContext = createContext();

export const EnvironmentProvider = ({ children }) => {
    const [deviceType, setDeviceType] = useState("");

    // detect if mobile device
    useEffect(() => {
        if (
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(
                navigator.userAgent
            )
        ) {
            setDeviceType("Mobile");
        } else {
            setDeviceType("Desktop");
        }
    }, []);

    return (
        <EnvironmentContext.Provider value={{
            deviceType: deviceType,
            restApiLocation: process.env.REACT_APP_REST_API_URL,
            restApiTimeout: process.env.REACT_APP_REST_API_CONNECTION_TIMEOUT_SECOND,
            primaryColor: process.env.REACT_APP_PRIMARY_COLOR,
            appbarLogo: process.env.REACT_APP_APPBAR_LOGO,
            loginLogo: process.env.REACT_APP_LOGIN_LOGO,
            brandingName: process.env.REACT_APP_BRANDING_NAME,
            filterTimeInMilliseconds: process.env.REACT_APP_FILTER_TIME_IN_MILLISECONDS,

            groupsTitle: "Groups",
            homeTitle: "Home",
            resourcesTitle: "Resources",
            serversTitle: "Servers",
            specificQueriesTitle: "Specific Queries",
            usersTitle: "Users",
            zonesTitle: "Zones",

            pageTitle: "", // placeholder that gets filled on each page
            titleFormat: function () {
                return `${this.pageTitle} - ${this.brandingName}`
            }

        }}>
            {children}
        </EnvironmentContext.Provider>
    )
}

EnvironmentProvider.propTypes = {
    children: PropTypes.node.isRequired
}

export const useEnvironment = () => useContext(EnvironmentContext);
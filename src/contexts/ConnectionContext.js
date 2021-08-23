import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useEnvironment } from './EnvironmentContext';

export const ConnectionContext = createContext({});

export const ConnectionProvider = ({ children }) => {
    const [connection, setConnection] = useState(true);
    const [authConnection, setAuthConnection] = useState();
    const [zoneReportConnection, setZoneReportConnection] = useState();
    const [adminConnection, setAdminConnection] = useState();
    const [queryConnection, setQueryConnection] = useState();
    const [timeStamp, setTimeStamp] = useState();
    const { restApiLocation, restApiTimeout } = useEnvironment();

    const testAuthConnection = () => {
        return axios({
            url: `${restApiLocation}/auth`,
            method: 'POST',
            // set timeout value
            timeout: restApiTimeout * 1000
        }).catch(e => {
            // timeout will result in an undefined error response which will be handled here
            if (!e.response || e.response.status >= 500) {
                setAuthConnection(false);
                setConnection(false);
            }
            else {
                setAuthConnection(true);
            }
        })
    }

    const testZoneReportConnection = () => {
        return axios({
            url: `${restApiLocation}/zone_report`,
            method: 'POST',
            timeout: restApiTimeout * 1000
        }).catch(e => {
            if (!e.response || e.response.status >= 500) {
                setZoneReportConnection(false);
                setConnection(false);
            }
            else {
                setZoneReportConnection(true);
            }
        })
    }

    const testAdminConnection = () => {
        return axios({
            url: `${restApiLocation}/admin`,
            method: 'POST',
            timeout: restApiTimeout * 1000
        }).catch(e => {
            if (!e.response || e.response.status >= 500) {
                setAdminConnection(false);
                setConnection(false);
            } else {
                setAdminConnection(true);
            }

        })
    }

    const testQueryConnection = () => {
        return axios({
            url: `${restApiLocation}/query`,
            method: 'GET',
            timeout: restApiTimeout * 1000
        }).catch(e => {
            if (!e.response || e.response.status >= 500) {
                setQueryConnection(false);
                setConnection(false);
            }
            else {
                setQueryConnection(true);
            }
        })
    }

    // reset connection status and test connection
    const testConnection = async () => {

        // check each endpoint connection, if no response, return false;
        setTimeStamp(new Date().toUTCString())
        setAuthConnection();
        setZoneReportConnection();
        setAdminConnection();
        setQueryConnection();

        // test endpoint connection in order
        await testAdminConnection();
        await testAuthConnection();
        await testQueryConnection();
        await testZoneReportConnection();
    }

    // run connection test on initial load
    useEffect(() => {
        if(timeStamp === undefined) testConnection();
    })

    return (
        <ConnectionContext.Provider value={{
            authConnection, zoneReportConnection, adminConnection, queryConnection, connection, testConnection, timeStamp
        }}>
            { children}
        </ConnectionContext.Provider>
    )
}

ConnectionProvider.propTypes = {
    children: PropTypes.node.isRequired
}

export const useConnection = () => useContext(ConnectionContext);
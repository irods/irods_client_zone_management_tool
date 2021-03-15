import React, { createContext, useContext, useEffect, useState } from 'react';
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
    const environment = useEnvironment();

    // run connection test on initial load
    useEffect(() => {
        testConnection();
    }, [])


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

    const testAuthConnection = () => {
        return axios({
            url: `${environment.restApiLocation}/irods-rest/1.0.0/auth`,
            method: 'POST',
            // set timeout value
            timeout: environment.restApiTimeout * 1000
        }).catch(e => {
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
            url: `${environment.restApiLocation}/irods-rest/1.0.0/zone_report`,
            method: 'POST',
            timeout: environment.restApiTimeout * 1000
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
            url: `${environment.restApiLocation}/irods-rest/1.0.0/admin`,
            method: 'POST',
            timeout: environment.restApiTimeout * 1000
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
            url: `${environment.restApiLocation}/irods-rest/1.0.0/query`,
            method: 'GET',
            timeout: environment.restApiTimeout * 1000
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

    return (
        <ConnectionContext.Provider value={{
            authConnection, zoneReportConnection, adminConnection, queryConnection, connection, testConnection, timeStamp
        }}>
            { children}
        </ConnectionContext.Provider>
    )
}

export const useConnection = () => useContext(ConnectionContext);
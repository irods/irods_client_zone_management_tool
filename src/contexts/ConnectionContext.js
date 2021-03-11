import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useEnvironment } from './EnvironmentContext';

export const ConnectionContext = createContext({});

export const ConnectionProvider = ({ children }) => {
    const [connection, setConnection] = useState();
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
        setTimeout(() => {
            authConnection === undefined ? setAuthConnection(false) : authConnection;
            zoneReportConnection === undefined ? setZoneReportConnection(false) : zoneReportConnection;
            adminConnection === undefined ? setAdminConnection(false) : adminConnection;
            queryConnection === undefined ? setQueryConnection(false) : queryConnection;
            setConnection(false);
        }, environment.restApiTimeout * 1000)
        setTimeStamp(new Date().toString())
        setAuthConnection();
        setZoneReportConnection();
        setAdminConnection();
        setQueryConnection();
        await testAuthConnection();
        await testZoneReportConnection();
        await testAdminConnection();
        await testQueryConnection();
    }

    const testAuthConnection = () => {
        axios({
            url: `${environment.restApiLocation}/irods-rest/1.0.0/auth`,
            method: 'POST',
            params: {
                user_name: 'test',
                password: 'test',
                auth_type: 'native'
            }
        }).catch(e => {
            if (e.response.status >= 500) {
                setAuthConnection(false);
                setConnection(false);
            }
            else {
                setAuthConnection(true);
            }
        })
    }

    const testZoneReportConnection = () => {
        axios({
            url: `${environment.restApiLocation}/irods-rest/1.0.0/zone_report`,
            method: 'POST'
        }).catch(e => {
            if (e.response.status >= 500) {
                setZoneReportConnection(false);
                setConnection(false);
            }
            else {
                setZoneReportConnection(true);
            }
        })
    }

    const testAdminConnection = () => {
        axios({
            url: `${environment.restApiLocation}/irods-rest/1.0.0/admin`,
            method: 'POST'
        }).
            then(res => {
                setAdminConnection(true);
            }).catch(e => {
                if (e.response.status >= 500) {
                    setAdminConnection(false);
                    setConnection(false);
                } else {
                    setAdminConnection(true);
                }

            })
    }

    const testQueryConnection = () => {
        axios({
            url: `${environment.restApiLocation}/irods-rest/1.0.0/query`,
            method: 'GET'
        }).catch(e => {
            if (e.response.status >= 500) {
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
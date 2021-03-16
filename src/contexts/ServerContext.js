import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useEnvironment } from './EnvironmentContext';

export const ServerContext = createContext();

export const ServerProvider = ({ children }) => {
    console.log("server provider")
    const env = useEnvironment();
    const [zoneContext, setZoneContext] = useState();
    const [zoneName, setZoneName] = useState();
    const [userContext, setUserContext] = useState();
    const [groupContext, setGroupContext] = useState();
    const [rescContext, setRescContext] = useState();

    const loadUser = (offset, limit) => {
        axios({
            method: 'GET',
            url: `${env.restApiLocation}/irods-rest/1.0.0/query`,
            headers: {
                'Authorization': env.auth
            },
            params: {
                query_string: "SELECT USER_NAME WHERE USER_TYPE != 'rodsgroup'",
                query_limit: limit,
                row_offset: offset,
                query_type: 'general'
            }
        }).then((res) => {
            setUserContext(res.data);
        }).catch((e) => {
        });
    }

    const loadGroup = (offset, limit) => {
        axios({
            method: 'GET',
            url: `${env.restApiLocation}/irods-rest/1.0.0/query`,
            headers: {
                'Authorization': env.auth
            },
            params: {
                query_string: "SELECT USER_NAME WHERE USER_TYPE = 'rodsgroup'",
                query_limit: limit,
                row_offset: offset,
                query_type: 'general'
            }
        }).then((res) => {
            setGroupContext(res.data);
        }).catch((e) => {
        });
    }


    const loadResource = () => {
        axios({
            method: 'GET',
            url: `${env.restApiLocation}/irods-rest/1.0.0/query`,
            headers: {
                'Authorization': env.auth
            },
            params: {
                query_string: "SELECT RESC_NAME,RESC_TYPE_NAME,RESC_ZONE_NAME,RESC_VAULT_PATH,RESC_LOC,RESC_INFO, RESC_FREE_SPACE, RESC_COMMENT,RESC_STATUS,RESC_CONTEXT",
                query_limit: 100,
                row_offset: 0,
                query_type: 'general'
            }
        }).then((res) => {
            setRescContext(res.data);
        }).catch((e) => {
        });
    }

    const loadZone = async () => {
        axios({
            method: 'POST',
            url: `${env.restApiLocation}/irods-rest/1.0.0/zone_report`,
            headers: {
                'Accept': 'application/json',
                'Authorization': env.auth
            }
        }).then((res) => {
            setZoneContext(res.data.zones);
        }).catch((e) => {
        });

        axios({
            method: 'GET',
            url: `${env.restApiLocation}/irods-rest/1.0.0/query`,
            headers: {
                'Authorization': env.auth
            },
            params: {
                query_string: 'SELECT ZONE_NAME',
                query_limit: 100,
                row_offset: 0,
                query_type: 'general'
            }
        }).then((res) => {
            setZoneName(res.data._embedded[0]);
        });
    }

    // reload zone, user, group, resource on page refresh

    useEffect(() => {
        if (env.auth != null) {
            console.log("Server Context Loading...")
            loadZone();
            loadUser(0, 100);
            loadGroup(0,100);
            loadResource();
            
        }
    }, [])

    return (
        <ServerContext.Provider value={{
            zoneContext, zoneName, loadZone, 
            userContext, loadUser, 
            groupContext, loadGroup, 
            rescContext, loadResource,
        }}>
            { children}
        </ServerContext.Provider>
    )
}

export const useServer = () => useContext(ServerContext);
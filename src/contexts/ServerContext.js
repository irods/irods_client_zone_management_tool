import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useEnvironment } from './EnvironmentContext';

import Cookies from 'js-cookie';

export const ServerContext = createContext();

export const ServerProvider = ({ children }) => {
    console.log("Server Provider Visited...");
    const env = useEnvironment();
    let token = Cookies.get('token');
    const [zoneContext, setZoneContext] = useState(JSON.parse(localStorage.getItem('zoneContext')));
    const [zoneName, setZoneName] = useState();
    const [userContext, setUserContext] = useState(JSON.parse(localStorage.getItem('userContext')));
    const [groupContext, setGroupContext] = useState(JSON.parse(localStorage.getItem('groupContext')));
    const [rescContext, setRescContext] = useState(JSON.parse(localStorage.getItem('rescContext')));

    useEffect(() => {
        token = Cookies.get('token')
        console.log("ServerContext useEffect Visited...")
        if (token != null) {
            console.log("Loading All Server Data...")
            updateZone();
            updateUser();
            updateGroup();
            updateResource();
        }
    }, [])

    const updateZone = async () => {
        console.log("Zone Update in progress...")
        const zoneReportResult = await axios({
            method: 'POST',
            url: `${env.restApiLocation}/irods-rest/1.0.0/zone_report`,
            headers: {
                'Accept': 'application/json',
                'Authorization': Cookies.get('token')
            }
        }).then(res => {
            setZoneContext(res.data.zones);
            localStorage.setItem('zoneContext', JSON.stringify(res.data.zones));
        }).catch(e => {
            console.log(e);
        });

        const zoneNameResult = axios({
            method: 'GET',
            url: `${env.restApiLocation}/irods-rest/1.0.0/query`,
            headers: {
                'Authorization': Cookies.get('token')
            },
            params: {
                query_string: 'SELECT ZONE_NAME',
                query_limit: 100,
                row_offset: 0,
                query_type: 'general'
            }
        }).then(res => {
            setZoneName(res.data._embedded[0]);
            localStorage.setItem('zoneName', res.data._embedded[0]);
        });
    }

    const updateUser = () => {
        console.log("User Update in progress...")
        axios({
            method: 'GET',
            url: `${env.restApiLocation}/irods-rest/1.0.0/query`,
            headers: {
                'Authorization': Cookies.get('token')
            },
            params: {
                query_string: "SELECT USER_NAME, USER_TYPE WHERE USER_TYPE = 'rodsuser'",
                query_limit: 100,
                row_offset: 0,
                query_type: 'general'
            }
        }).then(res => {
            setUserContext(res.data);
            localStorage.setItem('userContext', JSON.stringify(res.data));
        }).catch(e => {
            console.log(e);
        });
    }

    const updateGroup = () => {
        console.log("Group Update in progress...")
        axios({
            method: 'GET',
            url: `${env.restApiLocation}/irods-rest/1.0.0/query`,
            headers: {
                'Authorization': Cookies.get('token')
            },
            params: {
                query_string: "SELECT USER_NAME WHERE USER_TYPE = 'rodsgroup'",
                query_limit: 100,
                row_offset: 0,
                query_type: 'general'
            }
        }).then(res => {
            setGroupContext(res.data);
            localStorage.setItem('groupContext', JSON.stringify(res.data));
        }).catch(e => {
            console.log(e);
        });
    }

    const updateResource = () => {
        console.log("Resource Update in progress...")
        axios({
            method: 'GET',
            url: `${env.restApiLocation}/irods-rest/1.0.0/query`,
            headers: {
                'Authorization': Cookies.get('token')
            },
            params: {
                query_string: "SELECT RESC_NAME,RESC_TYPE_NAME,RESC_ZONE_NAME,RESC_VAULT_PATH,RESC_LOC,RESC_INFO, RESC_FREE_SPACE, RESC_COMMENT,RESC_STATUS,RESC_CONTEXT",
                query_limit: 100,
                row_offset: 0,
                query_type: 'general'
            }
        }).then(res => {
            setRescContext(res.data);
            localStorage.setItem('rescContext', JSON.stringify(res.data));
        }).catch(e => {
            console.log(e);
        });
    }


    // const userContent = axios({
    //     method: 'GET',
    //     url: 'http://54.210.60.122:80/irods-rest/1.0.0/query',
    //     headers: {
    //         'Authorization': token
    //     },
    //     params: {
    //         query_string: "SELECT USER_NAME WHERE USER_TYPE = 'rodsuser'",
    //         query_limit: 100,
    //         row_offset: 0,
    //         query_type: 'general'
    //     }
    // }).catch(e => {
    //     console.log(e);
    // })

    // const groupContent = axios({
    //     method: 'GET',
    //     url: 'http://54.210.60.122:80/irods-rest/1.0.0/query',
    //     headers: {
    //         'Authorization': token
    //     },
    //     params: {
    //         query_string: "SELECT USER_NAME WHERE USER_TYPE = 'rodsgroup'",
    //         query_limit: 100,
    //         row_offset: 0,
    //         query_type: 'general'
    //     }
    // }).catch(e => {
    //     console.log(e);
    // })

    // const resourceContent = axios({
    //     method: 'GET',
    //     url: 'http://54.210.60.122:80/irods-rest/1.0.0/query',
    //     headers: {
    //         'Authorization': token
    //     },
    //     params: {
    //         query_string: "SELECT RESC_NAME",
    //         query_limit: 100,
    //         row_offset: 0,
    //         query_type: 'general'
    //     }
    // }).catch(e => {
    //     console.log(e);
    // });

    return (
        <ServerContext.Provider value={{ zoneContext, zoneName, updateZone, userContext, updateUser, groupContext, updateGroup, rescContext, updateResource }}>
            { children}
        </ServerContext.Provider>
    )
}

export const useServer = () => useContext(ServerContext);
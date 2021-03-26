import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useEnvironment } from './EnvironmentContext';

export const ServerContext = createContext();

const initialState = {
    _embedded: [],
    count: 0,
    total: 0
}

const queryGenerator = (_query, order, orderBy) => {
    const orderSyntax = order === 'desc' ? 'order_desc' : 'order';
    return _query.replace(orderBy, orderSyntax + '(' + orderBy + ')');
}

export const ServerProvider = ({ children }) => {
    const env = useEnvironment();
    const [zoneContext, setZoneContext] = useState();
    const [zoneName, setZoneName] = useState();
    const [userContext, setUserContext] = useState(initialState);
    const [groupContext, setGroupContext] = useState(initialState);
    const [rescContext, setRescContext] = useState(initialState);

    const loadUser = (offset, limit, name, order, orderBy) => {
        let _query = `SELECT USER_NAME, USER_TYPE WHERE USER_TYPE != 'rodsgroup'`;
        if (name !== '') {
            _query = `SELECT USER_NAME, USER_TYPE WHERE USER_TYPE != 'rodsgroup' and USER_NAME LIKE '%${name}%'`
        }
        _query = queryGenerator(_query, order, orderBy);
        return axios({
            method: 'GET',
            url: `${env.restApiLocation}/irods-rest/1.0.0/query`,
            headers: {
                'Authorization': env.auth
            },
            params: {
                query_string: _query,
                query_limit: limit,
                row_offset: offset,
                query_type: 'general'
            }
        }).then((res) => {
            setUserContext(res.data);
        }).catch((e) => {
        });
    }

    const loadGroup = async (offset, limit, name, order, orderBy) => {
        let _query = `SELECT USER_NAME WHERE USER_TYPE = 'rodsgroup'`;
        if (name !== '') {
            _query = `SELECT USER_NAME WHERE USER_TYPE = 'rodsgroup' and USER_NAME LIKE '%${name}%'`
        }
        _query = queryGenerator(_query, order, orderBy);
        const groupResult = await axios({
            method: 'GET',
            url: `${env.restApiLocation}/irods-rest/1.0.0/query`,
            headers: {
                'Authorization': env.auth
            },
            params: {
                query_string: _query,
                query_limit: limit,
                row_offset: offset,
                query_type: 'general'
            }
        }).catch((e) => {
        });
        let inputArray = groupResult.data;
        for (let i = 0; i < inputArray._embedded.length; i++) {
            let thisGroupName = inputArray._embedded[i][0];
            await axios({
                method: 'GET',
                url: `${env.restApiLocation}/irods-rest/1.0.0/query`,
                headers: {
                    'Authorization': env.auth
                },
                params: {
                    query_string: `SELECT USER_NAME, USER_TYPE, USER_ZONE WHERE USER_GROUP_NAME = '${thisGroupName}' AND USER_TYPE != 'rodsgroup'`,
                    query_limit: 100,
                    row_offset: 0,
                    query_type: 'general'
                }
            }).then((res) => {
                inputArray._embedded[i].push(res.data._embedded.length);
                if (i === inputArray._embedded.length - 1) {
                    setGroupContext(inputArray);
                    console.log(inputArray)
                }
            })
        }
    }


    const loadResource = (offset, limit, name, order, orderBy) => {
        let _query = `SELECT RESC_NAME,RESC_TYPE_NAME,RESC_ZONE_NAME,RESC_VAULT_PATH,RESC_LOC,RESC_INFO, RESC_FREE_SPACE, RESC_COMMENT,RESC_STATUS,RESC_CONTEXT`
        if (name != '') {
            _query = `SELECT RESC_NAME,RESC_TYPE_NAME,RESC_ZONE_NAME,RESC_VAULT_PATH,RESC_LOC,RESC_INFO, RESC_FREE_SPACE, RESC_COMMENT,RESC_STATUS,RESC_CONTEXT WHERE RESC_NAME LIKE '%${name}%'`
        }
        _query = queryGenerator(_query, order, orderBy);
        return axios({
            method: 'GET',
            url: `${env.restApiLocation}/irods-rest/1.0.0/query`,
            headers: {
                'Authorization': env.auth
            },
            params: {
                query_string: _query,
                query_limit: limit,
                row_offset: offset,
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
            setZoneName(res.data._embedded[0][0]);
        });
    }

    const loadData = () => {
        loadZone();
        loadUser(0, 10, '', 'asc', 'USER_NAME');
        loadGroup(0, 10, '', 'asc', 'USER_NAME');
        loadResource(0, 10, '', 'asc', 'RESC_NAME');
    }

    // reload zone, user, group, resource on page refresh

    useEffect(() => {
        if (env.auth != null) {
            loadData()
        }
    }, [])

    return (
        <ServerContext.Provider value={{
            zoneContext, zoneName, loadZone,
            userContext, loadUser,
            groupContext, loadGroup,
            rescContext, loadResource,
            loadData
        }}>
            { children}
        </ServerContext.Provider>
    )
}

export const useServer = () => useContext(ServerContext);
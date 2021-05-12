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
    const { restApiLocation } = useEnvironment();
    const [zoneContext, setZoneContext] = useState();
    const [zoneName, setZoneName] = useState();
    const [userContext, setUserContext] = useState(initialState);
    const [groupContext, setGroupContext] = useState(initialState);
    const [rescContext, setRescContext] = useState(initialState);
    const [filteredServers, setFilteredServers] = useState([]);

    const loadUser = (offset, limit, name, order, orderBy) => {
        let _query = `SELECT USER_NAME, USER_TYPE WHERE USER_TYPE != 'rodsgroup'`;
        if (name !== '') {
            _query = `SELECT USER_NAME, USER_TYPE WHERE USER_TYPE != 'rodsgroup' and USER_NAME LIKE '%${name}%'`
        }
        _query = queryGenerator(_query, order, orderBy);
        return axios({
            method: 'GET',
            url: `${restApiLocation}/query`,
            headers: {
                'Authorization': localStorage.getItem('zmt-token')
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
            url: `${restApiLocation}/query`,
            headers: {
                'Authorization': localStorage.getItem('zmt-token')
            },
            params: {
                query_string: _query,
                query_limit: limit,
                row_offset: offset,
                query_type: 'general'
            }
        }).catch((e) => {
        });

        // iterate through group result to retrieve user counts
        let inputArray = groupResult.data;
        for (let i = 0; i < inputArray._embedded.length; i++) {
            let thisGroupName = inputArray._embedded[i][0];
            await axios({
                method: 'GET',
                url: `${restApiLocation}/query`,
                headers: {
                    'Authorization': localStorage.getItem('zmt-token')
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
                }
            })
        }
    }


    const loadResource = (offset, limit, name, order, orderBy) => {
        let _query = `SELECT RESC_NAME,RESC_TYPE_NAME,RESC_ZONE_NAME,RESC_VAULT_PATH,RESC_LOC,RESC_INFO, RESC_FREE_SPACE, RESC_COMMENT,RESC_STATUS,RESC_CONTEXT,RESC_PARENT,RESC_ID WHERE RESC_NAME != 'bundleResc'`
        if (name !== '') {
            _query = `SELECT RESC_NAME,RESC_TYPE_NAME,RESC_ZONE_NAME,RESC_VAULT_PATH,RESC_LOC,RESC_INFO, RESC_FREE_SPACE, RESC_COMMENT,RESC_STATUS,RESC_CONTEXT,RESC_PARENT,RESC_ID WHERE RESC_NAME != 'bundleResc' AND RESC_NAME LIKE '%${name}%'`
        }
        _query = queryGenerator(_query, order, orderBy);
        return axios({
            method: 'GET',
            url: `${restApiLocation}/query`,
            headers: {
                'Authorization': localStorage.getItem('zmt-token')
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

    const loadZoneName = () => {
        return axios({
            method: 'GET',
            url: `${restApiLocation}/query`,
            headers: {
                'Authorization': localStorage.getItem('zmt-token')
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

    const loadZoneReport = () => {
        return axios({
            method: 'POST',
            url: `${restApiLocation}/zone_report`,
            headers: {
                'Accept': 'application/json',
                'Authorization': localStorage.getItem('zmt-token')
            }
        })
    }

    // to query all resources that live on a specific hostname
    const fetchServerResources = (server_hostname) => {
        return axios({
            method: 'GET',
            url: `${restApiLocation}/query`,
            headers: {
                'Authorization': localStorage.getItem('zmt-token')
            },
            params: {
                query_string: `SELECT RESC_NAME WHERE RESC_LOC = '${server_hostname}'`,
                query_limit: 100,
                row_offset: 0,
                query_type: 'general'
            }
        })
    }

    // load all servers at each render, and iterate through server list to fetch resources which have the same hostname
    const loadServers = async () => {
        let zone_report = await loadZoneReport();
        let catalog_service_provider = [zone_report.data.zones[0]['icat_server']];
        let fullServersArray = catalog_service_provider.concat(zone_report.data.zones[0]['servers']);
        for (let curr_server of fullServersArray) {
            let resource_counts = await fetchServerResources(curr_server['host_system_information']['hostname']);
            curr_server["resources"] = resource_counts.data.total;
        }
        setZoneContext(fullServersArray)
        setFilteredServers(fullServersArray.slice(0, 10));
    }

    // handle servers page pagination and sorting
    const loadCurrServer = async (offset, perPage, order, orderBy) => {
        if (zoneContext !== undefined) {
            let tem_servers = zoneContext;
            let orderSyntax = order === 'asc' ? 1 : -1;

            const server_sort_comparator = (a, b) => {
                switch (orderBy) {
                    case 'hostname':
                        return orderSyntax * (a['host_system_information']['hostname']).localeCompare(b['host_system_information']['hostname']);
                    case 'role':
                        return orderSyntax * (a['server_config']['catalog_service_role'].localeCompare(b['server_config']['catalog_service_role']))
                    case 'os':
                        return orderSyntax * ((a['host_system_information']['os_distribution_name'] + a['host_system_information']['os_distribution_version']).localeCompare((b['host_system_information']['os_distribution_name'] + b['host_system_information']['os_distribution_version'])))
                    case 'resources':
                        return orderSyntax * (a['resources'] - b['resources'])
                    default:
                        return orderSyntax * (a['server_config']['catalog_service_role'].localeCompare(b['server_config']['catalog_service_role']));
                }
            }
            tem_servers.sort(server_sort_comparator);
            tem_servers = tem_servers.slice(offset, offset + perPage);
            setFilteredServers(tem_servers);
        }
    }

    const loadData = () => {
        loadZoneName();
        loadServers();
        loadUser(0, 10, '', 'asc', 'USER_NAME');
        loadGroup(0, 10, '', 'asc', 'USER_NAME');
        loadResource(0, 10, '', 'asc', 'RESC_NAME');
    }

     // load all zone data at each render if user is logged in
    useEffect(() => {
        if (localStorage.getItem('zmt-token') !== null) {
            loadData()
        }
    }, [])

    return (
        <ServerContext.Provider value={{
            zoneContext, zoneName, loadZoneName, loadZoneReport, filteredServers, loadCurrServer,
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
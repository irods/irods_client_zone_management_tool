import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useEnvironment } from './';

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
    const [zoneContext, setZoneContext] = useState([]);
    const [zoneName, setZoneName] = useState();
    const [isLoadingZoneContext, setIsLoadingZoneContext] = useState(false);
    const [userContext, setUserContext] = useState(initialState);
    const [userTotal, setUserTotal] = useState(0);
    const [isLoadingUserContext, setIsLoadingUserContext] = useState(false);
    const [groupContext, setGroupContext] = useState(initialState);
    const [groupUserContext, setGroupUserContext] = useState(new Map());
    const [groupTotal, setGroupTotal] = useState(0);
    const [isLoadingGroupContext, setIsLoadingGroupContext] = useState(false);
    const [rescContext, setRescContext] = useState(initialState);
    const [rescTypes, setRescTypes] = useState([]);
    const [rescAll, setRescAll] = useState([])
    const [rescTotal, setRescTotal] = useState(0);
    const [isLoadingRescContext, setIsLoadingRescContext] = useState(false);
    const [rescPanelStatus, setRescPanelStatus] = useState('idle');
    const [filteredServers, setFilteredServers] = useState();
    const [serverVersions, setServerVersions] = useState([])
    const [validServerHosts, setValidServerHosts] = useState(new Set(['EMPTY_RESC_HOST']))

    const loadUser = (offset, limit, name, order, orderBy) => {
        setIsLoadingUserContext(true);
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
            if (name === '') setUserTotal(res.data.total)
            setIsLoadingUserContext(false);
        }).catch(() => {
            setUserContext(undefined);
            setIsLoadingUserContext(false);
        });
    }

    // iterate through group results and load user counts
    const loadGroupUserCounts = async (inputArray, offset, limit, order, orderBy) => {
        // a map is used here to store the user counts we already know
        let userCountMap = new Map(groupUserContext);
        for (let i = 0; i < inputArray._embedded.length; i++) {
            let thisGroupName = inputArray._embedded[i][0];
            // check if the map already have the user data, if yes - get the data and add it to the array, or we need to make api calls to know the number
            if (userCountMap.has(thisGroupName)) inputArray._embedded[i].push(userCountMap.get(thisGroupName))
            else await axios({
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
                // add the number to the map so we don't need to ask again
                userCountMap.set(thisGroupName, res.data._embedded.length)
            }).catch(() => setIsLoadingGroupContext(false)
            )
        }
        // sort by user count and handle pagination
        if (orderBy === 'USER_COUNT') {
            inputArray._embedded = inputArray._embedded.sort((a, b) => (order === 'asc' ? 1 : -1) * (a[1] - b[1])).slice(offset, offset + limit)
        }
        setGroupContext(inputArray)
        setGroupUserContext(userCountMap)
        setIsLoadingGroupContext(false)
    }

    const loadGroup = async (offset, limit, name, order, orderBy) => {
        setIsLoadingGroupContext(true);
        let _query = `SELECT USER_NAME WHERE USER_TYPE = 'rodsgroup'`;
        if (name !== '') {
            _query = `SELECT USER_NAME WHERE USER_TYPE = 'rodsgroup' and USER_NAME LIKE '%${name}%'`
        }
        _query = queryGenerator(_query, order, orderBy);
        await axios({
            method: 'GET',
            url: `${restApiLocation}/query`,
            headers: {
                'Authorization': localStorage.getItem('zmt-token')
            },
            params: {
                query_string: _query,
                query_limit: orderBy === 'USER_COUNT' ? 0 : limit,
                row_offset: orderBy === 'USER_COUNT' ? 0 : offset,
                query_type: 'general'
            }
        }).then((res) => {
            if (name === '') setGroupTotal(res.data.total)
            loadGroupUserCounts(res.data, offset, limit, order, orderBy);
        }).catch(() => {
            setGroupContext(undefined)
            setIsLoadingGroupContext(false);
        });

    }

    // sort and remove duplicate resources
    const resourceSortRemoveDuplicatesHelper = (rescArray, offset, limit, order, orderBy) => {
        let filteredRescContext = {
            _embedded: rescArray,
            total: 0
        };
        let uniqueResc = new Set();
        let filteredResc = [];
        for (let i = 0; i < rescArray.length; i++) {
            if (!uniqueResc.has(rescArray[i][11])) {
                uniqueResc.add(rescArray[i][11]);
                filteredResc.push(rescArray[i]);
            }
        }
        let orderSyntax = order === 'asc' ? 1 : -1;
        const resourceComparator = (a, b) => {
            switch (orderBy) {
                case 'RESC_TYPE_NAME':
                    return orderSyntax * (a[1].localeCompare(b[1]))
                case 'RESC_LOC':
                    return orderSyntax * (a[4].localeCompare(b[4]))
                case 'RESC_VAULT_PATH':
                    return orderSyntax * (a[3].localeCompare(b[3]))
                default:
                    return orderSyntax * (a[0].localeCompare(b[0]))
            }
        }
        filteredResc.sort(resourceComparator);
        // slice the array to get pagination working
        filteredRescContext._embedded = filteredResc.slice(offset, offset + limit);
        filteredRescContext.total = filteredResc.length;
        setRescContext(filteredRescContext);
    }

    const loadResource = useCallback(async (offset, limit, name, order, orderBy) => {
        setIsLoadingRescContext(true);
        let base_query = `SELECT RESC_NAME,RESC_TYPE_NAME,RESC_ZONE_NAME,RESC_VAULT_PATH,RESC_LOC,RESC_INFO, RESC_FREE_SPACE, RESC_COMMENT,RESC_STATUS,RESC_CONTEXT,RESC_PARENT,RESC_ID,RESC_PARENT_CONTEXT WHERE RESC_NAME != 'bundleResc'`
        if (name === '') {
            let _query = queryGenerator(base_query, order, orderBy);
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
                setRescTotal(res.data.total)
                if (res.data.count === res.data.total) setRescAll(res.data)
                setIsLoadingRescContext(false);
            }).catch(() => {
                setRescContext(undefined)
                setIsLoadingRescContext(false);
            });
        }
        else {
            let filteredResults = {};
            await axios({
                method: 'GET',
                url: `${restApiLocation}/query`,
                headers: {
                    'Authorization': localStorage.getItem('zmt-token')
                },
                params: {
                    query_string: base_query + ` AND RESC_NAME LIKE '%${name}%'`,
                    query_limit: 500,
                    row_offset: 0,
                    query_type: 'general'
                }
            }).then((res) => {
                filteredResults = res.data;
            }).catch(() => {
                setRescContext(undefined)
                setIsLoadingRescContext(false);
            });
            await axios({
                method: 'GET',
                url: `${restApiLocation}/query`,
                headers: {
                    'Authorization': localStorage.getItem('zmt-token')
                },
                params: {
                    query_string: base_query + ` AND RESC_LOC LIKE '%${name}%'`,
                    query_limit: 500,
                    row_offset: 0,
                    query_type: 'general'
                }
            }).then((res) => {
                resourceSortRemoveDuplicatesHelper([...filteredResults._embedded, ...res.data._embedded], offset, limit, order, orderBy);
                setIsLoadingRescContext(false);
            }).catch(() => {
                setRescContext(undefined)
                setIsLoadingRescContext(false);
            });
        }
    }, [restApiLocation])

    const updatingRescPanelStatus = (text) => {
        setRescPanelStatus(text);
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
            },
        }).catch(() => {
            setZoneContext(undefined)
            setIsLoadingZoneContext(false)
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
        setIsLoadingZoneContext(true);
        let zone_report = await loadZoneReport();
        if (zone_report !== undefined) {
            let resc_types = new Set();
            let catalog_service_provider = [zone_report.data.zones[0]['icat_server']];
            let fullServersArray = catalog_service_provider.concat(zone_report.data.zones[0]['servers']);
            let newValidHostSet = new Set(['EMPTY_RESC_HOST'])
            for (let curr_server of fullServersArray) {
                // check and load resource plugins from zone report
                if (curr_server.plugins) {
                    for (let i = 0; i < curr_server.plugins.length; i++) {
                        if (curr_server.plugins[i].type === 'resource' && !resc_types.has(curr_server.plugins[i].name)) {
                            resc_types.add(curr_server.plugins[i].name)
                        }
                    }
                }
                newValidHostSet.add(curr_server['host_system_information']['hostname'])
                let resource_counts = await fetchServerResources(curr_server['host_system_information']['hostname'])
                if (resource_counts === undefined) curr_server["resources"] = 0;
                else curr_server["resources"] = resource_counts.data.total;
            }
            setValidServerHosts(newValidHostSet)
            setServerVersions(fullServersArray.reduce((prev, curr) => {
                prev.push(curr['version']['irods_version'])
                return prev
            }, []).sort(irodsVersionComparator))
            setRescTypes([...resc_types].sort())
            setZoneContext(fullServersArray)
            setFilteredServers(fullServersArray.slice(0, 10));
            setIsLoadingZoneContext(false);
        }
    }

    // designed to compare different irods version (e.g. 4.2.10 > 4.2.8)
    const irodsVersionComparator = (a, b) => {
        let aa = a.split('.').map(Number);
        let bb = b.split('.').map(Number);
        let r = 0;
        let l = Math.max(aa.length, bb.length)
        for (let i = 0; !r && i < l; i++) {
            r = (aa[i] || 0) - (bb[i] || 0)
        }
        return r;
    }

    // handle servers page pagination and sorting
    const loadCurrServer = async (offset, perPage, order, orderBy) => {
        if (zoneContext !== undefined && zoneContext.length !== 0) {
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
                    case 'irods-version':
                        return orderSyntax * irodsVersionComparator(a['version']['irods_version'], b['version']['irods_version'])
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
        loadResource(0, 0, '', 'asc', 'RESC_NAME');
    }

    // load all zone data at each render if user is logged in
    useEffect(() => {
        if (zoneName === undefined && localStorage.getItem('zmt-token') !== null) {
            loadData()
        }
    }, [])

    return (
        <ServerContext.Provider value={{
            zoneContext, zoneName, loadZoneName, loadZoneReport, filteredServers, loadCurrServer,
            userTotal, userContext, loadUser,
            groupTotal, groupContext, loadGroup,
            rescTotal, rescAll, rescContext, rescTypes, rescPanelStatus, updatingRescPanelStatus, loadResource,
            isLoadingGroupContext, isLoadingRescContext, isLoadingUserContext, isLoadingZoneContext,
            serverVersions, validServerHosts, irodsVersionComparator,
            loadData
        }}>
            {children}
        </ServerContext.Provider>
    )
}

ServerProvider.propTypes = {
    children: PropTypes.node.isRequired
}

export const useServer = () => useContext(ServerContext);
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useEnvironment } from './';
import { irodsVersionComparator } from '../utils';

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
    const [localZoneName, setLocalZoneName] = useState()
    const [zones, setZones] = useState()
    const [isLoadingZones, setIsLoadingZones] = useState(false)
    const [isLoadingZoneContext, setIsLoadingZoneContext] = useState(false);
    const [userContext, setUserContext] = useState(initialState);
    const [userTotal, setUserTotal] = useState(0);
    const [isLoadingUserContext, setIsLoadingUserContext] = useState(false);
    const [ticketContext, setTicketContext] = useState(initialState);
    const [ticketTotal, setTicketTotal] = useState(0);
    const [isLoadingTicketContext, setIsLoadingTicketContext] = useState(false);
    const [groupContext, setGroupContext] = useState(initialState);
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
    const [isLoadingSpecificQueryContext, setIsLoadingSpecificQueryContext] = useState(false)
    const [specificQueryContext, setSpecificQueryContext] = useState(initialState)
    const [specificQueryTotal, setSpecificQueryTotal] = useState(0)

    const loadUsers = (offset, limit, name, order, orderBy) => {
        setIsLoadingUserContext(true);
        let _query = `SELECT USER_NAME, USER_TYPE, USER_ZONE WHERE USER_TYPE != 'RODSGROUP'`;
        if (name !== '') {
            _query = `SELECT USER_NAME, USER_TYPE, USER_ZONE WHERE USER_TYPE != 'RODSGROUP' and USER_NAME LIKE '%${name.toUpperCase()}%'`
        }
        _query = queryGenerator(_query, order, orderBy);
        return axios({
            method: 'GET',
            url: `${restApiLocation}/query`,
            headers: {
                'Authorization': localStorage.getItem('zmt-token')
            },
            params: {
                query: _query,
                limit: limit,
                offset: offset,
                type: 'general',
                'case-sensitive': 0
            }
        }).then((res) => {
            if (name === '') setUserTotal(res.data.total)
            setUserContext(res.data);
            setIsLoadingUserContext(false);
        }).catch(() => {
            setUserContext(undefined);
            setIsLoadingUserContext(false);
        });
    }

    const loadTickets = (offset, limit, order, orderBy) => {
        setIsLoadingTicketContext(true);
        let _query = "SELECT TICKET_ID, TICKET_STRING, TICKET_TYPE, TICKET_USER_ID, TICKET_OBJECT_ID, TICKET_OBJECT_TYPE, TICKET_USES_LIMIT, TICKET_USES_COUNT, TICKET_WRITE_FILE_COUNT, TICKET_WRITE_FILE_LIMIT, TICKET_WRITE_BYTE_COUNT, TICKET_WRITE_BYTE_LIMIT, TICKET_EXPIRY, TICKET_CREATE_TIME, TICKET_MODIFY_TIME, TICKET_DATA_NAME, TICKET_DATA_COLL_NAME, TICKET_OWNER_NAME, TICKET_OWNER_ZONE"

        _query = queryGenerator(_query, order, orderBy);
        return axios({
            method: 'GET',
            url: `${restApiLocation}/query`,
            headers: {
                'Authorization': localStorage.getItem('zmt-token')
            },
            params: {
                query: _query,
                limit: limit,
                offset: offset,
                type: 'general',
                'case-sensitive': 0
            }
        }).then((res) => {
            setTicketTotal(res.data.total)
            setTicketContext(res.data);
            setIsLoadingTicketContext(false);
        }).catch(() => {
            setTicketContext(undefined);
            setIsLoadingTicketContext(false);
        });


    }

    // iterate through group results and load user counts
    const loadGroupUserCounts = async (inputArray, offset, limit, order, orderBy) => {
        let groupUserCountPromises = inputArray._embedded.map(group => axios({
            method: 'GET',
            url: `${restApiLocation}/query`,
            headers: {
                'Authorization': localStorage.getItem('zmt-token')
            },
            params: {
                query: `SELECT USER_NAME WHERE USER_GROUP_NAME = '${group[0]}' AND USER_TYPE != 'rodsgroup'`,
                limit: 100,
                offset: 0,
                type: 'general'
            }
        }))

        // wait until all promises are resolved so we can get all user counts
        await Promise.all(groupUserCountPromises).then(resolvedPromises => {
            resolvedPromises.forEach((resolvedPromise, index) => {
                inputArray._embedded[index].push(resolvedPromise.data.total);
            })
        }).catch(() => {
            setGroupContext(undefined)
            setIsLoadingGroupContext(false)
        })

        if (orderBy === 'USER_COUNT') {
            inputArray._embedded = inputArray._embedded.sort((a, b) => (order === 'asc' ? 1 : -1) * (a[1] - b[1])).slice(offset, offset + limit)
        }
        setGroupContext(inputArray)
        setIsLoadingGroupContext(false)
    }

    const loadGroups = async (offset, limit, name, order, orderBy) => {
        setIsLoadingGroupContext(true);
        let _query = `SELECT USER_NAME WHERE USER_TYPE = 'RODSGROUP'`;
        if (name !== '') {
            _query = `SELECT USER_NAME WHERE USER_TYPE = 'RODSGROUP' and USER_NAME LIKE '%${name.toUpperCase()}%'`
        }
        _query = queryGenerator(_query, order, orderBy);
        await axios({
            method: 'GET',
            url: `${restApiLocation}/query`,
            headers: {
                'Authorization': localStorage.getItem('zmt-token')
            },
            params: {
                query: _query,
                limit: orderBy === 'USER_COUNT' ? 0 : limit,
                offset: orderBy === 'USER_COUNT' ? 0 : offset,
                type: 'general',
                'case-sensitive': 0
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

    const loadResources = useCallback(async (offset, limit, name, order, orderBy) => {
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
                    query: _query,
                    limit: limit,
                    offset: offset,
                    type: 'general'
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
                    query: base_query + ` AND RESC_NAME LIKE '%${name.toUpperCase()}%'`,
                    limit: 500,
                    offset: 0,
                    type: 'general',
                    'case-sensitive': 0
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
                    query: base_query + ` AND RESC_LOC LIKE '%${name}%'`,
                    limit: 500,
                    offset: 0,
                    type: 'general'
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

    const loadZones = async () => {
        setIsLoadingZones(true)
        let zonesRes = []
        const zoneData = await axios({
            method: 'GET',
            url: `${restApiLocation}/query`,
            headers: {
                'Authorization': localStorage.getItem('zmt-token')
            },
            params: {
                query: `SELECT ZONE_NAME, order(ZONE_TYPE), ZONE_CONNECTION, ZONE_COMMENT`,
                limit: 0,
                offset: 0,
                type: 'general'
            }
        })
        if (zoneData.status === 200) {
            setLocalZoneName(zoneData.data._embedded.filter(a => a[1] === 'local')[0][0])
            zonesRes = zoneData.data._embedded.map(zone => { return { name: zone[0], type: zone[1], hostname: zone[2] && zone[2].split(':')[0], port: zone[2] && zone[2].split(':')[1], comment: zone[3] } })
        } else {
            // handle error if the request failed
            setZones([])
            setIsLoadingZones(false)
            return
        }
        // make each request for the number of users in each zone
        const zoneUserDataPromises = zoneData.data._embedded.map(zone => {
            return axios({
                method: 'GET',
                url: `${restApiLocation}/query`,
                headers: {
                    'Authorization': localStorage.getItem('zmt-token')
                },
                params: {
                    query: `SELECT USER_NAME WHERE USER_TYPE != 'rodsgroup' AND USER_ZONE = '${zone[0]}'`,
                    limit: 0,
                    offset: 0,
                    type: 'general'
                }
            })
        })
        const zoneUserData = await Promise.all(zoneUserDataPromises)
        zonesRes.forEach((zone, index) => zone.users = zoneUserData[index].data.total)
        setZones(zonesRes)
        setIsLoadingZones(false)
    }

    const loadZoneReport = () => {
        return axios({
            method: 'GET',
            url: `${restApiLocation}/zonereport`,
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
                query: `SELECT RESC_NAME WHERE RESC_LOC = '${server_hostname}'`,
                limit: 100,
                offset: 0,
                type: 'general'
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

    // handle servers page pagination and sorting
    const loadCurrServers = async (offset, perPage, order, orderBy) => {
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

    const loadSpecificQueries = (term) => {
        let _query = 'select alias, sqlStr from R_SPECIFIC_QUERY'
        if (term !== '') {
            _query += ` where alias like '${term}'`
        }
        setIsLoadingSpecificQueryContext(true)
        axios({
            method: 'GET',
            url: `${restApiLocation}/query`,
            headers: {
                'Authorization': localStorage.getItem('zmt-token')
            },
            params: {
                query: _query,
                limit: 100,
                offset: 0,
                type: 'specific',
            }
        }).then(res => {
            setSpecificQueryTotal(res.data.total)
            setSpecificQueryContext(res.data)
            setIsLoadingSpecificQueryContext(false)
        }).catch(() => {
            setSpecificQueryTotal(0)
            setSpecificQueryContext(undefined)
            setIsLoadingSpecificQueryContext(false)
        })
    }


    const loadData = () => {
        !isLoadingZones && loadZones();
        !isLoadingZoneContext && loadServers();
        !isLoadingUserContext && loadUsers(0, 10, '', 'asc', 'USER_NAME');
        !isLoadingGroupContext && loadGroups(0, 10, '', 'asc', 'USER_NAME');
        !isLoadingRescContext && loadResources(0, 0, '', 'asc', 'RESC_NAME');
        !isLoadingSpecificQueryContext && loadSpecificQueries('')
    }

    // load all zone data at each render if user is logged in
    useEffect(() => {
        if (localZoneName === undefined && localStorage.getItem('zmt-token') !== null) {
            loadData()
        }
    }, [])

    return (
        <ServerContext.Provider value={{
            zoneContext, localZoneName, zones, loadZones, loadZoneReport, filteredServers, loadCurrServers,
            userTotal, userContext, loadUsers,
            ticketTotal, ticketContext, loadTickets,
            groupTotal, groupContext, loadGroups,
            rescTotal, rescAll, rescContext, rescTypes, rescPanelStatus, updatingRescPanelStatus, loadResources,
            isLoadingGroupContext, isLoadingRescContext, isLoadingUserContext, isLoadingZoneContext, isLoadingZones, isLoadingTicketContext,
            serverVersions, validServerHosts, irodsVersionComparator,
            specificQueryContext, isLoadingSpecificQueryContext, specificQueryTotal, loadSpecificQueries,
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
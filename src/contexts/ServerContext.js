import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { Navigate } from "react-router";
import { useEnvironment, useAuthHook } from "./";
import { irodsVersionComparator } from "../utils";

export const ServerContext = createContext();

const initialState = {
  rows: [],
  count: 0,
  total: 0,
};

const queryGenerator = (_query, order, orderBy) => {
  const orderSyntax = order === "desc" ? "order_desc" : "order";
  return _query.replace(orderBy, orderSyntax + "(" + orderBy + ")");
};

export const ServerProvider = ({ children }) => {
  const environment = useEnvironment();
  const { auth, logout } = useAuthHook();

  const [zoneContext, setZoneContext] = useState([]);
  const [localZoneName, setLocalZoneName] = useState();
  const [zones, setZones] = useState();
  const [isLoadingZones, setIsLoadingZones] = useState(false);
  const [isLoadingZoneContext, setIsLoadingZoneContext] = useState(false);
  const [userContext, setUserContext] = useState(initialState);
  const [userTotal, setUserTotal] = useState(0);
  const [isLoadingUserContext, setIsLoadingUserContext] = useState(false);
  const [groupContext, setGroupContext] = useState(initialState);
  const [groupTotal, setGroupTotal] = useState(0);
  const [isLoadingGroupContext, setIsLoadingGroupContext] = useState(false);
  const [rescContext, setRescContext] = useState(initialState);
  const [rescTypes, setRescTypes] = useState([]);
  const [rescAll, setRescAll] = useState([]);
  const [rescTotal, setRescTotal] = useState(0);
  const [isLoadingRescContext, setIsLoadingRescContext] = useState(false);
  const [rescPanelStatus, setRescPanelStatus] = useState("idle");
  const [filteredServers, setFilteredServers] = useState();
  const [serverVersions, setServerVersions] = useState([]);
  const [validServerHosts, setValidServerHosts] = useState(
    new Set(["EMPTY_RESC_HOST"]),
  );
  const [isLoadingSpecificQueryContext, setIsLoadingSpecificQueryContext] =
    useState(false);
  const [specificQueryContext, setSpecificQueryContext] =
    useState(initialState);
  const [specificQueryTotal, setSpecificQueryTotal] = useState(0);

  const loadUsers = useCallback(
    async (offset, limit, order, orderBy, name) => {
      setIsLoadingUserContext(true);

      if (!name || name === "USER_NAME") {
        let _query = `SELECT USER_NAME, USER_TYPE, USER_ZONE WHERE USER_TYPE != 'RODSGROUP'`;

        _query = queryGenerator(_query, order, orderBy);

        return axios({
          method: "GET",
          url: `${environment.httpApiLocation}/query`,
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
          params: {
            op: "execute_genquery",
            query: _query,
            count: limit,
            offset: offset,
            "case-sensitive": 0,
          },
        })
          .then((res) => {
            if (name === "") setUserTotal(res.data.rows.length);
            setUserTotal(res.data.rows.length);
            const newUserContext = {
              rows: res.data.rows,
              count: Math.min(25, res.data.rows.length),
              total: res.data.rows.length,
            };
            setUserContext(newUserContext);
            setIsLoadingUserContext(false);
          })
          .catch(() => {
            setUserContext(undefined);
            setIsLoadingUserContext(false);
          });
      } else {
        let totalData = [];

        const queryTry1 = `SELECT USER_NAME, USER_TYPE, USER_ZONE WHERE USER_TYPE != 'rodsgroup' AND USER_NAME LIKE '%${name}%'`;
        const q1 = queryGenerator(queryTry1, order, orderBy);

        const queryTry2 = `SELECT USER_NAME, USER_TYPE, USER_ZONE WHERE USER_TYPE != 'rodsgroup' AND USER_ZONE LIKE '%${name}%'`;
        const q2 = queryGenerator(queryTry2, order, orderBy);

        const queryTry3 = `SELECT USER_NAME, USER_TYPE, USER_ZONE WHERE USER_TYPE != 'rodsgroup' AND USER_TYPE LIKE '%${name}%'`;
        const q3 = queryGenerator(queryTry3, order, orderBy);

        const resp1 = await axios({
          method: "GET",
          url: `${environment.httpApiLocation}/query`,
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
          params: {
            op: "execute_genquery",
            query: q1,
            count: limit,
            offset: offset,
            "case-sensitive": 0,
          },
        });

        const resp2 = await axios({
          method: "GET",
          url: `${environment.httpApiLocation}/query`,
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
          params: {
            op: "execute_genquery",
            query: q2,
            count: limit,
            offset: offset,
            "case-sensitive": 0,
          },
        });

        const resp3 = await axios({
          method: "GET",
          url: `${environment.httpApiLocation}/query`,
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
          params: {
            op: "execute_genquery",
            query: q3,
            count: limit,
            offset: offset,
            "case-sensitive": 0,
          },
        });

        const pushOnlyNewData = (totalData, newArr) => {
          // if totalData already has anything in resp2.data.rows, don't push it again
          // this can happen if two queries return the same data (like `rods` will match both the `rods` username and the `rodsadmin` user type, so both queries will return the same data)
          // there will at most be 100 items in each array, so it won't take too long
          newArr.forEach((item) => {
            let found = false;
            totalData.forEach((item2) => {
              if (item[0] === item2[0]) {
                found = true;
                return;
              }
            });
            if (!found) {
              totalData.push(item);
            }
          });

          return totalData;
        };

        let userTotal = 0;
        if (resp1 && resp1.data.rows.length > 0) {
          totalData.push(...resp1.data.rows);
          userTotal = parseInt(resp1.data.rows.length);
        }
        if (resp2 && resp2.data.rows.length > 0) {
          totalData = pushOnlyNewData(totalData, resp2.data.rows);
          userTotal = parseInt(resp2.data.rows.length);
        }
        if (resp3 && resp3.data.rows.length > 0) {
          totalData = pushOnlyNewData(totalData, resp3.data.rows);
          userTotal = parseInt(resp3.data.rows.length);
        }

        setUserTotal(userTotal);
        setUserContext({
          rows: totalData,
          count: userTotal,
          total: userTotal,
        });
        setIsLoadingUserContext(false);
      }
    },
    [auth.token, environment.httpApiLocation],
  );

  // iterate through group results and load user counts
  const loadGroupUserCounts = useCallback(
    async (inputArray, offset, limit, order, orderBy) => {
      const groupUserCountPromises = inputArray.rows.map((group) =>
        axios({
          method: "GET",
          url: `${environment.httpApiLocation}/query`,
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
          params: {
            op: "execute_genquery",
            query: `SELECT USER_NAME WHERE USER_GROUP_NAME = '${group[0]}' AND USER_TYPE != 'rodsgroup'`,
            count: 100,
          },
        }),
      );

      // wait until all promises are resolved so we can get all user counts
      await Promise.all(groupUserCountPromises)
        .then((resolvedPromises) => {
          resolvedPromises.forEach((resolvedPromise, index) => {
            inputArray.rows[index].push(resolvedPromise.data.rows.length);
          });
        })
        .catch(() => {
          setGroupContext(undefined);
          setIsLoadingGroupContext(false);
        });

      if (orderBy === "USER_COUNT") {
        inputArray.rows = inputArray.rows
          .sort((a, b) => (order === "asc" ? 1 : -1) * (a[1] - b[1]))
          .slice(offset, offset + limit);
      }
      const newGroupContext = {
        rows: inputArray.rows,
        count: inputArray.rows.length,
        total: inputArray.rows.length,
      };
      setGroupContext(newGroupContext);
      setIsLoadingGroupContext(false);
    },
    [auth.token, environment.httpApiLocation],
  );

  const loadGroups = useCallback(
    async (offset, limit, name, order, orderBy) => {
      setIsLoadingGroupContext(true);
      let _query = `SELECT USER_NAME WHERE USER_TYPE = 'RODSGROUP'`;
      if (name !== "") {
        _query = `SELECT USER_NAME WHERE USER_TYPE = 'RODSGROUP' and USER_NAME LIKE '%${name.toUpperCase()}%'`;
      }
      _query = queryGenerator(_query, order, orderBy);
      await axios({
        method: "GET",
        url: `${environment.httpApiLocation}/query`,
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        params: {
          op: "execute_genquery",
          query: _query,
          count: orderBy === "USER_COUNT" ? 0 : limit,
          offset: orderBy === "USER_COUNT" ? 0 : offset,
          "case-sensitive": 0,
        },
      })
        .then((res) => {
          if (name === "") setGroupTotal(res.data.rows.length);
          loadGroupUserCounts(res.data, offset, limit, order, orderBy);
        })
        .catch(() => {
          setGroupContext(undefined);
          setIsLoadingGroupContext(false);
        });
    },
    [auth.token, environment.httpApiLocation, loadGroupUserCounts],
  );

  // sort and remove duplicate resources
  const resourceSortRemoveDuplicatesHelper = (
    rescArray,
    offset,
    limit,
    order,
    orderBy,
  ) => {
    const filteredRescContext = {
      rows: rescArray,
      total: 0,
    };
    const uniqueResc = new Set();
    const filteredResc = [];
    for (let i = 0; i < rescArray.length; i++) {
      if (!uniqueResc.has(rescArray[i][11])) {
        uniqueResc.add(rescArray[i][11]);
        filteredResc.push(rescArray[i]);
      }
    }
    const orderSyntax = order === "asc" ? 1 : -1;
    const resourceComparator = (a, b) => {
      switch (orderBy) {
        case "RESC_TYPE_NAME":
          return orderSyntax * a[1].localeCompare(b[1]);
        case "RESC_LOC":
          return orderSyntax * a[4].localeCompare(b[4]);
        case "RESC_VAULT_PATH":
          return orderSyntax * a[3].localeCompare(b[3]);
        default:
          return orderSyntax * a[0].localeCompare(b[0]);
      }
    };
    filteredResc.sort(resourceComparator);
    // slice the array to get pagination working
    filteredRescContext.rows = filteredResc.slice(offset, offset + limit);
    filteredRescContext.total = filteredResc.length;
    setRescContext(filteredRescContext);
  };

  const loadResources = useCallback(
    async (offset, limit, name, order, orderBy) => {
      setIsLoadingRescContext(true);
      const base_query = `SELECT RESC_NAME,RESC_TYPE_NAME,RESC_ZONE_NAME,RESC_VAULT_PATH,RESC_LOC,RESC_INFO, RESC_FREE_SPACE, RESC_COMMENT,RESC_STATUS,RESC_CONTEXT,RESC_PARENT,RESC_ID,RESC_PARENT_CONTEXT WHERE RESC_NAME != 'bundleResc'`;
      if (name === "") {
        const _query = queryGenerator(base_query, order, orderBy);
        return axios({
          method: "GET",
          url: `${environment.httpApiLocation}/query`,
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
          params: {
            op: "execute_genquery",
            query: _query,
            count: limit,
            offset: offset,
          },
        })
          .then((res) => {
            setRescContext({
              rows: res.data.rows,
              count: res.data.rows.length,
              total: res.data.rows.length,
            });
            setRescTotal(res.data.rows.length);
            // if (res.data.count === res.data.total)
            setRescAll(res.data);
            setIsLoadingRescContext(false);
          })
          .catch(() => {
            setRescContext(undefined);
            setIsLoadingRescContext(false);
          });
      } else {
        let filteredResults = {};
        await axios({
          method: "GET",
          url: `${environment.httpApiLocation}/query`,
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
          params: {
            op: "execute_genquery",
            query: base_query + ` AND RESC_NAME LIKE '%${name.toUpperCase()}%'`,
            count: 500,
            "case-sensitive": 0,
          },
        })
          .then((res) => {
            filteredResults = res.data;
          })
          .catch(() => {
            setRescContext(undefined);
            setIsLoadingRescContext(false);
          });
        await axios({
          method: "GET",
          url: `${environment.httpApiLocation}/query`,
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
          params: {
            op: "execute_genquery",
            query: base_query + ` AND RESC_LOC LIKE '%${name}%'`,
            count: 500,
          },
        })
          .then((res) => {
            resourceSortRemoveDuplicatesHelper(
              [...filteredResults.rows, ...res.data.rows],
              offset,
              limit,
              order,
              orderBy,
            );
            setIsLoadingRescContext(false);
          })
          .catch(() => {
            setRescContext(undefined);
            setIsLoadingRescContext(false);
          });
      }
    },
    [environment.httpApiLocation, auth.token],
  );

  const updatingRescPanelStatus = (text) => {
    setRescPanelStatus(text);
  };

  // First api request sent out when user lands after authentication, check if 502 bad gateway occurs
  // 	- 502 bad gateway => auth token is expired, so remove from local storage and re-login
  const loadZones = useCallback(async () => {
    setIsLoadingZones(true);
    let zonesRes = [];
    const zoneData = await axios({
      method: "GET",
      url: `${environment.httpApiLocation}/query`,
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
      params: {
        op: "execute_genquery",
        query: `SELECT ZONE_NAME, order(ZONE_TYPE), ZONE_CONNECTION, ZONE_COMMENT`,
      },
    }).catch(() => {
      setZones([]);
      setIsLoadingZones(false);
      logout();
      return <Navigate to="/" noThrow />;
    });

    if (zoneData && zoneData.status === 200) {
      setLocalZoneName(
        zoneData.data.rows.filter((a) => a[1] === "local")[0][0],
      );
      zonesRes = zoneData.data.rows.map((zone) => {
        return {
          name: zone[0],
          type: zone[1],
          hostname: zone[2] && zone[2].split(":")[0],
          port: zone[2] && zone[2].split(":")[1],
          comment: zone[3],
        };
      });
    } else {
      // handle error if the request failed
      setZones([]);
      setIsLoadingZones(false);
      return;
    }
    // make each request for the number of users in each zone
    const zoneUserDataPromises = zoneData.data.rows.map((zone) => {
      return axios({
        method: "GET",
        url: `${environment.httpApiLocation}/query`,
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        params: {
          op: "execute_genquery",
          query: `SELECT USER_NAME WHERE USER_TYPE != 'rodsgroup' AND USER_ZONE = '${zone[0]}'`,
        },
      });
    });
    const zoneUserData = await Promise.all(zoneUserDataPromises);
    zonesRes.map((zone, index) => zoneUserData[index].data.rows.length);
    setZones(zonesRes);
    setIsLoadingZones(false);
  }, [auth.token, environment.httpApiLocation, logout]);

  const loadZoneReport = useCallback(() => {
    return axios({
      method: "GET",
      url: `${environment.httpApiLocation}/zones`,
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
      params: {
        op: "report",
      },
    }).catch(() => {
      setZoneContext(undefined);
      setIsLoadingZoneContext(false);
    });
  }, [auth.token, environment.httpApiLocation]);

  // to query all resources that live on a specific hostname
  const fetchServerResources = useCallback(
    (server_hostname) => {
      return axios({
        method: "GET",
        url: `${environment.httpApiLocation}/query`,
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        params: {
          op: "execute_genquery",
          query: `SELECT RESC_NAME WHERE RESC_LOC = '${server_hostname}'`,
          count: 100,
        },
      });
    },
    [auth.token, environment.httpApiLocation],
  );

  // load all servers at each render, and iterate through the server list to fetch resources which have the same hostname
  const loadServers = useCallback(async () => {
    setIsLoadingZoneContext(true);
    const zone_report = await loadZoneReport();

    if (zone_report !== undefined) {
      const resc_types = new Set();
      const version_4_3_1_or_after =
        !zone_report.data.zone_report.zones[0].icat_server;
      let fullServersArray;

      if (version_4_3_1_or_after) {
        fullServersArray = zone_report.data.zone_report.zones[0]["servers"];
      } else {
        // before 4.3.1, icat_server was separately defined in the zonereport
        const catalog_service_provider = [
          zone_report.data.zone_report.zones[0]["icat_server"],
        ];
        fullServersArray = catalog_service_provider.concat(
          zone_report.data.zone_report.zones[0]["servers"],
        );
      }
      const newValidHostSet = new Set(["EMPTY_RESC_HOST"]);
      for (const curr_server of fullServersArray) {
        // check and load resource plugins from the zone report
        if (curr_server.plugins) {
          for (let i = 0; i < curr_server.plugins.length; i++) {
            if (
              curr_server.plugins[i].type === "resource" &&
              !resc_types.has(curr_server.plugins[i].name)
            ) {
              resc_types.add(curr_server.plugins[i].name);
            }
          }
        }
        newValidHostSet.add(curr_server["host_system_information"]["hostname"]);
        const resource_counts = await fetchServerResources(
          curr_server["host_system_information"]["hostname"],
        );
        if (resource_counts === undefined) curr_server["resources"] = 0;
        else curr_server["resources"] = resource_counts.data.rows.length;
      }

      setValidServerHosts(newValidHostSet);
      setServerVersions(
        fullServersArray
          .reduce((prev, curr) => {
            prev.push(curr["version"]["irods_version"]);
            return prev;
          }, [])
          .sort(irodsVersionComparator),
      );
      setRescTypes([...resc_types].sort());
      setZoneContext(fullServersArray);
      if (!localStorage.getItem(environment.serversPageKey)) {
        localStorage.setItem(
          environment.serversPageKey,
          environment.defaultItemsPerPage,
        );
      }
      setFilteredServers(
        fullServersArray.slice(
          0,
          parseInt(localStorage.getItem(environment.serversPageKey), 10),
        ),
      );
      setIsLoadingZoneContext(false);
    }
  }, [
    environment.defaultItemsPerPage,
    environment.serversPageKey,
    fetchServerResources,
    loadZoneReport,
  ]);

  // handle servers page pagination and sorting
  const loadCurrServers = useCallback(
    async (offset, perPage, order, orderBy) => {
      if (zoneContext !== undefined && zoneContext.length !== 0) {
        let tem_servers = zoneContext;
        const orderSyntax = order === "asc" ? 1 : -1;
        const server_sort_comparator = (a, b) => {
          switch (orderBy) {
            case "hostname":
              return (
                orderSyntax *
                a["host_system_information"]["hostname"].localeCompare(
                  b["host_system_information"]["hostname"],
                )
              );
            case "role":
              return (
                orderSyntax *
                a["server_config"]["catalog_service_role"].localeCompare(
                  b["server_config"]["catalog_service_role"],
                )
              );
            case "os":
              return (
                orderSyntax *
                (
                  a["host_system_information"]["os_distribution_name"] +
                  a["host_system_information"]["os_distribution_version"]
                ).localeCompare(
                  b["host_system_information"]["os_distribution_name"] +
                    b["host_system_information"]["os_distribution_version"],
                )
              );
            case "resources":
              return orderSyntax * (a["resources"] - b["resources"]);
            case "irods-version":
              return (
                orderSyntax *
                irodsVersionComparator(
                  a["version"]["irods_version"],
                  b["version"]["irods_version"],
                )
              );
            default:
              return (
                orderSyntax *
                a["server_config"]["catalog_service_role"].localeCompare(
                  b["server_config"]["catalog_service_role"],
                )
              );
          }
        };
        tem_servers.sort(server_sort_comparator);
        tem_servers = tem_servers.slice(offset, offset + perPage);
        setFilteredServers(tem_servers);
      }
    },
    [zoneContext],
  );

  const loadSpecificQueries = useCallback(() => {
    setIsLoadingSpecificQueryContext(true);
    axios({
      method: "GET",
      url: `${environment.httpApiLocation}/query`,
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
      params: {
        op: "execute_specific_query",
        name: "ls",
        count: 100,
      },
    })
      .then((res) => {
        // console.log(res)
        setSpecificQueryTotal(res.data.rows ? res.data.rows.length : 0);
        setSpecificQueryContext(res.data);
        setIsLoadingSpecificQueryContext(false);
      })
      .catch(() => {
        setSpecificQueryTotal(0);
        setSpecificQueryContext(undefined);
        setIsLoadingSpecificQueryContext(false);
      });
  }, [auth.token, environment.httpApiLocation]);

  const loadData = useCallback(() => {
    // not including servers key because we don't need to set default load amount here for it
    const pageKeys = ["groupsPerPageKey", "resourcesPageKey", "usersPageKey"];

    for (const key of pageKeys) {
      if (!localStorage.getItem(environment[key])) {
        localStorage.setItem(environment[key], environment.defaultItemsPerPage);
      }
    }

    const groupsPerPage = parseInt(
      localStorage.getItem(environment[pageKeys[0]]),
      10,
    );
    const rescPerPage = parseInt(
      localStorage.getItem(environment[pageKeys[1]]),
      10,
    );
    const usersPerPage = parseInt(
      localStorage.getItem(environment[pageKeys[2]]),
      10,
    );

    !isLoadingZones && loadZones();
    !isLoadingZoneContext && loadServers();
    !isLoadingGroupContext &&
      loadGroups(0, groupsPerPage, "", "asc", "USER_NAME");
    !isLoadingRescContext &&
      loadResources(0, rescPerPage, "", "asc", "RESC_NAME");
    !isLoadingUserContext && loadUsers(0, usersPerPage, "", "asc", "USER_NAME");
    !isLoadingSpecificQueryContext && loadSpecificQueries();
  }, [
    environment,
    isLoadingGroupContext,
    isLoadingRescContext,
    isLoadingSpecificQueryContext,
    isLoadingUserContext,
    isLoadingZoneContext,
    isLoadingZones,
    loadGroups,
    loadResources,
    loadServers,
    loadSpecificQueries,
    loadUsers,
    loadZones,
  ]);

  // load all zone data at each render if user is logged in
  useEffect(() => {
    if (localZoneName === undefined && auth.token !== null) {
      loadData();
    }
  }, [loadData, localZoneName, auth.token]);

  return (
    <ServerContext.Provider
      value={{
        zoneContext,
        localZoneName,
        zones,
        loadZones,
        loadZoneReport,
        filteredServers,
        loadCurrServers,
        userTotal,
        userContext,
        loadUsers,
        groupTotal,
        groupContext,
        loadGroups,
        rescTotal,
        rescAll,
        rescContext,
        rescTypes,
        rescPanelStatus,
        updatingRescPanelStatus,
        loadResources,
        isLoadingGroupContext,
        isLoadingRescContext,
        isLoadingUserContext,
        isLoadingZoneContext,
        isLoadingZones,
        serverVersions,
        validServerHosts,
        irodsVersionComparator,
        specificQueryContext,
        isLoadingSpecificQueryContext,
        specificQueryTotal,
        loadSpecificQueries,
        loadData,
      }}
    >
      {children}
    </ServerContext.Provider>
  );
};

ServerProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useServer = () => useContext(ServerContext);

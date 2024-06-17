import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useEnvironment } from "./";
import { irodsVersionComparator } from "../utils";
import { navigate } from "@reach/router";

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
		new Set(["EMPTY_RESC_HOST"])
	);
	const [isLoadingSpecificQueryContext, setIsLoadingSpecificQueryContext] =
		useState(false);
	const [specificQueryContext, setSpecificQueryContext] =
		useState(initialState);
	const [specificQueryTotal, setSpecificQueryTotal] = useState(0);

	const loadUsers = async (offset, limit, order, orderBy, name) => {
		setIsLoadingUserContext(true);

		if (!name || name == "USER_NAME") {
			let _query = `SELECT USER_NAME, USER_TYPE, USER_ZONE WHERE USER_TYPE != 'RODSGROUP'`;

			_query = queryGenerator(_query, order, orderBy);

			return axios({
				method: "GET",
				url: `${environment.restApiLocation}/query`,
				headers: {
					Authorization: `Bearer ${localStorage.getItem(
						"zmt-token"
					)}`,
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
					let newUserContext = {
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

			let queryTry1 = `SELECT USER_NAME, USER_TYPE, USER_ZONE WHERE USER_TYPE != 'rodsgroup' AND USER_NAME LIKE '%${name}%'`;
			let q1 = queryGenerator(queryTry1, order, orderBy);

			let queryTry2 = `SELECT USER_NAME, USER_TYPE, USER_ZONE WHERE USER_TYPE != 'rodsgroup' AND USER_ZONE LIKE '%${name}%'`;
			let q2 = queryGenerator(queryTry2, order, orderBy);

			let queryTry3 = `SELECT USER_NAME, USER_TYPE, USER_ZONE WHERE USER_TYPE != 'rodsgroup' AND USER_TYPE LIKE '%${name}%'`;
			let q3 = queryGenerator(queryTry3, order, orderBy);

			const resp1 = await axios({
				method: "GET",
				url: `${environment.restApiLocation}/query`,
				headers: {
					Authorization: `Bearer ${localStorage.getItem(
						"zmt-token"
					)}`,
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
				url: `${environment.restApiLocation}/query`,
				headers: {
					Authorization: `Bearer ${localStorage.getItem(
						"zmt-token"
					)}`,
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
				url: `${environment.restApiLocation}/query`,
				headers: {
					Authorization: `Bearer ${localStorage.getItem(
						"zmt-token"
					)}`,
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
			return;
		}
	};

	// iterate through group results and load user counts
	const loadGroupUserCounts = async (
		inputArray,
		offset,
		limit,
		order,
		orderBy
	) => {
		let groupUserCountPromises = inputArray.rows.map((group) =>
			axios({
				method: "GET",
				url: `${environment.restApiLocation}/query`,
				headers: {
					Authorization: `Bearer ${localStorage.getItem(
						"zmt-token"
					)}`,
				},
				params: {
					op: "execute_genquery",
					query: `SELECT USER_NAME WHERE USER_GROUP_NAME = '${group[0]}' AND USER_TYPE != 'rodsgroup'`,
					count: 100,
				},
			})
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
		let newGroupContext = {
			rows: inputArray.rows,
			count: inputArray.rows.length,
			total: inputArray.rows.length,
		};
		setGroupContext(newGroupContext);
		setIsLoadingGroupContext(false);
	};

	const loadGroups = async (offset, limit, name, order, orderBy) => {
		setIsLoadingGroupContext(true);
		let _query = `SELECT USER_NAME WHERE USER_TYPE = 'RODSGROUP'`;
		if (name !== "") {
			_query = `SELECT USER_NAME WHERE USER_TYPE = 'RODSGROUP' and USER_NAME LIKE '%${name.toUpperCase()}%'`;
		}
		_query = queryGenerator(_query, order, orderBy);
		await axios({
			method: "GET",
			url: `${environment.restApiLocation}/query`,
			headers: {
				Authorization: `Bearer ${localStorage.getItem("zmt-token")}`,
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
	};

	// sort and remove duplicate resources
	const resourceSortRemoveDuplicatesHelper = (
		rescArray,
		offset,
		limit,
		order,
		orderBy
	) => {
		let filteredRescContext = {
			rows: rescArray,
			total: 0,
		};
		let uniqueResc = new Set();
		let filteredResc = [];
		for (let i = 0; i < rescArray.length; i++) {
			if (!uniqueResc.has(rescArray[i][11])) {
				uniqueResc.add(rescArray[i][11]);
				filteredResc.push(rescArray[i]);
			}
		}
		let orderSyntax = order === "asc" ? 1 : -1;
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
			let base_query = `SELECT RESC_NAME,RESC_TYPE_NAME,RESC_ZONE_NAME,RESC_VAULT_PATH,RESC_LOC,RESC_INFO, RESC_FREE_SPACE, RESC_COMMENT,RESC_STATUS,RESC_CONTEXT,RESC_PARENT,RESC_ID,RESC_PARENT_CONTEXT WHERE RESC_NAME != 'bundleResc'`;
			if (name === "") {
				let _query = queryGenerator(base_query, order, orderBy);
				return axios({
					method: "GET",
					url: `${environment.restApiLocation}/query`,
					headers: {
						Authorization: `Bearer ${localStorage.getItem(
							"zmt-token"
						)}`,
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
					url: `${environment.restApiLocation}/query`,
					headers: {
						Authorization: `Bearer ${localStorage.getItem(
							"zmt-token"
						)}`,
					},
					params: {
						op: "execute_genquery",
						query:
							base_query +
							` AND RESC_NAME LIKE '%${name.toUpperCase()}%'`,
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
					url: `${environment.restApiLocation}/query`,
					headers: {
						Authorization: `Bearer ${localStorage.getItem(
							"zmt-token"
						)}`,
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
							orderBy
						);
						setIsLoadingRescContext(false);
					})
					.catch(() => {
						setRescContext(undefined);
						setIsLoadingRescContext(false);
					});
			}
		},
		[environment.restApiLocation]
	);

	const updatingRescPanelStatus = (text) => {
		setRescPanelStatus(text);
	};

	// First api request sent out when user lands after authentication, check if 502 bad gateway occurs
	// 	- 502 bad gateway => auth token is expired, so remove from local storage and re-login
	const loadZones = async () => {
		setIsLoadingZones(true);
		let zonesRes = [];
		const zoneData = await axios({
			method: "GET",
			url: `${environment.restApiLocation}/query`,
			headers: {
				Authorization: `Bearer ${localStorage.getItem("zmt-token")}`,
			},
			params: {
				op: "execute_genquery",
				query: `SELECT ZONE_NAME, order(ZONE_TYPE), ZONE_CONNECTION, ZONE_COMMENT`,
			},
		})
		.catch(() => {
			setZones([]);
			setIsLoadingZones(false);
			localStorage.removeItem("zmt-token");
			navigate("/", { replace: true });
			window.location.reload();
			return;
		})
		if (zoneData && zoneData.status === 200) {
			setLocalZoneName(
				zoneData.data.rows.filter((a) => a[1] === "local")[0][0]
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
		}
		else {
			// handle error if the request failed
			setZones([]);
			setIsLoadingZones(false);
			return;
		}
		// make each request for the number of users in each zone
		const zoneUserDataPromises = zoneData.data.rows.map((zone) => {
			return axios({
				method: "GET",
				url: `${environment.restApiLocation}/query`,
				headers: {
					Authorization: `Bearer ${localStorage.getItem(
						"zmt-token"
					)}`,
				},
				params: {
					op: "execute_genquery",
					query: `SELECT USER_NAME WHERE USER_TYPE != 'rodsgroup' AND USER_ZONE = '${zone[0]}'`,
				},
			});
		});
		const zoneUserData = await Promise.all(zoneUserDataPromises);
		zonesRes.forEach(
			(zone, index) => (zone.users = zoneUserData[index].data.rows.length)
		);
		setZones(zonesRes);
		setIsLoadingZones(false);
	};

	const loadZoneReport = () => {
		return axios({
			method: "GET",
			url: `${environment.restApiLocation}/zones`,
			headers: {
				Authorization: `Bearer ${localStorage.getItem("zmt-token")}`,
			},
			params: {
				op: "report",
			},
		}).catch(() => {
			setZoneContext(undefined);
			setIsLoadingZoneContext(false);
		});
	};

	// to query all resources that live on a specific hostname
	const fetchServerResources = (server_hostname) => {
		return axios({
			method: "GET",
			url: `${environment.restApiLocation}/query`,
			headers: {
				Authorization: `Bearer ${localStorage.getItem("zmt-token")}`,
			},
			params: {
				op: "execute_genquery",
				query: `SELECT RESC_NAME WHERE RESC_LOC = '${server_hostname}'`,
				count: 100,
			},
		});
	};

	// load all servers at each render, and iterate through server list to fetch resources which have the same hostname
	const loadServers = async () => {
		setIsLoadingZoneContext(true);
		let zone_report = await loadZoneReport();

		if (zone_report !== undefined) {
			let resc_types = new Set();
			let version_4_3_1_or_after = zone_report.data.zone_report.zones[0]
				.icat_server
				? false
				: true;
			let fullServersArray;

			if (version_4_3_1_or_after) {
				fullServersArray =
					zone_report.data.zone_report.zones[0]["servers"];
			} else {
				// before 4.3.1, icat_server was separately defined in the zonereport
				let catalog_service_provider = [
					zone_report.data.zone_report.zones[0]["icat_server"],
				];
				fullServersArray = catalog_service_provider.concat(
					zone_report.data.zone_report.zones[0]["servers"]
				);
			}
			let newValidHostSet = new Set(["EMPTY_RESC_HOST"]);
			for (let curr_server of fullServersArray) {
				// check and load resource plugins from zone report
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
				newValidHostSet.add(
					curr_server["host_system_information"]["hostname"]
				);
				let resource_counts = await fetchServerResources(
					curr_server["host_system_information"]["hostname"]
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
					.sort(irodsVersionComparator)
			);
			setRescTypes([...resc_types].sort());
			setZoneContext(fullServersArray);
			if (!localStorage.getItem(environment.serversPageKey)) {
				localStorage.setItem(
					environment.serversPageKey,
					environment.defaultItemsPerPage
				);
			}
			setFilteredServers(
				fullServersArray.slice(
					0,
					parseInt(
						localStorage.getItem(environment.serversPageKey),
						10
					)
				)
			);
			setIsLoadingZoneContext(false);
		}
	};

	// handle servers page pagination and sorting
	const loadCurrServers = async (offset, perPage, order, orderBy) => {
		if (zoneContext !== undefined && zoneContext.length !== 0) {
			let tem_servers = zoneContext;
			let orderSyntax = order === "asc" ? 1 : -1;
			const server_sort_comparator = (a, b) => {
				switch (orderBy) {
					case "hostname":
						return (
							orderSyntax *
							a["host_system_information"][
								"hostname"
							].localeCompare(
								b["host_system_information"]["hostname"]
							)
						);
					case "role":
						return (
							orderSyntax *
							a["server_config"][
								"catalog_service_role"
							].localeCompare(
								b["server_config"]["catalog_service_role"]
							)
						);
					case "os":
						return (
							orderSyntax *
							(
								a["host_system_information"][
									"os_distribution_name"
								] +
								a["host_system_information"][
									"os_distribution_version"
								]
							).localeCompare(
								b["host_system_information"][
									"os_distribution_name"
								] +
									b["host_system_information"][
										"os_distribution_version"
									]
							)
						);
					case "resources":
						return orderSyntax * (a["resources"] - b["resources"]);
					case "irods-version":
						return (
							orderSyntax *
							irodsVersionComparator(
								a["version"]["irods_version"],
								b["version"]["irods_version"]
							)
						);
					default:
						return (
							orderSyntax *
							a["server_config"][
								"catalog_service_role"
							].localeCompare(
								b["server_config"]["catalog_service_role"]
							)
						);
				}
			};
			tem_servers.sort(server_sort_comparator);
			tem_servers = tem_servers.slice(offset, offset + perPage);
			setFilteredServers(tem_servers);
		}
	};

	const loadSpecificQueries = (term) => {
		// https://docs.irods.org/4.3.2/system_overview/genquery/
		// Instead do SELECT RULE_ACCESS_NAME, ...?
		// Not sure if this column corresponds to specific queries or if it's something different
		// current query doesn't work, not seeing R_SPECIFIC_QUERY as a table in the docs
		let _query = "select alias, sqlStr from R_SPECIFIC_QUERY";
		if (term !== "") {
			_query += ` where alias like '${term}'`;
		}
		setIsLoadingSpecificQueryContext(true);
		axios({
			method: "GET",
			url: `${environment.restApiLocation}/query`,
			headers: {
				Authorization: `Bearer ${localStorage.getItem("zmt-token")}`,
			},
			params: {
				op: "execute_genquery",
				query: _query,
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
	};

	const loadData = () => {
		// not including servers key because we don't need to set default load amount here for it
		const pageKeys = [
			"groupsPerPageKey",
			"resourcesPageKey",
			"usersPageKey",
		];

		for (let key of pageKeys) {
			if (!localStorage.getItem(environment[key])) {
				localStorage.setItem(
					environment[key],
					environment.defaultItemsPerPage
				);
			}
		}

		const groupsPerPage = parseInt(
			localStorage.getItem(environment[pageKeys[0]]),
			10
		);
		const rescPerPage = parseInt(
			localStorage.getItem(environment[pageKeys[1]]),
			10
		);
		const usersPerPage = parseInt(
			localStorage.getItem(environment[pageKeys[2]]),
			10
		);

		!isLoadingZones && loadZones();
		!isLoadingZoneContext && loadServers();
		!isLoadingGroupContext &&
			loadGroups(0, groupsPerPage, "", "asc", "USER_NAME");
		!isLoadingRescContext &&
			loadResources(0, rescPerPage, "", "asc", "RESC_NAME");
		!isLoadingUserContext &&
			loadUsers(0, usersPerPage, "", "asc", "USER_NAME");
		!isLoadingSpecificQueryContext && loadSpecificQueries("");
	};

	// load all zone data at each render if user is logged in
	useEffect(() => {
		if (
			localZoneName === undefined &&
			localStorage.getItem("zmt-token") !== null
		) {
			loadData();
		}
	}, []);

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

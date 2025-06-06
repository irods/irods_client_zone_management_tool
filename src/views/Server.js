import React, { Fragment, useEffect, useState, useLayoutEffect } from "react";
import { TabPanel, TableSortLabel, TablePagination } from "../components";
import { useEnvironment, useServer } from "../contexts";
import { Navigate } from "react-router-dom";

const styles = {
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tab_panel: {
    width: 900,
  },
  info: {
    margin: 8,
  },
  server: {
    width: 64,
  },
  server_details: {
    flexGrow: 1,
    display: "flex",
    height: 600,
    padding: 0,
  },
  dialog: {
    width: "50%",
  },
};

export const Server = () => {
  const {
    isLoadingZoneContext,
    zoneContext,
    filteredServers,
    loadCurrServers,
  } = useServer();
  const environment = useEnvironment();
  const serversPageKey = environment.serversPageKey;
  const [currPage, setCurrPage] = useState(1);
  const [perPage, setPerPage] = useState(
    parseInt(localStorage.getItem(serversPageKey), 10),
  );
  const [tabValue, setTabValue] = useState(0);
  const [openDetails, setOpenDetails] = useState(false);
  const [currServer, setCurrServer] = useState();
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("role");

  useEffect(() => {
    // runs on initial render
    const serversPerPage = localStorage.getItem(serversPageKey);

    if (!serversPerPage) {
      localStorage.setItem(serversPageKey, environment.defaultItemsPerPage);
      setPerPage(environment.defaultItemsPerPage);
    }
  }, []);

  useEffect(() => {
    loadCurrServers(perPage * (currPage - 1), perPage, order, orderBy);
    environment.pageTitle = environment.serversTitle;
    document.title = `${environment.titleFormat()}`;
  }, [perPage, currPage, order, orderBy]);

  const handleSort = (props) => {
    const isAsc = orderBy === props && order === "desc";
    setOrder(isAsc ? "asc" : "desc");
    setOrderBy(props);
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
      className: "verticalTab",
      disabled: tabValue === index,
      onClick: () => {
        setTabValue(index);
      },
    };
  }

  useLayoutEffect(() => {
    if (currServer !== undefined && openDetails)
      document.getElementById("modal").showModal();
    if (
      currServer !== undefined &&
      !openDetails &&
      document.getElementById("modal").open
    )
      document.getElementById("modal").close();
  }, [openDetails]);

  return (
    <Fragment>
      {zoneContext === undefined ? (
        <div>
          Cannot load server data. Please check your iRODS Client HTTP API
          endpoint connection.
        </div>
      ) : (
        <Fragment>
          <TablePagination
            style={styles.pagination}
            page={currPage - 1}
            count={parseInt(zoneContext.length)}
            rowsPerPage={perPage}
            onChangePage={(event, value) => {
              setCurrPage(value + 1);
            }}
            onChangeRowsPerPage={(e) => {
              setPerPage(e.target.value);
              setCurrPage(1);
              localStorage.setItem(serversPageKey, e.target.value);
            }}
          />
          <div className="outlined_paper">
            <table style={styles.table} aria-label="simple table">
              <thead>
                <tr>
                  <td style={{ width: "25%" }}>
                    <TableSortLabel
                      active={orderBy === "role"}
                      direction={orderBy === "role" ? order : "asc"}
                      onClick={() => {
                        handleSort("role");
                      }}
                    >
                      <b>Role</b>
                    </TableSortLabel>
                  </td>
                  <td style={{ width: "15%" }}>
                    <TableSortLabel
                      active={orderBy === "irods-version"}
                      direction={orderBy === "irods-version" ? order : "asc"}
                      onClick={() => {
                        handleSort("irods-version");
                      }}
                    >
                      <b>iRODS Version</b>
                    </TableSortLabel>
                  </td>
                  <td style={{ width: "20%" }}>
                    <TableSortLabel
                      active={orderBy === "hostname"}
                      direction={orderBy === "hostname" ? order : "asc"}
                      onClick={() => {
                        handleSort("hostname");
                      }}
                    >
                      <b>Hostname</b>
                    </TableSortLabel>
                  </td>
                  <td style={{ width: "10%" }}>
                    <TableSortLabel
                      active={orderBy === "resources"}
                      direction={orderBy === "resources" ? order : "asc"}
                      onClick={() => {
                        handleSort("resources");
                      }}
                    >
                      <b>Resources</b>
                    </TableSortLabel>
                  </td>
                  <td style={{ width: "25%" }}>
                    <TableSortLabel
                      active={orderBy === "os"}
                      direction={orderBy === "os" ? order : "asc"}
                      onClick={() => {
                        handleSort("os");
                      }}
                    >
                      <b>OS Distribution</b>
                    </TableSortLabel>
                  </td>
                  <td style={{ width: "5%" }} align="right"></td>
                </tr>
              </thead>
              <tbody>
                {!isLoadingZoneContext &&
                  filteredServers &&
                  (filteredServers.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="table_view_no_results_container">
                          No results found.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredServers.map((server) => (
                      <tr key={server["host_system_information"]["hostname"]}>
                        <td
                          style={{
                            borderLeft: `25px solid ${server["server_config"]["catalog_service_role"] === "provider" ? "#04d1c2" : "#808080"}`,
                            width: "25%",
                          }}
                        >
                          {server["server_config"]["catalog_service_role"] ===
                          "provider"
                            ? "Catalog Service Provider"
                            : "Catalog Service Consumer"}
                        </td>
                        <td style={{ width: "15%", textAlign: "center" }}>
                          {server["version"]["irods_version"]}
                        </td>
                        <td style={{ width: "25%" }}>
                          {server["host_system_information"]["hostname"]}
                        </td>
                        <td style={{ width: "10%" }}>{server["resources"]}</td>
                        <td style={{ width: "20%" }}>
                          {server["host_system_information"][
                            "os_distribution_name"
                          ] +
                            " " +
                            server["host_system_information"][
                              "os_distribution_version"
                            ]}
                        </td>
                        <td style={{ width: "5%" }} align="right">
                          <button
                            onClick={() => {
                              setCurrServer(server);
                              setOpenDetails(true);
                            }}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ))}
              </tbody>
            </table>
          </div>
          {currServer !== undefined && (
            <dialog
              id="modal"
              style={styles.dialog}
              onClose={() => setOpenDetails(false)}
            >
              <h1>Server Details</h1>
              <div style={styles.server_details}>
                <div className="verticalTabs" aria-label="vertical-tabs">
                  <button {...a11yProps(0)}>General</button>
                  <button {...a11yProps(1)}>Service Configuration</button>
                  <button {...a11yProps(2)}>Service Account Environment</button>
                  <button {...a11yProps(3)}>
                    Plugin ({currServer["plugins"].length})
                  </button>
                </div>
                <TabPanel style={styles.tab_panel} value={tabValue} index={0}>
                  <p style={styles.info}>
                    Hostname:{" "}
                    {currServer["host_system_information"]["hostname"]}
                  </p>
                  <p style={styles.info}>
                    OS Distribution Name:{" "}
                    {
                      currServer["host_system_information"][
                        "os_distribution_name"
                      ]
                    }
                  </p>
                  <p style={styles.info}>
                    OS Distribution Version:{" "}
                    {
                      currServer["host_system_information"][
                        "os_distribution_version"
                      ]
                    }
                  </p>
                  <p style={styles.info}>
                    Service Account Group Name:{" "}
                    {
                      currServer["host_system_information"][
                        "service_account_group_name"
                      ]
                    }
                  </p>
                  <p style={styles.info}>
                    Service Account User Name:{" "}
                    {
                      currServer["host_system_information"][
                        "service_account_user_name"
                      ]
                    }
                  </p>
                  <p style={styles.info}>
                    Schema Name: {currServer["server_config"]["schema_name"]}
                  </p>
                  <p style={styles.info}>
                    Schema Version:{" "}
                    {currServer["server_config"]["schema_version"]}
                  </p>
                  <p style={styles.info}>
                    Catalog Schema Version:{" "}
                    {currServer["version"]["catalog_schema_version"]}
                  </p>
                  <p style={styles.info}>
                    Configuration Schema Version:{" "}
                    {currServer["version"]["configuration_schema_version"]}
                  </p>
                  <p style={styles.info}>
                    iRODS Version: {currServer["version"]["irods_version"]}
                  </p>
                  <p style={styles.info}>
                    Installation Time:{" "}
                    {currServer["version"]["installation_time"]}
                  </p>
                </TabPanel>
                <TabPanel style={styles.tab_panel} value={tabValue} index={1}>
                  <p style={styles.info}>
                    Catalog Provider Hosts:{" "}
                    {currServer["server_config"]["catalog_provider_hosts"]}
                  </p>
                  <p style={styles.info}>
                    Catalog Service Role:{" "}
                    {currServer["server_config"]["catalog_service_role"]}
                  </p>
                  <p style={styles.info}>
                    Client Api Whitelist Policy:{" "}
                    {currServer["server_config"]["client_api_whitelist_policy"]}
                  </p>
                  <p style={styles.info}>
                    Default Dir Mode:{" "}
                    {currServer["server_config"]["default_dir_mode"]}
                  </p>
                  <p style={styles.info}>
                    Default File Mode:{" "}
                    {currServer["server_config"]["default_file_mode"]}
                  </p>
                  <p style={styles.info}>
                    Default Hash Scheme:{" "}
                    {currServer["server_config"]["default_hash_scheme"]}
                  </p>
                  <p style={styles.info}>
                    Default Resource Name:{" "}
                    {currServer["server_config"]["default_resource_name"]}
                  </p>
                  <p style={styles.info}>
                    Match Hash Policy:{" "}
                    {currServer["server_config"]["match_hash_policy"]}
                  </p>
                  <p style={styles.info}>
                    Server Control Plane Encryption Algorithm:{" "}
                    {
                      currServer["server_config"][
                        "server_control_plane_encryption_algorithm"
                      ]
                    }
                  </p>
                  <p style={styles.info}>
                    Server Control Plane Encryption Num Hash Rounds:{" "}
                    {
                      currServer["server_config"][
                        "server_control_plane_encryption_num_hash_rounds"
                      ]
                    }
                  </p>
                  <p style={styles.info}>
                    Server Control Plane Port:{" "}
                    {currServer["server_config"]["server_control_plane_port"]}
                  </p>
                  <p style={styles.info}>
                    Server Port Range:{" "}
                    {currServer["server_config"]["server_port_range_start"]} -{" "}
                    {currServer["server_config"]["server_port_range_end"]}
                  </p>
                  <p style={styles.info}>
                    Zone Auth Scheme:{" "}
                    {currServer["server_config"]["zone_auth_scheme"]}
                  </p>
                  <p style={styles.info}>
                    Zone Port: {currServer["server_config"]["zone_port"]}
                  </p>
                  <p style={styles.info}>
                    Zone User: {currServer["server_config"]["zone_user"]}
                  </p>
                </TabPanel>
                <TabPanel style={styles.tab_panel} value={tabValue} index={2}>
                  <p style={styles.info}>
                    iRODS Client Server Negotiation:{" "}
                    {
                      currServer["service_account_environment"][
                        "irods_client_server_negotiation"
                      ]
                    }
                  </p>
                  <p style={styles.info}>
                    iRODS Client Server Policy:{" "}
                    {
                      currServer["service_account_environment"][
                        "irods_client_server_policy"
                      ]
                    }
                  </p>
                  <p style={styles.info}>
                    iRODS Connection Refresh Time:{" "}
                    {
                      currServer["service_account_environment"][
                        "irods_connection_pool_refresh_time_in_seconds"
                      ]
                    }
                  </p>
                  <p style={styles.info}>
                    iRODS CWD:{" "}
                    {currServer["service_account_environment"]["irods_cwd"]}
                  </p>
                  <p style={styles.info}>
                    iRODS Default Hash Scheme:{" "}
                    {
                      currServer["service_account_environment"][
                        "irods_default_hash_scheme"
                      ]
                    }
                  </p>
                  <p style={styles.info}>
                    iRODS Default Resource:{" "}
                    {
                      currServer["service_account_environment"][
                        "irods_default_resource"
                      ]
                    }
                  </p>
                  <p style={styles.info}>
                    iRODS Encryption Algorithm:{" "}
                    {
                      currServer["service_account_environment"][
                        "irods_encryption_algorithm"
                      ]
                    }
                  </p>
                  <p style={styles.info}>
                    iRODS Encryption Key Size:{" "}
                    {
                      currServer["service_account_environment"][
                        "irods_encryption_key_size"
                      ]
                    }
                  </p>
                  <p style={styles.info}>
                    iRODS Encryption Hash Rounds:{" "}
                    {
                      currServer["service_account_environment"][
                        "irods_encryption_num_hash_rounds"
                      ]
                    }
                  </p>
                  <p style={styles.info}>
                    iRODS Encryption Salt Size:{" "}
                    {
                      currServer["service_account_environment"][
                        "irods_encryption_salt_size"
                      ]
                    }
                  </p>
                  <p style={styles.info}>
                    iRODS Home:{" "}
                    {currServer["service_account_environment"]["irods_home"]}
                  </p>
                  <p style={styles.info}>
                    iRODS Maximum Size for Single Buffer In Megabytes:{" "}
                    {
                      currServer["service_account_environment"][
                        "irods_maximum_size_for_single_buffer_in_megabytes"
                      ]
                    }
                  </p>
                </TabPanel>
                <TabPanel style={styles.tab_panel} value={tabValue} index={3}>
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <b>Name</b>
                        </td>
                        <td>
                          <b>Type</b>
                        </td>
                      </tr>
                      {currServer["plugins"].map((plugin) => (
                        <tr key={plugin.name}>
                          <td style={{ paddingTop: 0, paddingBottom: 0 }}>
                            <div style={styles.plugin_info}>{plugin.name}</div>
                          </td>
                          <td
                            style={{
                              paddingTop: 0,
                              paddingBottom: 0,
                              paddingLeft: 0,
                            }}
                          >
                            <p style={styles.info}>{plugin.type}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TabPanel>
              </div>
            </dialog>
          )}
        </Fragment>
      )}
    </Fragment>
  );
};

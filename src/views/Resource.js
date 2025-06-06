import React, { Fragment, useEffect, useState, useLayoutEffect } from "react";
import { useEnvironment, useServer } from "../contexts";
import "../App.css";
import ResourceRows from "../components/ResourceRows";
import {
  CircularLoadingIndicator,
  CloseIcon,
  CheckIcon,
  TablePagination,
  TableSortLabel,
} from "../components";
import { useSearchParams } from "react-router-dom";

import { AddResourceController } from "../controllers/ResourceController";

const styles = {
  dialog_action: {
    margin: 8,
  },
  tableContainer: {
    marginTop: 20,
  },
  filterGroup: {
    display: "flex",
    flexDirection: "row",
    margin: 8,
    justifyContent: "center",
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  filter: {
    marginLeft: 30,
    width: 300,
  },
  add_button: {
    marginLeft: 30,
  },
};

export const Resource = () => {
  const [params, setParams] = useSearchParams();
  const [isLoading, setLoading] = useState(false);
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [addResult, setAddResult] = useState();
  const [rescName, setRescName] = useState("");
  const [rescType, setRescType] = useState("");
  const [rescLocation, setRescLocation] = useState("");
  const [rescVaultPath, setRescVaultPath] = useState("");
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("RESC_NAME");
  const [currPage, setCurrPage] = useState(1);
  const environment = useEnvironment();
  const resourcesPageKey = environment.resourcesPageKey;
  const [perPage, setPerPage] = useState(
    parseInt(localStorage.getItem(resourcesPageKey), 10),
  );
  const [filterRescName, setFilterName] = useState("");
  const {
    isLoadingRescContext,
    localZoneName,
    validServerHosts,
    rescContext,
    rescTypes,
    loadResources,
    rescPanelStatus,
    updatingRescPanelStatus,
  } = useServer();

  useEffect(() => {
    if (params.has("filter")) {
      setFilterName(params.get("filter"));
      setParams();
    }
  }, []);

  useEffect(() => {
    // runs on initial render
    const resourcesPerPage = localStorage.getItem(resourcesPageKey);
    if (!resourcesPerPage) {
      localStorage.setItem(resourcesPageKey, environment.defaultItemsPerPage);
      setPerPage(environment.defaultItemsPerPage);
    }
  }, [environment.defaultItemsPerPage, resourcesPageKey]);

  useEffect(() => {
    if (localZoneName) {
      loadResources(
        (currPage - 1) * perPage,
        perPage,
        filterRescName,
        order,
        orderBy,
      );
    }
    environment.pageTitle = environment.resourcesTitle;
    document.title = `${environment.titleFormat()}`;
  }, [
    currPage,
    perPage,
    filterRescName,
    order,
    orderBy,
    environment,
    loadResources,
    localZoneName,
  ]);

  useEffect(() => {
    if (rescPanelStatus !== "creation") {
      setRescName("");
      setRescType("");
      setRescLocation("");
      setRescVaultPath("");
    }
  }, [rescPanelStatus, environment, loadResources, localZoneName]);

  // validate resource hostname and vault path
  // return FALSE if one of two attributes is an empty string
  const rescInputValidator = () => {
    return !(rescName === "" || rescType === "");
  };

  const addResource = async () => {
    setAddFormOpen(true);
    setLoading(true);
    await AddResourceController(
      rescName,
      rescType,
      rescLocation,
      rescVaultPath,
      environment.httpApiLocation,
    )
      .then((res) => {
        if (res.status === 200) {
          window.location.reload();
          setAddResult("Resource created.");
          setLoading(false);
        }
      })
      .catch((e) => {
        setAddResult(
          `Error Code ${e.response.data.error_code}: ${e.response.data.error_message}`,
        );
        setLoading(false);
      });
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) addResource();
  };

  const handleAddFormClose = () => {
    setAddFormOpen(false);
  };

  const handleAddRowClose = () => {
    setRescName("");
    setRescType("");
    setRescLocation("");
    setRescVaultPath("");
    updatingRescPanelStatus("idle");
  };

  const handleRemoveFormOpen = (resc) => {
    setRescName(resc[0]);
  };

  const handleRescNameChange = (event) => {
    // trim all whitespaces in the resource name
    setRescName(event.target.value.trim());
  };

  const handleRescTypeChange = (event) => {
    setRescType(event.target.value.trim());
  };

  const handleRescLocationChange = (event) => {
    setRescLocation(encodeURI(event.target.value.trim()));
  };
  const handleRescVaultPathChange = (event) => {
    setRescVaultPath(event.target.value.trim());
  };

  const handleSort = (props) => {
    const isAsc = orderBy === props && order === "desc";
    setOrder(isAsc ? "asc" : "desc");
    setOrderBy(props);
  };

  const handlePageChange = (event, value) => {
    setCurrPage(value + 1);
  };

  const handleFilterChange = (e) => {
    setFilterName(e.target.value);
  };

  useLayoutEffect(() => {
    if (addFormOpen) document.getElementById("modal").showModal();
  }, [addFormOpen]);

  return (
    <Fragment>
      {!rescContext ? (
        <div>
          Cannot load resource data. Please check iRODS Client Rest API.
        </div>
      ) : (
        <Fragment>
          <div style={styles.filterGroup}>
            <input
              type="text"
              style={styles.filter}
              id="filter-term"
              value={filterRescName}
              placeholder="Filter by Name or Hostname"
              onChange={handleFilterChange}
            />
            <button
              style={styles.add_button}
              className="outlined_button"
              onClick={() => updatingRescPanelStatus("creation")}
            >
              Add New Resource
            </button>
          </div>
          <Fragment>
            <TablePagination
              component="div"
              style={styles.pagination}
              page={currPage - 1}
              count={parseInt(rescContext.total)}
              rowsPerPage={perPage}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={(e) => {
                setPerPage(e.target.value);
                setCurrPage(1);
                localStorage.setItem(resourcesPageKey, e.target.value);
              }}
            />
            <div className="outlined_paper" style={styles.tableContainer}>
              <table style={{ width: "100%", tableLayout: "fixed" }}>
                <thead>
                  <tr>
                    <td style={{ width: "23%" }} key="0">
                      <TableSortLabel
                        active={orderBy === "RESC_NAME"}
                        direction={orderBy === "RESC_NAME" ? order : "asc"}
                        onClick={() => {
                          handleSort("RESC_NAME");
                        }}
                      >
                        <b>Name</b>
                      </TableSortLabel>
                    </td>
                    <td style={{ width: "25%" }} key="1" align="left">
                      <TableSortLabel
                        active={orderBy === "RESC_TYPE_NAME"}
                        direction={orderBy === "RESC_TYPE_NAME" ? order : "asc"}
                        onClick={() => {
                          handleSort("RESC_TYPE_NAME");
                        }}
                      >
                        <b>Type</b>
                      </TableSortLabel>
                    </td>
                    <td style={{ width: "25%" }} key="8" align="left">
                      <TableSortLabel
                        active={orderBy === "RESC_LOC"}
                        direction={orderBy === "RESC_LOC" ? order : "asc"}
                        onClick={() => {
                          handleSort("RESC_LOC");
                        }}
                      >
                        <b>Hostname</b>
                      </TableSortLabel>
                    </td>
                    <td style={{ width: "20%" }} key="3" align="left">
                      <TableSortLabel
                        active={orderBy === "RESC_VAULT_PATH"}
                        direction={
                          orderBy === "RESC_VAULT_PATH" ? order : "asc"
                        }
                        onClick={() => {
                          handleSort("RESC_VAULT_PATH");
                        }}
                      >
                        <b>Vault Path</b>
                      </TableSortLabel>
                    </td>
                    <td style={{ width: "7%" }} align="right"></td>
                  </tr>
                </thead>
                <tbody>
                  {rescPanelStatus === "creation" && (
                    <tr id="add_resc_newrow">
                      <td>
                        <input
                          type="text"
                          id="new_resc_name"
                          value={rescName}
                          onKeyDown={(event) => handleKeyDown(event)}
                          onChange={handleRescNameChange}
                        />
                      </td>
                      <td>
                        <select
                          id="new_resc_type"
                          placeholder="Resource Type"
                          value={rescType}
                          onKeyDown={(event) => handleKeyDown(event)}
                          onChange={handleRescTypeChange}
                        >
                          <option aria-label="None" value="" />
                          {rescTypes &&
                            rescTypes.length &&
                            rescTypes.map((type) => (
                              <option
                                key={`resource-type-${type}`}
                                value={type}
                              >
                                {type}
                              </option>
                            ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          id="new_resc_loc"
                          value={rescLocation}
                          onKeyDown={(event) => handleKeyDown(event)}
                          onChange={handleRescLocationChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          id="new_resc_name_path"
                          value={rescVaultPath}
                          onKeyDown={(event) => handleKeyDown(event)}
                          onChange={handleRescVaultPathChange}
                        />
                      </td>
                      <td>
                        <span style={{ display: "flex", flexDirection: "row" }}>
                          <button
                            className="icon_button"
                            value="save"
                            disabled={!rescInputValidator()}
                            onClick={addResource}
                          >
                            <CheckIcon />
                          </button>
                          <button
                            className="icon_button"
                            value="close"
                            onClick={handleAddRowClose}
                          >
                            <CloseIcon />
                          </button>
                        </span>
                      </td>
                    </tr>
                  )}
                  {!isLoadingRescContext &&
                    (rescContext.rows && rescContext.rows.length === 0 ? (
                      <tr>
                        <td colSpan={4}>
                          <div className="table_view_no_results_container">
                            No results found for [{filterRescName}].
                          </div>
                        </td>
                      </tr>
                    ) : (
                      rescContext.rows &&
                      rescContext.rows.map((this_resc) => (
                        <ResourceRows
                          key={this_resc[0]}
                          row={this_resc}
                          validServerHosts={validServerHosts}
                          handleRemoveFormOpen={handleRemoveFormOpen}
                        />
                      ))
                    ))}
                </tbody>
              </table>
            </div>
          </Fragment>
          <dialog id="modal" onClose={handleAddFormClose}>
            <h2>Add New Resource</h2>
            <div>
              <span>
                Resource Name: {rescName}
                <br />
                Type: {rescType}
                <br />
                Hostname: {rescLocation}
                <br />
                Vault Path: {rescVaultPath}
              </span>
              {isLoading === true ? (
                <div style={styles.progress}>
                  Creating in progress...
                  <CircularLoadingIndicator />
                </div>
              ) : (
                <p>{addResult}</p>
              )}
            </div>
            <div style={styles.dialog_action}></div>
          </dialog>
        </Fragment>
      )}
    </Fragment>
  );
};

import React, { Fragment, useState, useEffect, useLayoutEffect } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useEnvironment, useServer } from "../contexts";
import {
  TableSortLabel,
  TablePagination,
  CheckIcon,
  CloseIcon,
} from "../components";
import {
  AddGroupController,
  RemoveGroupController,
} from "../controllers/GroupController";

const styles = {
  link_button: {
    textDecoration: "none",
  },
  tableContainer: {
    marginTop: 20,
  },
  errorMsg: {
    color: "red",
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
  add_group_name: {
    width: 200,
  },
  add_button: {
    marginLeft: 30,
  },
};

export const Group = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const environment = useEnvironment();
  const groupsPerPageKey = environment.groupsPerPageKey;
  const { isLoadingGroupContext, localZoneName, groupContext, loadGroups } =
    useServer();
  const [addErrorMsg, setAddErrorMsg] = useState();
  const [removeErrorMsg, setRemoveErrorMsg] = useState();
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [removeFormOpen, setRemoveFormOpen] = useState(false);
  const [currGroup, setCurrGroup] = useState([]);
  const [filterGroupName, setFilterName] = useState(
    params.get("filter") ? decodeURIComponent(params.get("filter")) : "",
  );
  const [currPage, setCurrPage] = useState(1);
  const [perPage, setPerPage] = useState(
    parseInt(localStorage.getItem(groupsPerPageKey), 10),
  );
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("USER_NAME");
  let group_id = 0;

  const [newGroupName, setNewGroupName] = useState("");
  const [addRowOpen, setAddRowOpen] = useState(false);

  useEffect(() => {
    // runs on initial render
    const groupsPerPage = localStorage.getItem(groupsPerPageKey);
    if (!groupsPerPage) {
      localStorage.setItem(groupsPerPageKey, environment.defaultItemsPerPage);
      setPerPage(environment.defaultItemsPerPage);
    }
  }, [environment.defaultItemsPerPage, groupsPerPageKey]);

  // load group from context provider,
  // pass in perPage, currentPage, filtername('' by default), order, orderBy

  useEffect(() => {
    if (localZoneName && !isLoadingGroupContext)
      loadGroups(
        (currPage - 1) * perPage,
        perPage,
        filterGroupName,
        order,
        orderBy,
      );
    environment.pageTitle = environment.groupsTitle;
    document.title = `${environment.titleFormat()}`;
  }, [
    currPage,
    perPage,
    filterGroupName,
    order,
    orderBy,
    environment,
    localZoneName,
  ]);

  async function addGroup() {
    try {
      await AddGroupController(newGroupName, environment.httpApiLocation).then(
        () => {
          window.location.reload();
        },
      );
    } catch (e) {
      setAddFormOpen(true);
      setAddErrorMsg(
        "Failed to add group " +
          e.response.data.error_code +
          ": " +
          e.response.data.error_message,
      );
    }
  }

  async function removeGroup() {
    try {
      await RemoveGroupController(
        currGroup[0],
        environment.httpApiLocation,
      ).then(() => {
        window.location.reload();
      });
    } catch (e) {
      setRemoveErrorMsg(
        "Failed to remove group " +
          e.response.error +
          ":" +
          e.response.data.error_message,
      );
    }
  }

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) addGroup();
  };

  const handleAddRowClose = () => {
    setAddRowOpen(false);
    setNewGroupName("");
  };

  const handleAddFormClose = () => {
    handleAddRowClose();
    setAddFormOpen(false);
  };

  const handlePageChange = (event, value) => {
    setCurrPage(value + 1);
  };

  const handleSort = (props) => {
    const isAsc = orderBy === props && order === "desc";
    setOrder(isAsc ? "asc" : "desc");
    setOrderBy(props);
  };

  const handleRemoveAction = (group) => {
    setCurrGroup(group);
    setRemoveFormOpen(true);
  };

  const handleRemoveFormClose = () => {
    setRemoveFormOpen(false);
    setRemoveErrorMsg();
  };

  const handleFilterChange = (e) => {
    setFilterName(e.target.value);
    // update the path without reload, filter is also encoded
    if (e.target.value === "") window.history.replaceState("", "", "/groups");
    else
      window.history.replaceState(
        "",
        "",
        `/groups?filter=${encodeURIComponent(e.target.value)}`,
      );
  };

  useLayoutEffect(() => {
    if (addFormOpen) document.getElementById("add-form-modal").showModal();
    if (!addFormOpen && document.getElementById("add-form-modal").open)
      document.getElementById("add-form-modal").close();
  }, [addFormOpen]);

  useLayoutEffect(() => {
    if (removeFormOpen)
      document.getElementById("remove-form-modal").showModal();
    if (!removeFormOpen && document.getElementById("remove-form-modal").open)
      document.getElementById("remove-form-modal").close();
  }, [removeFormOpen]);

  return (
    <Fragment>
      {groupContext === undefined ? (
        <div>
          Cannot load group data. Please check your iRODS Client HTTP API
          endpoint connection.
        </div>
      ) : (
        <Fragment>
          <div style={styles.filterGroup}>
            <input
              type="text"
              style={styles.filter}
              id="filter-term"
              placeholder="Filter by Group Name"
              onChange={handleFilterChange}
            />
            <button
              style={styles.add_button}
              className="outlined_button"
              onClick={() => setAddRowOpen(true)}
            >
              Add New Group
            </button>
          </div>
          <Fragment>
            <TablePagination
              style={styles.pagination}
              page={currPage - 1}
              count={parseInt(groupContext.total)}
              rowsPerPage={perPage}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={(e) => {
                setPerPage(e.target.value);
                setCurrPage(1);
                localStorage.setItem(groupsPerPageKey, e.target.value);
              }}
            />
            <div className="outlined_paper" style={styles.tableContainer}>
              <table style={{ width: "100%" }} aria-label="simple table">
                <thead>
                  <tr>
                    <td style={{ width: "30%" }}>
                      <TableSortLabel
                        active={orderBy === "USER_NAME"}
                        direction={orderBy === "USER_NAME" ? order : "asc"}
                        onClick={() => {
                          handleSort("USER_NAME");
                        }}
                      >
                        <b>Group Name</b>
                      </TableSortLabel>
                    </td>
                    <td style={{ width: "30%" }}>
                      <TableSortLabel
                        active={orderBy === "USER_COUNT"}
                        direction={orderBy === "USER_COUNT" ? order : "asc"}
                        onClick={() => {
                          handleSort("USER_COUNT");
                        }}
                      >
                        <b>Users</b>
                      </TableSortLabel>
                    </td>
                    <td style={{ width: "30%" }} align="right">
                      <b>Action</b>
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {addRowOpen && (
                    <tr id="add-group-row">
                      <td>
                        <input
                          type="text"
                          style={styles.add_group_name}
                          placeholder="Enter new Group Name"
                          value={newGroupName}
                          id="add-group-name"
                          onKeyDown={(event) => handleKeyDown(event)}
                          onChange={(e) => setNewGroupName(e.target.value)}
                        />
                      </td>
                      <td></td>
                      <td align="right">
                        <span
                          style={{
                            float: "right",
                            display: "flex",
                            flexDirection: "row",
                          }}
                        >
                          <button
                            className="icon_button"
                            value="save"
                            onClick={addGroup}
                            disabled={newGroupName === ""}
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
                  {!isLoadingGroupContext &&
                    (groupContext.rows.length === 0 ? (
                      <tr>
                        <td colSpan={3}>
                          <div className="table_view_no_results_container">
                            No results found for [{filterGroupName}].
                          </div>
                        </td>
                      </tr>
                    ) : (
                      groupContext.rows.map((group) => (
                        <tr key={group_id}>
                          <td
                            style={{
                              width: "30%",
                            }}
                            component="th"
                            scope="row"
                          >
                            {group[0]}
                          </td>
                          <td
                            style={{
                              width: "30%",
                            }}
                            component="th"
                            scope="row"
                          >
                            {group[1]}
                          </td>
                          <td
                            style={{
                              width: "30%",
                            }}
                            align="right"
                          >
                            <Link
                              style={styles.link_button}
                              to="/groups/edit"
                              state={{
                                groupInfo: group,
                              }}
                            >
                              <button>Edit</button>
                            </Link>{" "}
                            {group[0] === "public" ? (
                              <span id={group_id++}></span>
                            ) : (
                              <button
                                id={group_id++}
                                onClick={() => handleRemoveAction(group)}
                              >
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ))}
                </tbody>
              </table>
            </div>
          </Fragment>
          <dialog
            id="add-form-modal"
            open={addFormOpen}
            style={styles.formContainer}
            onClick={handleAddFormClose}
            aria-labelledby="form-dialog-title"
          >
            <h2>Adding New Group</h2>
            <div>
              <b>Error Message:</b>
              <p style={styles.errorMsg}>{addErrorMsg}</p>
            </div>
            <div>
              <button onClick={handleAddFormClose}>Close</button>
            </div>
          </dialog>
          <dialog
            id="remove-form-modal"
            style={styles.formContainer}
            onClose={handleRemoveFormClose}
            aria-labelledby="form-dialog-title"
          >
            <h2>Warning</h2>
            <div>
              <p>
                Are you sure to remove <b>{currGroup[0]}</b>?
              </p>
              <p style={styles.errorMsg}>{removeErrorMsg}</p>
            </div>
            <div>
              <button onClick={removeGroup}>Remove</button>
              <button onClick={handleRemoveFormClose}>Cancel</button>
            </div>
          </dialog>
        </Fragment>
      )}
    </Fragment>
  );
};

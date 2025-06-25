import React, { Fragment, useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { useEnvironment, useServer } from "../contexts";
import {
  CheckIcon,
  CloseIcon,
  TablePagination,
  TableSortLabel,
} from "../components";
import {
  AddUserController,
  RemoveUserController,
} from "../controllers/UserController";

const styles = {
  tableContainer: {
    marginTop: 20,
  },
  errorMsg: {
    color: "red",
  },
  link_button: {
    textDecoration: "none",
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "row",
    margin: 8,
    justifyContent: "center",
  },
  filter: {
    marginLeft: 30,
    width: 300,
  },
  add_user_name: {
    width: 200,
  },
  add_button: {
    marginLeft: 30,
  },
  fontInherit: {
    font: "inherit",
  },
  table_cell: {
    wordWrap: "break-word",
  },
};

export const User = () => {
  const environment = useEnvironment();
  const usersPageKey = environment.usersPageKey;
  const loggedUserName = localStorage.getItem("zmt-username");
  const [currUser, setCurrUser] = useState([]);
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [addErrorMsg, setAddErrorMsg] = useState();
  const [removeErrorMsg, setRemoveErrorMsg] = useState();
  const userTypes = ["rodsuser", "rodsadmin", "groupadmin"];
  const [removeConfirmation, setRemoveConfirmation] = useState(false);
  const [currPage, setCurrPage] = useState(1);
  const [perPage, setPerPage] = useState(
    parseInt(localStorage.getItem(usersPageKey), 10),
  );
  const [filterUsername, setFilterName] = useState("");
  const { userContext, userTotal, localZoneName, loadUsers, zones } =
    useServer();
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("USER_NAME");
  const [userData, setUserData] = useState([]);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const firstUpdate = useRef(true); // used to prevent filtering useEffect from running on initial render
  const delayTimeUse = environment.filterTimeInMilliseconds / 100; // convert into tenths of a second

  const initialAddData = {
    name: "",
    zone: localZoneName ? localZoneName : "tempZone",
    type: "rodsuser",
  };

  const [newUserData, setNewUserData] = useState(initialAddData);
  const [addRowOpen, setAddRowOpen] = useState(false);

  useEffect(() => {
    // runs on initial render
    const usersPerPage = localStorage.getItem(usersPageKey);
    if (!usersPerPage) {
      localStorage.setItem(usersPageKey, environment.defaultItemsPerPage);
      setPerPage(environment.defaultItemsPerPage);
    }
  }, [environment.defaultItemsPerPage, usersPageKey]);

  useEffect(() => {
    // timer for keystroke delay
    let intervalId;
    if (isRunning) {
      intervalId = setInterval(() => setTime(time + 1), 100); // run every 100 milliseconds
    }
    return () => clearInterval(intervalId);
  }, [isRunning, time]);

  async function addUser() {
    if (!newUserData.name) return;
    try {
      await AddUserController(
        newUserData.name,
        newUserData.zone,
        newUserData.type,
        environment.httpApiLocation,
      ).then(() => {
        window.location.reload();
      });
    } catch (e) {
      setAddFormOpen(true);
      setAddErrorMsg(
        "Failed to add user " +
          e.response.data.error_code +
          ": " +
          e.response.data.error_message,
      );
    }
  }

  async function removeUser() {
    try {
      await RemoveUserController(
        currUser[0],
        currUser[2],
        environment.httpApiLocation,
      ).then(() => {
        window.location.reload();
      });
    } catch (e) {
      setRemoveErrorMsg(
        "Failed to remove user " +
          e.response.data.error_code +
          ": " +
          e.response.data.error_message,
      );
    }
  }

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) addUser();
  };

  const handleRemoveConfirmationOpen = (props) => {
    setCurrUser(props);
    setRemoveConfirmation(true);
  };

  const handleRemoveConfirmationClose = () => {
    setRemoveConfirmation(false);
  };

  const handleAddRowClose = () => {
    // document.getElementById("add-user-row").style["display"] = "none";
    // document.getElementById("add-user-name").value = "";
    // document.getElementById("add-user-zone").value = localZoneName;
    // document.getElementById("add-user-type").value = "rodsuser";
    setAddRowOpen(false);
    setNewUserData(initialAddData);
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

  const handleFilterChange = (e) => {
    setFilterName(e.target.value);
  };

  useEffect(() => {
    loadUsers(
      perPage * (currPage - 1),
      perPage,
      order,
      orderBy,
      filterUsername,
    );
    environment.pageTitle = environment.usersTitle;
    document.title = `${environment.titleFormat()}`;
  }, [
    currPage,
    perPage,
    order,
    orderBy,
    environment,
    filterUsername,
    loadUsers,
  ]);

  useEffect(() => {
    if (!userContext || userContext.rows.length === 0) {
      return;
    }
    setUserData(userContext.rows);
  }, [userContext]);

  useEffect(() => {
    if (firstUpdate.current) {
      // don't run on initial render
      firstUpdate.current = false;
      return;
    }
    if (!filterUsername) {
      // when the user clears out the filter, immediately load all users back
      loadUsers(perPage * (currPage - 1), perPage, order, orderBy, "");
      setTime(0);
      setIsRunning(false);
      return;
    }
    if (!isRunning) {
      // start timer because the user typed again
      setTime(0);
      setIsRunning(true);
    } else {
      // timer is already running, reset the timer b/c we're starting delay from last keystroke
      setTime(0);
      setIsRunning(true);
    }
  }, [filterUsername, currPage, isRunning, order, orderBy, perPage, loadUsers]);

  useEffect(() => {
    if (!userContext || userContext.rows.length === 0) return; // safety check

    if (time < delayTimeUse) {
      // filter on frontend since timer has not reached a delay limit yet
      const filteredUsers = userContext.rows.filter(
        (user) =>
          user[0].toLowerCase().includes(filterUsername.toLowerCase()) ||
          user[2].toLowerCase().includes(filterUsername.toLowerCase()) ||
          user[1].toLowerCase().includes(filterUsername.toLowerCase()),
      );

      setUserData(filteredUsers);
    } else {
      // call the API and stop the timer
      loadUsers(
        perPage * (currPage - 1),
        perPage,
        order,
        orderBy,
        filterUsername,
      );
      setTime(0);
      setIsRunning(false);
    }
  }, [
    loadUsers,
    time,
    currPage,
    delayTimeUse,
    filterUsername,
    order,
    orderBy,
    perPage,
    userContext,
  ]);

  return (
    <Fragment>
      {!userContext || (userContext && userContext.rows.length === 0) ? (
        <div>
          Cannot load user data. Please check your iRODS Client HTTP API
          endpoint connection.
        </div>
      ) : (
        <Fragment>
          <div style={styles.filterGroup}>
            <input
              type="text"
              style={styles.filter}
              id="filter-term"
              placeholder="Filter by User Name, Zone, or Type"
              onChange={handleFilterChange}
              value={filterUsername}
            />
            <button
              className="outlined_button"
              style={styles.add_button}
              onClick={() => setAddRowOpen(true)}
            >
              Add New User
            </button>
          </div>
          <TablePagination
            style={styles.pagination}
            page={currPage - 1}
            count={userTotal}
            rowsPerPage={perPage}
            onPageChange={handlePageChange}
            onChangeRowsPerPage={(e) => {
              setPerPage(e.target.value);
              setCurrPage(1);
              localStorage.setItem(usersPageKey, e.target.value);
            }}
          />
          <div className="outlined_paper" style={styles.tableContainer}>
            <table
              style={{ width: "100%", tableLayout: "fixed" }}
              aria-label="User table"
            >
              <thead>
                <tr>
                  <td style={{ ...styles.table_cell, width: "40%" }}>
                    <TableSortLabel
                      active={orderBy === "USER_NAME"}
                      direction={orderBy === "USER_NAME" ? order : "asc"}
                      onClick={() => {
                        handleSort("USER_NAME");
                      }}
                    >
                      <b>User Name</b>
                    </TableSortLabel>
                  </td>
                  <td style={{ ...styles.table_cell, width: "20%" }}>
                    <TableSortLabel
                      active={orderBy === "USER_ZONE"}
                      direction={orderBy === "USER_ZONE" ? order : "asc"}
                      onClick={() => {
                        handleSort("USER_ZONE");
                      }}
                    >
                      <b>Zone</b>
                    </TableSortLabel>
                  </td>
                  <td style={{ ...styles.table_cell, width: "20%" }}>
                    <TableSortLabel
                      active={orderBy === "USER_TYPE"}
                      direction={orderBy === "USER_TYPE" ? order : "asc"}
                      onClick={() => {
                        handleSort("USER_TYPE");
                      }}
                    >
                      <b>Type</b>
                    </TableSortLabel>
                  </td>
                  <td
                    style={{ ...styles.table_cell, width: "20%" }}
                    align="right"
                  >
                    <b>Action</b>
                  </td>
                </tr>
              </thead>
              <tbody>
                {addRowOpen && (
                  <tr id="add-user-row">
                    <td>
                      <input
                        type="text"
                        style={{
                          ...styles.add_user_name,
                          ...styles.fontInherit,
                        }}
                        id="add-user-name"
                        placeholder="Enter new User Name"
                        value={newUserData.name}
                        onChange={(e) => {
                          setNewUserData({
                            ...newUserData,
                            name: e.target.value,
                          });
                        }}
                        onKeyDown={(event) => handleKeyDown(event)}
                      />
                    </td>
                    <td>
                      <select
                        style={styles.fontInherit}
                        id="add-user-zone"
                        value={newUserData.zone}
                        onChange={(e) => {
                          setNewUserData({
                            ...newUserData,
                            zone: e.target.value,
                          });
                        }}
                        onKeyDown={(event) => handleKeyDown(event)}
                      >
                        {zones &&
                          zones.map((zone) => (
                            <option
                              key={`zone-option-${zone.name}`}
                              value={zone.name}
                            >
                              {zone.name}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td>
                      <select
                        style={styles.fontInherit}
                        id="add-user-type"
                        value={newUserData.type}
                        onChange={(e) => {
                          setNewUserData({
                            ...newUserData,
                            type: e.target.value,
                          });
                        }}
                        onKeyDown={(event) => handleKeyDown(event)}
                      >
                        {userTypes.map((this_user_type) => (
                          <option key={this_user_type} value={this_user_type}>
                            {this_user_type}
                          </option>
                        ))}
                      </select>
                    </td>
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
                          onClick={addUser}
                          disabled={newUserData.name === ""}
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

                {userData && userData.length === 0 ? (
                  <tr>
                    <td colSpan={3}>
                      <div className="table_view_no_results_container">
                        No results found for [{filterUsername}].
                      </div>
                    </td>
                  </tr>
                ) : (
                  userData &&
                  userData.map((this_user, index) => (
                    <tr key={index}>
                      <td style={{ ...styles.table_cell, width: "40%" }}>
                        {this_user[0]}
                      </td>
                      <td style={{ ...styles.table_cell, width: "20%" }}>
                        {this_user[2]}
                      </td>
                      <td style={{ ...styles.table_cell, width: "20%" }}>
                        {this_user[1]}
                      </td>
                      <td
                        style={{ ...styles.table_cell, width: "20%" }}
                        align="right"
                      >
                        {" "}
                        {this_user[0] === loggedUserName ||
                        this_user[0] === "public" ? (
                          <p></p>
                        ) : (
                          <span>
                            <Link
                              style={styles.link_button}
                              to="/users/edit"
                              state={{
                                username: this_user[0],
                                userzone: this_user[2],
                              }}
                            >
                              <button>Edit</button>
                            </Link>
                            <button
                              onClick={() => {
                                handleRemoveConfirmationOpen(this_user);
                              }}
                            >
                              Remove
                            </button>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <dialog
            open={addFormOpen}
            onClose={handleAddFormClose}
            aria-labelledby="form-dialog-title"
          >
            <h2>Adding New User</h2>
            <div>
              <b>Error Message:</b>
              <p style={styles.errorMsg}>{addErrorMsg}</p>
            </div>
            <div>
              <button onClick={handleAddFormClose}>Close</button>
            </div>
          </dialog>
          <dialog
            open={removeConfirmation}
            onClose={handleRemoveConfirmationClose}
            aria-labelledby="form-dialog-title"
          >
            <h2>Warning</h2>
            <div>
              <p>
                Are you sure to remove <b>{currUser[0]}</b>?
              </p>
              <p style={styles.errorMsg}>{removeErrorMsg}</p>
            </div>
            <div>
              <button onClick={removeUser}>Remove</button>
              <button onClick={handleRemoveConfirmationClose}>Cancel</button>
            </div>
          </dialog>
        </Fragment>
      )}
    </Fragment>
  );
};

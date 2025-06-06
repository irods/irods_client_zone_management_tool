import React, { Fragment, useEffect, useState, useLayoutEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useLocation, Link, Navigate } from "react-router-dom";
import { useEnvironment } from "../contexts";
import { ArrowLeftIcon } from "../components";
import {
  ModifyUserPasswordController,
  ModifyUserTypeController,
} from "../controllers/UserController";
import {
  AddUserToGroupController,
  RemoveUserFromGroupController,
} from "../controllers/GroupController";

const styles = {
  link_button: {
    textDecoration: "none",
  },
  filter_textfield: {
    marginLeft: "2vw",
  },
  add_button: {
    color: "#04bdaf",
  },
  user_info_container: {
    display: "grid",
    gridTemplateColumns: "40% auto",
    gridGap: "15px",
    width: "100%",
    padding: "10px",
    height: "100%",
  },
  user_info: {
    display: "flex",
    flexDirection: "column",
    padding: "0px 20px 20px 20px",
    maxHeight: "100%",
    overflowY: "auto",
  },
  user_table: {
    width: "100%",
    overflowY: "auto",
  },
  margin: {
    margin: 8,
  },
};

export const EditUser = (props) => {
  const auth = localStorage.getItem("zmt-token");
  const loggedUserName = localStorage.getItem("zmt-username");
  const state = useLocation().state;
  const [currentUserName, currentUserZone] =
    state && state.username && state.userzone
      ? [state.username, state.userzone]
      : [undefined, undefined];
  const [isLoading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const { httpApiLocation } = useEnvironment();
  const [groupsOfUser, setGroupsOfUser] = useState([]);
  const [filterGroupName, setFilterName] = useState("");
  const [filterGroupNameResult, setFilterNameResult] = useState();
  const [passwordConfirmation, setPasswordConfirmation] = useState(false);
  const [userType, setUserType] = useState({
    value: "",
    status: "",
  });
  const [password, setPassword] = useState({
    newPassword: "",
    confirmPassword: "",
    showPassword: false,
    showConfirmPassword: false,
    status: "",
  });

  if (!currentUserName || !currentUserZone)
    return <Navigate to="/users" noThrow />;

  useEffect(() => {
    // hide this interface for the current rodsadmin user or user that does not have a name or zone
    if (
      loggedUserName === currentUserName ||
      !currentUserName ||
      !currentUserZone
    ) {
      return <Navigate to="/users" noThrow />;
    }
    axios({
      method: "GET",
      url: `${httpApiLocation}/query`,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${auth}`,
      },
      params: {
        op: "execute_genquery",
        query: `SELECT USER_TYPE WHERE USER_NAME = '${currentUserName}' AND USER_ZONE = '${currentUserZone}'`,
        limit: 100,
        offset: 0,
      },
    })
      .then((res) => {
        // navigate back to /user if the username provided does not exist
        res.data.rows.length > 0 ? (
          setUserType({ ...userType, value: res.data.rows[0][0] })
        ) : (
          <Navigate to="/users" noThrow />
        );
      })
      .catch(() => {
        return <Navigate to="/users" noThrow />;
      });
  }, [userType.value, userType.status]);

  useEffect(() => {
    if (currentUserName) {
      setLoading(true);
      axios({
        method: "GET",
        url: `${httpApiLocation}/query`,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${auth}`,
        },
        params: {
          op: "execute_genquery",
          query: `SELECT USER_GROUP_NAME WHERE USER_NAME = '${currentUserName}' AND USER_GROUP_NAME != '${currentUserName}'`,
          limit: 100,
          offset: 0,
        },
      }).then((res) => {
        setGroupsOfUser(res.data.rows);
        setLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    if (currentUserName) {
      axios({
        method: "GET",
        url: `${httpApiLocation}/query`,
        headers: {
          Authorization: `Bearer ${auth}`,
        },
        params: {
          op: "execute_genquery",
          query: `SELECT USER_NAME WHERE USER_GROUP_NAME LIKE '%${filterGroupName.toUpperCase()}%' AND USER_TYPE = 'RODSGROUP'`,
          limit: 100,
          offset: 0,
          "case-sensitive": 0,
        },
      }).then((res) => {
        setFilterNameResult(res.data.rows);
      });
    }
  }, []);

  async function removeGroupFromUser(group) {
    try {
      await RemoveUserFromGroupController(
        currentUserName,
        currentUserZone,
        group[0],
        httpApiLocation,
      ).then(() => {
        setRefresh(!refresh);
      });
    } catch (e) {
      alert(e);
    }
  }

  async function addGroupToUser(group) {
    try {
      AddUserToGroupController(
        currentUserName,
        currentUserZone,
        group[0],
        httpApiLocation,
      ).then(() => {
        setRefresh(!refresh);
      });
    } catch (e) {
      alert(e);
    }
  }

  const resetPwdHandler = () => {
    if (password.newPassword !== password.confirmPassword) {
      // throw error if two password fields do not match
      setPassword({ ...password, status: "Passwords do not match." });
    } else if (password.newPassword === "" && password.confirmPassword === "") {
      // pop up confirmation dialog if passwords are empty
      setPasswordConfirmation(true);
    } else resetPwd();
  };

  const resetPwd = () => {
    ModifyUserPasswordController(
      currentUserName,
      currentUserZone,
      password.confirmPassword,
      httpApiLocation,
    )
      .then(() => {
        setPasswordConfirmation(false);
        setPassword({
          newPassword: "",
          confirmPassword: "",
          showPassword: false,
          showConfirmPassword: false,
          status: "changed",
        });
      })
      .catch(() => {
        setPassword({
          newPassword: "",
          confirmPassword: "",
          showPassword: false,
          showConfirmPassword: false,
          status: "failed",
        });
      });
  };

  const updateUserType = (newType) => {
    ModifyUserTypeController(
      currentUserName,
      currentUserZone,
      newType,
      httpApiLocation,
    )
      .then(() => {
        setUserType({ value: newType, status: "changed" });
      })
      .catch(() => {
        setUserType({ ...userType, status: "failed" });
      });
  };

  const checkGroup = (group) => {
    for (let i = 0; i < groupsOfUser.length; i++) {
      if (groupsOfUser[i][0] === group[0]) {
        return true;
      }
    }
    return false;
  };

  useLayoutEffect(() => {
    if (passwordConfirmation) document.getElementById("modal").showModal();
    if (!passwordConfirmation && document.getElementById("modal").open)
      document.getElementById("modal").close();
  }, [passwordConfirmation]);

  useEffect(() => {
    if (password.status === "success" || password.status !== "failure") {
      const id = setTimeout(() => {
        setPassword({ ...password, status: "" });
      }, 2000);
      return () => {
        clearTimeout(id);
      };
    }
  }, [password.status]);

  useEffect(() => {
    if (userType.status === "success" || userType.status !== "failure") {
      const id = setTimeout(() => {
        setUserType({ ...userType, status: "" });
      }, 2000);
      return () => {
        clearTimeout(id);
      };
    }
  }, [userType.status]);

  return (
    <Fragment>
      <div>
        <Link to="/users" style={styles.link_button}>
          <button className="icon_button">
            <ArrowLeftIcon />
          </button>
        </Link>
      </div>
      <div style={styles.user_info_container}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div className="outlined_paper" style={styles.user_info}>
            <h2>Basic Information</h2>
            <div style={{ wordWrap: "break-word" }}>
              <p>
                User: {currentUserName}#{currentUserZone}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <label htmlFor="select-user-type" style={{ width: "65%" }}>
                User Type:{" "}
              </label>
              <select
                id="select-user-type"
                style={{ marginLeft: "10px" }}
                value={userType.value}
                onChange={(e) => updateUserType(e.target.value)}
              >
                <option value="rodsuser">rodsuser</option>
                <option value="rodsadmin">rodsadmin</option>
                <option value="groupadmin">groupadmin</option>
              </select>
            </div>
          </div>
          <br />
          <div className="outlined_paper" style={styles.user_info}>
            <h2>Password Management</h2>
            <label htmlFor="user-new-password">Create New Password</label>
            <input
              id="user-new-password"
              type={password.showPassword ? "text" : "password"}
              placeholder="Enter new password here"
              autocomplete="new-password"
              value={password.newPassword}
              onChange={(e) =>
                setPassword({ ...password, newPassword: e.target.value })
              }
            />
            <span style={{ display: "flex", float: "left" }}>
              <input
                id="show-new-password-toggle"
                style={{ cursor: "pointer", width: "5%" }}
                defaultChecked={password.showPassword}
                type="checkbox"
                onClick={() =>
                  setPassword({
                    ...password,
                    showPassword: !password.showPassword,
                  })
                }
              />
              <label htmlFor="show-new-password-toggle">
                toggle visibility
              </label>
            </span>
            <br />
            <label htmlFor="confirm-new-password">Confirm New Password</label>
            <input
              id="confirm-new-password"
              autocomplete="new-password"
              placeholder="Confirm new password here"
              type={password.showConfirmPassword ? "text" : "password"}
              value={password.confirmPassword}
              onChange={(e) =>
                setPassword({
                  ...password,
                  confirmPassword: e.target.value,
                  status: "",
                })
              }
            />
            <span style={{ display: "flex", float: "left" }}>
              <input
                id="show-confirm-new-password-toggle"
                style={{ cursor: "pointer", width: "5%" }}
                defaultChecked={password.showConfirmPassword}
                type="checkbox"
                onClick={() =>
                  setPassword({
                    ...password,
                    showConfirmPassword: !password.showConfirmPassword,
                    status: "",
                  })
                }
              />
              <label htmlFor="show-confirm-new-password-toggle">
                toggle visibility
              </label>
            </span>
            <p id="confirm-new-password-error" style={{ color: "red" }}>
              {password.status === "Passwords do not match."
                ? password.status
                : ""}
            </p>
            <br />
            <button
              style={{ textTransform: "none" }}
              onClick={() => resetPwdHandler()}
            >
              Set Password
            </button>
          </div>
        </div>
        <div>
          <div className="outlined_paper" style={styles.user_info}>
            <h2>User Group Management</h2>
            <div className="edit_filter_bar">
              <label htmlFor="filterGroupName" style={{ width: "35%" }}>
                Find Group
              </label>
              <input
                type="text"
                id="filterGroupName"
                label="Filter"
                placeholder="Filter by Group Name"
                style={styles.filter_textfield}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </div>
            <br />
            <div className="edit_container">
              {filterGroupNameResult && (
                <div className="paper">
                  <table style={styles.user_table} aria-label="simple table">
                    <thead>
                      <tr>
                        <td>
                          <b>Group Name</b>
                        </td>
                        <td align="right">
                          <b>Status</b>
                        </td>
                        <td align="right">
                          <b>Action</b>
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      {filterGroupNameResult.length === 0 ? (
                        <tr>
                          <td colSpan={3}>
                            <div className="table_view_no_results_container">
                              No results found for [{filterGroupName}].
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filterGroupNameResult.map((thisGroup) => (
                          <tr key={thisGroup[0]}>
                            <td component="th" scope="row">
                              {thisGroup[0]}
                            </td>
                            <td align="right">
                              {checkGroup(thisGroup)
                                ? "In group"
                                : "Not in group"}
                            </td>
                            <td align="right">
                              {checkGroup(thisGroup) ? (
                                <button
                                  color="secondary"
                                  onClick={() => {
                                    removeGroupFromUser(thisGroup);
                                  }}
                                >
                                  Remove
                                </button>
                              ) : (
                                <button
                                  style={styles.add_button}
                                  onClick={() => {
                                    addGroupToUser(thisGroup).then();
                                  }}
                                >
                                  Add
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <dialog className="alert success" open={userType.status === "changed"}>
        Success! User type changed to {userType.value}.
      </dialog>
      <dialog className="alert error" open={userType.status === "failed"}>
        Failed to change user type.
      </dialog>
      <dialog className="alert success" open={password.status === "changed"}>
        Success! Password changed.
      </dialog>
      <dialog className="alert error" open={password.status === "failed"}>
        Failed to change password.
      </dialog>
      <dialog
        id="modal"
        onClose={() => setPasswordConfirmation(false)}
        aria-labelledby="password-confirmation-dialog-title"
        aria-describedby="password-confirmation-dialog"
      >
        <h2>WARNING: </h2>
        <div>
          <div>Passwords are empty.</div>
        </div>
        <div>
          <button onClick={() => setPasswordConfirmation(false)}>Cancel</button>
          <button onClick={resetPwd} autoFocus>
            Confirm
          </button>
        </div>
      </dialog>
    </Fragment>
  );
};

EditUser.propTypes = {
  location: PropTypes.any,
};

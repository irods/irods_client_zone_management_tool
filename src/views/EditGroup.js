import React, { Fragment, useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useEnvironment, useServer, useAuthHook } from "../contexts";
import { ArrowLeftIcon } from "../components";
import {
  AddUserToGroupController,
  RemoveUserFromGroupController,
} from "../controllers/GroupController";

const styles = {
  link_button: {
    textDecoration: "none",
  },
  add_button: {
    color: "#04bdaf",
  },
  user_table: {
    width: "100%",
  },
};

export const EditGroup = (props) => {
  const location = useLocation();
  // navigate to a group page if no group info is passed along
  if (!location.state) return <Navigate to="/groups" noThrow />;

  const auth = localStorage.getItem("zmt-token");
  const currentGroup = location.state ? location.state.groupInfo : new Array(2);
  const { localZoneName } = useServer();
  const [isLoading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const { httpApiLocation } = useEnvironment();
  const { logout } = useAuthHook();
  const [usersInGroup, setUsersInGroup] = useState([]);
  const [filterUserName, setFilterName] = useState("");
  const [filterUserNameResult, setFilterNameResult] = useState();

  const loadCurrentGroupInfo = useCallback(() => {
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
        query: `SELECT USER_NAME, USER_TYPE WHERE USER_GROUP_NAME = '${currentGroup[0]}' AND USER_TYPE != 'rodsgroup'`,
        limit: 100,
        offset: 0,
      },
    }).then((res) => {
      if (res.status === 401) logout();
      setUsersInGroup(res.data.rows);
      setLoading(false);
    });
  }, [auth, currentGroup, httpApiLocation]);

  const loadFilteredUsers = useCallback(() => {
    setLoading(true);
    axios({
      method: "GET",
      url: `${httpApiLocation}/query`,
      headers: {
        Authorization: `Bearer ${auth}`,
      },
      params: {
        op: "execute_genquery",
        query: `SELECT USER_NAME, USER_TYPE WHERE USER_NAME LIKE '%${filterUserName.toUpperCase()}%' AND USER_TYPE != 'RODSGROUP'`,
        limit: 10,
        offset: 0,
        "case-sensitive": 0,
      },
    }).then((res) => {
      if (res.status === 401) logout();
      setFilterNameResult(res.data.rows);
      setLoading(false);
    });
  }, [auth, httpApiLocation, filterUserName]);

  async function removeUserFromGroup(user) {
    try {
      await RemoveUserFromGroupController(
        user[0],
        localZoneName,
        currentGroup[0],
        httpApiLocation,
      ).then(() => {
        setRefresh(!refresh);
      });
    } catch (e) {
      alert(e);
    }
  }

  async function addUserToGroup(user) {
    try {
      await AddUserToGroupController(
        user[0],
        localZoneName,
        currentGroup[0],
        httpApiLocation,
      ).then(() => {
        setRefresh(!refresh);
      });
    } catch (e) {
      alert(e);
    }
  }

  const checkUser = (user) => {
    for (let i = 0; i < usersInGroup.length; i++) {
      if (usersInGroup[i][0] === user[0] && usersInGroup[i][1] === user[1]) {
        return true;
      }
    }
    return false;
  };

  const handleFilterUserName = (event) => {
    setFilterName(event.target.value);
  };

  useEffect(() => {
    if (currentGroup[0]) loadCurrentGroupInfo();
  }, [refresh, loadCurrentGroupInfo, currentGroup]);

  useEffect(() => {
    if (currentGroup[0]) loadFilteredUsers();
  }, [loadFilteredUsers, currentGroup]);

  return (
    <Fragment>
      <Link to="/groups" style={styles.link_button}>
        <button className="icon_button">
          <ArrowLeftIcon />
        </button>
      </Link>
      <br />
      <br />
      <b>Current Group:</b> {currentGroup[0]}
      <br />
      <div style={{ width: "100%", justifyItems: "center" }}>
        <div style={{ width: "16em" }} className="edit_filter_bar">
          <p style={{ width: "50%" }}>Find User:</p>
          <input
            type="text"
            id="filterUserName"
            placeholder="Filter by User Name"
            style={styles.filter_textfield}
            onChange={handleFilterUserName}
          />
        </div>
      </div>
      <br />
      <div className="edit_container">
        {filterUserNameResult && (
          <table style={styles.user_table} aria-label="simple table">
            <thead>
              <tr>
                <td>
                  <b>User Name</b>
                </td>
                <td align="right">
                  <b>Type</b>
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
              {filterUserNameResult.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="table_view_no_results_container">
                      No results found for [{filterUserName}].
                    </div>
                  </td>
                </tr>
              ) : (
                filterUserNameResult.map((thisUser) => (
                  <tr key={thisUser[0]}>
                    <td component="th" scope="row">
                      {thisUser[0]}
                    </td>
                    <td align="right">{thisUser[1]}</td>
                    <td align="right">
                      {checkUser(thisUser)
                        ? `Member of ${currentGroup[0]}`
                        : `Not in ${currentGroup[0]}`}
                    </td>
                    <td align="right">
                      {checkUser(thisUser) ? (
                        <button
                          onClick={() => {
                            removeUserFromGroup(thisUser);
                          }}
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          style={styles.add_button}
                          onClick={() => {
                            addUserToGroup(thisUser).then();
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
        )}
      </div>
    </Fragment>
  );
};

EditGroup.propTypes = {
  location: PropTypes.any,
};


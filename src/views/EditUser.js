import React, { Fragment, useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { Link, Navigate } from "react-router-dom";
import { useEnvironment } from "../contexts";
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  DialogActions,
  FormControl,
  FormHelperText,
  InputLabel,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  TableContainer,
  Paper,
  Select,
  Snackbar,
  InputAdornment,
  IconButton,
  Input,
  MenuItem,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import {
  ArrowBack as ArrowBackIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  ModifyUserPasswordController,
  ModifyUserTypeController,
} from "../controllers/UserController";
import {
  AddUserToGroupController,
  RemoveUserFromGroupController,
} from "../controllers/GroupController";

const useStyles = makeStyles((theme) => ({
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
  margin: {
    margin: theme.spacing(1),
  },
}));

export const EditUser = (props) => {
  // navigate to the login page if no token is found
  if (!localStorage.getItem("zmt-token")) return <Navigate to="/" noThrow />;

  const auth = localStorage.getItem("zmt-token");
  const loggedUserName = localStorage.getItem("zmt-username");
  console.log(props);
  const params = new URLSearchParams(location.search);
  const [currentUserName, currentUserZone] = params.get("user")
    ? params.get("user").split("#")
    : [undefined, undefined];
  const classes = useStyles();
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
  }, [
    currentUserName,
    auth,
    currentUserZone,
    httpApiLocation,
    loggedUserName,
    userType,
  ]);

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
  }, [auth, currentUserName, httpApiLocation]);

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
  }, [auth, httpApiLocation, filterGroupName, currentUserName]);

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

  return (
    <Fragment>
      {isLoading === true ? (
        <div>
          <LinearProgress />
        </div>
      ) : (
        <div className="table_view_spinner_holder" />
      )}
      <div>
        <Link to="/users" className={classes.link_button}>
          <Button>
            <ArrowBackIcon />
          </Button>
        </Link>
      </div>
      <div className={classes.user_info_container}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Paper className={classes.user_info}>
            <h2>Basic Information</h2>
            <div style={{ wordWrap: "break-word" }}>
              <Typography>
                User: {currentUserName}#{currentUserZone}
              </Typography>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Typography>User Type: </Typography>
              <Select
                style={{ marginLeft: "10px" }}
                value={userType.value}
                onChange={(e) => updateUserType(e.target.value)}
              >
                <MenuItem value="rodsuser">rodsuser</MenuItem>
                <MenuItem value="rodsadmin">rodsadmin</MenuItem>
                <MenuItem value="groupadmin">groupadmin</MenuItem>
              </Select>
            </div>
          </Paper>
          <br />
          <Paper className={classes.user_info}>
            <h2>Password Management</h2>
            <FormControl className={classes.margin}>
              <InputLabel htmlFor="user-new-password">
                Create New Password
              </InputLabel>
              <Input
                id="user-new-password"
                type={password.showPassword ? "text" : "password"}
                value={password.newPassword}
                onChange={(e) =>
                  setPassword({ ...password, newPassword: e.target.value })
                }
                endAdornment={
                  password.newPassword !== "" && (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() =>
                          setPassword({
                            ...password,
                            showPassword: !password.showPassword,
                          })
                        }
                      >
                        {password.showPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  )
                }
              />
            </FormControl>
            <br />
            <FormControl
              error={password.status === "Passwords do not match."}
              className={classes.margin}
            >
              <InputLabel htmlFor="confirm-new-password">
                Confirm New Password
              </InputLabel>
              <Input
                id="confirm-new-password"
                type={password.showConfirmPassword ? "text" : "password"}
                value={password.confirmPassword}
                onChange={(e) =>
                  setPassword({ ...password, confirmPassword: e.target.value })
                }
                endAdornment={
                  password.confirmPassword !== "" && (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() =>
                          setPassword({
                            ...password,
                            showConfirmPassword: !password.showConfirmPassword,
                          })
                        }
                      >
                        {password.showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  )
                }
              />
              <FormHelperText id="confirm-new-password-error">
                {password.status === "Passwords do not match."
                  ? password.status
                  : ""}
              </FormHelperText>
            </FormControl>
            <br />
            <Button
              variant="outlined"
              color="primary"
              style={{ textTransform: "none" }}
              onClick={() => resetPwdHandler()}
            >
              Set Password
            </Button>
          </Paper>
        </div>
        <div>
          <Paper className={classes.user_info}>
            <h2>User Group Management</h2>
            <div className="edit_filter_bar">
              <Typography>Find Group</Typography>
              <TextField
                id="filterGroupName"
                label="Filter"
                placeholder="Filter by Group Name"
                className={classes.filter_textfield}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </div>
            <br />
            <div className="edit_container">
              {filterGroupNameResult && (
                <TableContainer component={Paper}>
                  <Table
                    className={classes.user_table}
                    aria-label="simple table"
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <b>Group Name</b>
                        </TableCell>
                        <TableCell align="right">
                          <b>Status</b>
                        </TableCell>
                        <TableCell align="right">
                          <b>Action</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filterGroupNameResult.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3}>
                            <div className="table_view_no_results_container">
                              No results found for [{filterGroupName}].
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filterGroupNameResult.map((thisGroup) => (
                          <TableRow key={thisGroup[0]}>
                            <TableCell component="th" scope="row">
                              {thisGroup[0]}
                            </TableCell>
                            <TableCell align="right">
                              {checkGroup(thisGroup)
                                ? "In group"
                                : "Not in group"}
                            </TableCell>
                            <TableCell align="right">
                              {checkGroup(thisGroup) ? (
                                <Button
                                  color="secondary"
                                  onClick={() => {
                                    removeGroupFromUser(thisGroup);
                                  }}
                                >
                                  Remove
                                </Button>
                              ) : (
                                <Button
                                  className={classes.add_button}
                                  onClick={() => {
                                    addGroupToUser(thisGroup).then();
                                  }}
                                >
                                  Add
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </div>
          </Paper>
        </div>
      </div>
      <Snackbar
        open={userType.status === "changed"}
        autoHideDuration={5000}
        onClose={() => setUserType({ ...userType, status: "" })}
      >
        <Alert elevation={6} variant="filled" severity="success">
          Success! User type changed to {userType.value}.
        </Alert>
      </Snackbar>
      <Snackbar
        open={userType.status === "failed"}
        autoHideDuration={5000}
        onClose={() => setUserType({ ...userType, status: "" })}
      >
        <Alert elevation={6} variant="filled" severity="error">
          Failed to change user type.
        </Alert>
      </Snackbar>
      <Snackbar
        open={password.status === "changed"}
        autoHideDuration={5000}
        onClose={() => setPassword({ ...password, status: "" })}
      >
        <Alert elevation={6} variant="filled" severity="success">
          Success! Password changed.
        </Alert>
      </Snackbar>
      <Snackbar
        open={password.status === "failed"}
        autoHideDuration={5000}
        onClose={() => setPassword({ ...password, status: "" })}
      >
        <Alert elevation={6} variant="filled" severity="error">
          Failed to change password.
        </Alert>
      </Snackbar>
      <Dialog
        open={passwordConfirmation}
        onClose={() => setPasswordConfirmation(false)}
        aria-labelledby="password-confirmation-dialog-title"
        aria-describedby="password-confirmation-dialog"
      >
        <DialogTitle>WARNING: </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <div>Passwords are empty.</div>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="secondary"
            onClick={() => setPasswordConfirmation(false)}
          >
            Cancel
          </Button>
          <Button color="primary" onClick={() => resetPwd()} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

EditUser.propTypes = {
  location: PropTypes.any,
};


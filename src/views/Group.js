import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { Link } from 'react-router-dom'

import { BlockIcon } from '@material-ui/icons';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import Appbar from '../components/Appbar';
import Sidebar from '../components/Sidebar';
import Cookies from 'js-cookie';
import { LinearProgress } from '@material-ui/core';
import { makeStyles, Tab, Typography } from '@material-ui/core';
import { Button, Checkbox, FormControl, TextField, InputLabel, Select } from '@material-ui/core';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@material-ui/core';

import { useAuth } from '../contents/AuthContent';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    toolbar: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(3),
    },
    main: {
        whiteSpace: "pre-wrap",
        fontSize: 20
    },
    logout: {
        marginTop: theme.spacing(20),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontSize: theme.spacing(3)
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        minWidth: 200
    },
    link_button: {
        textDecoration: 'none'
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120
    },
    table: {
        minWidth: 650
    },
    user_table: {
        maxWidth: 650
    },
    tableContainer: {
        marginTop: 20
    },
    errorMsg: {
        color: 'red'
    }
}));

function Group() {
    const classes = useStyles();
    const auth = useAuth();
    const token = auth.token;

    const [isLoading, setLoading] = useState(false);

    const [zones, setZone] = useState([]);

    const [errorMsg, setErrorMsg] = useState();
    const [addFormOpen, setAddFormOpen] = useState(false);
    const [editFormOpen, setEditFormOpen] = useState(false);
    const [addGroupName, setAddGroupName] = useState();
    const [addGroupZoneName, setAddGroupZoneName] = useState();
    const [addGroupUsers, setAddGroupUsers] = useState([]);
    const [groups, setGroup] = useState([]);
    const [users, setUsers] = useState([]);
    const [userThisGroup, setUserThisGroup] = useState([]);
    const [userNotThisGroup, setUserNotThisGroup] = useState([]);
    const [currGroup, setCurrGroup] = useState([]);
    const [removeThisUserName, setRemoveUserName] = useState();
    const [removeThisUserZone, setRemoveUserZone] = useState();


    const [searchUserName, setSearchName] = useState();
    const [searchUserNameResult, setSearchNameResult] = useState([]);
    let group_id = 0;
    let user_id = 0;
    let user_id_edit = 0;
    const isAuthenticated = token != null ? true : false;

    useEffect(() => {
        const result = axios({
            method: 'GET',
            url: 'http://54.210.60.122:80/irods-rest/1.0.0/query',
            headers: {
                'Authorization': token
            },
            params: {
                query_string: "SELECT USER_NAME, USER_TYPE, USER_ZONE WHERE USER_TYPE = 'rodsgroup'",
                query_limit: 100,
                row_offset: 0,
                query_type: 'general'
            }
        }).then(res => {
            setGroup(res.data._embedded);
        });

        const zoneResult = axios({
            method: 'GET',
            url: 'http://54.210.60.122:80/irods-rest/1.0.0/query',
            headers: {
                'Authorization': token
            },
            params: {
                query_string: 'SELECT ZONE_NAME',
                query_limit: 100,
                row_offset: 0,
                query_type: 'general'
            }
        }).then(res => {
            setZone(res.data._embedded);
        });
    }, [isAuthenticated, isLoading])

    useEffect(() => {
        const searchResult = axios({
            method: 'GET',
            url: 'http://54.210.60.122:80/irods-rest/1.0.0/query',
            headers: {
                'Authorization': token,
            },
            params: {
                query_string: `SELECT USER_NAME, USER_ZONE WHERE USER_NAME LIKE '%${searchUserName}%' AND USER_TYPE = 'rodsuser'`,
                query_limit: 5,
                row_offset: 0,
                query_type: 'general'
            }
        }).then(res => {
            setSearchNameResult(res.data._embedded);
        })
    }, [searchUserName])


    async function addGroup() {
        try {
            const addGroupResult = await axios({
                method: 'POST',
                url: 'http://54.210.60.122:80/irods-rest/1.0.0/admin',
                params: {
                    action: 'add',
                    target: 'user',
                    arg2: addGroupName,
                    arg3: 'rodsgroup',
                    arg4: addGroupZoneName,
                    arg5: ''
                },
                headers: {
                    'Authorization': token,
                    'Accept': 'application/json'
                }
            }).then(res => {
                window.location.reload();
                console.log(res);
            })
        }
        catch (e) {
            setErrorMsg("Cannot add new group. Please check your group name or zone name.")
            console.log(e);
        }
    }

    async function editGroup() {
        setLoading(true);
        const result = axios({
            method: 'GET',
            url: 'http://54.210.60.122:80/irods-rest/1.0.0/query',
            headers: {
                'Accept': 'application/json',
                'Authorization': token
            },
            params: {
                query_string: `SELECT USER_NAME, USER_TYPE, USER_ZONE WHERE USER_GROUP_NAME = '${currGroup[0]}'`,
                query_limit: 100,
                row_offset: 0,
                query_type: 'general'
            }
        }).then(res => {
            if (res.data.count !== '1') {
                console.log(res.data._embedded)
                let notAttachedUsers = [...users];
                let attachedUsers = res.data._embedded.slice(1, res.data._embedded.length);
                attachedUsers.forEach(user => {
                    let _index = notAttachedUsers.indexOf([user[0], user[1], user[2]]);
                    console.log(_index);
                    notAttachedUsers.splice(_index, _index + 1);
                    console.log(notAttachedUsers);
                })
                setUserThisGroup(attachedUsers);
            }
            else {
                setUserThisGroup([]);
            }
            setLoading(false);
        })
    }
    async function removeUserFromGroup() {
        try {
            const removeUserResult = await axios({
                method: 'POST',
                url: 'http://54.210.60.122:80/irods-rest/1.0.0/admin',
                params: {
                    action: 'modify',
                    target: 'group',
                    arg2: currGroup[0],
                    arg3: 'remove',
                    arg4: removeThisUserName,
                    arg5: removeThisUserZone
                },
                headers: {
                    'Authorization': token,
                    'Accept': 'application/json'
                }
            }).then(res => {
                window.location.reload();
                console.log(res);
            })
        } catch (e) {
            console.log(e);
        }
    }

    async function addUserToGroup(props) {
        try {
            await axios({
                method: 'POST',
                url: 'http://54.210.60.122:80/irods-rest/1.0.0/admin',
                params: {
                    action: 'modify',
                    target: 'group',
                    arg2: currGroup[0],
                    arg3: 'add',
                    arg4: props[0],
                    arg5: props[1]
                },
                headers: {
                    'Authorization': token,
                    'Accept': 'application/json'
                }
            }).then(res => {
                console.log(res);
            })
        }
        catch (e) {
            console.log(e);
        }
    }

    async function removeGroup() {
        try {
            const addGroupResult = await axios({
                method: 'POST',
                url: 'http://54.210.60.122:80/irods-rest/1.0.0/admin',
                params: {
                    action: 'rm',
                    target: 'user',
                    arg2: currGroup[0],
                    arg3: currGroup[2],
                },
                headers: {
                    'Authorization': token,
                    'Accept': 'application/json'
                }
            }).then(res => {
                console.log(res);
                window.location.reload();
            })
        } catch (e) {
            console.log(e);
        }
    }

    const handlecurrentGroup = event => {
        if (event.target.id !== '') {
            setCurrGroup(groups[event.target.id]);
            console.log(groups[event.target.id]);
        }
    }

    const selectUser = event => {
        let _index = addGroupUsers.indexOf(users[event.target.id]);
        if (_index == -1) {
            let addArray = [...addGroupUsers];
            addArray.push(users[event.target.id]);
            setAddGroupUsers(addArray);
        }
        else {
            const oldArray = [...addGroupUsers];
            const newArray = oldArray.filter(user => {
                return user[0] != users[event.target.id][0];
            })
            setAddGroupUsers(newArray);
        }
    }

    const handleremoveUserFromGroup = event => {
        if (event.target.id !== undefined && event.target.id !== '') {
            console.log(event.target.id);
            setRemoveUserName(event.target.id);
        }
        if (event.target.name !== undefined) {
            console.log(event.target.name);
            setRemoveUserZone(event.target.name);
        }
    }

    const handleSearchUserName = event => {
        setSearchName(event.target.value);
    }

    const handleAddFormOpen = () => {
        setAddFormOpen(true);
    }

    const handleAddFormClose = () => {
        setAddFormOpen(false);
    }

    const handleEditFormOpen = () => {
        editGroup();
        setEditFormOpen(true);
    }

    const handleEditFormClose = () => {
        setEditFormOpen(false);
    }

    const handleAddGroupName = event => {
        setAddGroupName(event.target.value);
    }

    const handleAddZoneName = event => {
        setAddGroupZoneName(event.target.value);
    }

    return (
        <div>
            {isAuthenticated == true ? <div className={classes.root}>
                <Appbar />
                <Sidebar />
                <main className={classes.content}>
                    <div className={classes.toolbar} />
                    <div className={classes.main}>
                        <Button variant="outlined" color="primary" onClick={handleAddFormOpen}>
                            Add New Group
                        </Button>
                        <TableContainer className={classes.tableContainer} component={Paper}>
                            <Table className={classes.table} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><b>Group Name</b></TableCell>
                                        <TableCell align="right"><b>Zone</b></TableCell>
                                        <TableCell align="right"><b>Action</b></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {groups.map(group =>
                                        <TableRow key={group_id}>
                                            <TableCell component="th" scope="row">{group[0]}</TableCell>
                                            <TableCell align="right">{group[2]}</TableCell>
                                            <TableCell align='right'><Link className={classes.link_button} to={{ pathname: '/group/edit', groupInfo: group }}><Button color="primary">Edit</Button></Link> {group[0] == 'public' ? <span id={group_id++}></span> : <Button id={group_id++} color="secondary" onMouseOver={handlecurrentGroup} onClick={removeGroup}>Remove</Button>}</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Dialog open={addFormOpen} className={classes.formContainer} onClose={handleAddFormClose} aria-labelledby="form-dialog-title">
                            <DialogTitle>Add New Group</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    Enter your group and zone name:
                                </DialogContentText>
                                <form className={classes.container}>
                                    <FormControl className={classes.formControl}>
                                        <TextField
                                            native
                                            id="name"
                                            label="Group Name"
                                            onChange={handleAddGroupName}
                                        />
                                    </FormControl>
                                    <FormControl className={classes.formControl}>
                                        <InputLabel htmlFor="group-zone-select">Zone Name</InputLabel>
                                        <Select
                                            native
                                            id="zone"
                                            label="Zone Name"
                                            onChange={handleAddZoneName}
                                        >
                                        <option value="" selected disabled></option>
                                        {zones.map(zone => <option value={zone[0]}>{zone[0]}</option>)}
                                        </Select>
                                    </FormControl>
                                </form>
                                <br />
                                <p className={classes.errorMsg}>{errorMsg}</p>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={addGroup} color="primary">Save</Button>
                                <Button onClick={handleAddFormClose} color="primary">Cancel</Button>
                            </DialogActions>
                        </Dialog>
                        {isLoading == true ? <div><LinearProgress /></div> :
                            <Dialog open={editFormOpen} onClose={handleEditFormClose} fullScreen="true" aria-labelledby="form-dialog-title">
                                <DialogTitle><Button size="large" onClick={handleEditFormClose}><ArrowBackIcon /></Button>Edit Group</DialogTitle>
                                <DialogContent>
                                    {currGroup.length > 0 ? <DialogContentText>Group Name: {currGroup[0]}</DialogContentText> : <br />}
                                    <form className={classes.container}>
                                        <FormControl className={classes.formControl}>
                                            {userThisGroup.length}
                                            <Typography>Attached Users: </Typography>
                                            <Table className={classes.user_table} aria-label="simple table">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell><b>User Name</b></TableCell>
                                                        <TableCell align="right"><b>Zone</b></TableCell>
                                                        <TableCell align="right"><b>Action</b></TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                {userThisGroup.length > 0 ? <TableBody>
                                                    {userThisGroup.map(userThisGroup => <TableRow>
                                                        <TableCell component="th" scope="row">{userThisGroup[0]}</TableCell>
                                                        <TableCell align="right">{userThisGroup[2]}</TableCell>
                                                        <TableCell align='right'><Button id={userThisGroup[0]} name={userThisGroup[2]} color="secondary" onMouseOver={handleremoveUserFromGroup} onClick={removeUserFromGroup}>Remove</Button></TableCell>
                                                    </TableRow>)}
                                                </TableBody> : <br />}
                                            </Table>
                                            <br />
                                            <Typography>Add Users: </Typography>
                                            <FormControl className={classes.formControl}>
                                                <TextField
                                                    native
                                                    id="searchUserName"
                                                    label="User Name"
                                                    onChange={handleSearchUserName}
                                                />
                                            </FormControl>
                                            {searchUserNameResult.length > 0 ? <TableBody>
                                                {searchUserNameResult.map(userResult => <TableRow>
                                                    <TableCell component="th" scope="row">{userResult[0]}</TableCell>
                                                    <TableCell align="right">{userResult[1]}</TableCell>
                                                    <TableCell align='right'><Button color="secondary" onClick={() => addUserToGroup(userResult)}>Add</Button></TableCell>
                                                </TableRow>)}
                                            </TableBody> : <br />}
                                        </FormControl>
                                    </form>
                                    <p className={classes.errorMsg}>{ }</p>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={addUserToGroup} color="primary">Save</Button>
                                    <Button onClick={handleEditFormClose} color="primary">Cancel</Button>
                                </DialogActions>
                            </Dialog>}
                    </div>
                </main>
            </div> : <div className={classes.logout}><BlockIcon /><br /><div>Please <a href="http://localhost:3000/">login</a> to use the administration dashboard.</div></div>
            }
        </div >
    );
}

export default Group;
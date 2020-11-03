import React, { useState, useEffect } from 'react';
import axios from 'axios';

import BlockIcon from '@material-ui/icons/Block';

import Appbar from './Appbar';
import Sidebar from './Sidebar';
import Cookies from 'js-cookie';
import { makeStyles, Typography } from '@material-ui/core';
import { Button, Checkbox, FormControl, TextField, InputLabel } from '@material-ui/core';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@material-ui/core';

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
    formContainer: {
        Width: 700
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
    const token = Cookies.get('token');
    const [addFormOpen, setAddFormOpen] = useState(false);
    const [addGroupName, setAddGroupName] = useState();
    const [addGroupZoneName, setAddGroupZoneName] = useState();
    const [addGroupUsers, setAddGroupUsers] = useState([]);
    const [groups, setGroup] = useState([]);
    const [users, setUsers] = useState([]);
    const [currGroup, setCurrGroup] = useState();
    let group_id = 0;
    let user_id = 0;
    const isAuthenticated = token != null ? true : false;

    useEffect(() => {
        const result = axios({
            method: 'GET',
            url: 'http://54.210.60.122:80/irods-rest/1.0.0/query',
            headers: {
                'Authorization': token
            },
            params: {
                query_string: 'SELECT USER_NAME, USER_TYPE, USER_ZONE',
                query_limit: 100,
                row_offset: 0,
                query_type: 'general'
            }
        }).then(res => {
            let groupArray = [];
            let userArray = [];
            res.data['_embedded'].forEach(group => {
                if (group[1] == 'rodsgroup') {
                    groupArray.push([group[0], group[2]]);
                }
                else {
                    userArray.push([group[0], group[1], group[2]])
                }
            })
            setUsers(userArray);
            setGroup(groupArray);
        })
    }, [isAuthenticated])

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
                console.log(res);
            }).then(res => {
                if (addGroupUsers.length > 0) {
                    addGroupUsers.forEach(user => {
                        const addUserResult = axios({
                            method: 'POST',
                            url: 'http://54.210.60.122:80/irods-rest/1.0.0/admin',
                            params: {
                                action: 'modify',
                                target: 'group',
                                arg2: addGroupName,
                                arg3: 'add',
                                arg4: user[0],
                                arg5: user[2]
                            },
                            headers: {
                                'Authorization': token,
                                'Accept': 'application/json'
                            }
                        })
                    }).then(res => {
                        console.log(res);
                    })
                }
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
                    arg2: addGroupName,
                    arg3: addGroupZoneName,
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
        setCurrGroup(groups[event.target.id]);
    }

    const selectUser = event => {
        let _index = addGroupUsers.indexOf(users[event.target.id]);
        if (_index == -1) {
            let addArray = [...addGroupUsers];
            addArray.push(users[event.target.id]);
            setAddGroupUsers(addArray);
        }
        else {
            console.log("else")
            const oldArray = [...addGroupUsers];
            const newArray = oldArray.filter(user => {
                return user[0] != users[event.target.id][0];
            })
            setAddGroupUsers(newArray);
        }
    }

    const handleAddFormOpen = () => {
        setAddFormOpen(true);
    }

    const handleAddFormClose = () => {
        setAddFormOpen(false);
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
                                            <TableCell align="right">{group[1]}</TableCell>
                                            <TableCell align='right'><Button id={group_id} color="primary" id={group_id} onMouseOver={handlecurrentGroup}>Edit</Button>{group[0] == 'public' ? <span></span> : <Button id={group_id++} color="secondary" onMouseOver={handlecurrentGroup}>Remove</Button>}</TableCell>
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
                                        <TextField
                                            native
                                            id="zone"
                                            label="Zone Name"
                                            onChange={handleAddZoneName}
                                        />
                                    </FormControl>
                                </form>
                                <br />
                                <DialogContentText>Add users to group: </DialogContentText>
                                <Table className={classes.user_table} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><b>User Name</b></TableCell>
                                            <TableCell align="right"><b>User Type</b></TableCell>
                                            <TableCell align="right"><b>Zone</b></TableCell>
                                            <TableCell align="right"><b>Action</b></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {users.map(user =>
                                            <TableRow key={user_id}>
                                                <TableCell component="th" scope="row">{user[0]}</TableCell>
                                                <TableCell align="right">{user[1]}</TableCell>
                                                <TableCell align="right">{user[2]}</TableCell>
                                                <TableCell align='right'><Checkbox id={user_id++} color="primary" onClick={selectUser} /></TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                                <p className={classes.errorMsg}>{}</p>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={addGroup} color="primary">Save</Button>
                                <Button onClick={handleAddFormClose} color="primary">Cancel</Button>
                            </DialogActions>
                        </Dialog>
                        {/* <Dialog open={editFormOpen} onClose={handleEditFormClose} aria-labelledby="form-dialog-title">
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogContent>
                                <form className={classes.container}>
                                    <FormControl className={classes.formControl}>
                                        <InputLabel htmlFor="user-type-select">User Type</InputLabel>
                                        <Select
                                            native
                                            id="user-type-select"
                                            defaultValue={currUser[1]}
                                            onChange={handleEditUserType}
                                        >
                                            <option aria-label="None" value="" />
                                        </Select>
                                    </FormControl>
                                </form>
                                <p className={classes.errorMsg}>{editErrorMessage}</p>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={editUser} color="primary">Save</Button>
                                <Button onClick={handleEditFormClose} color="primary">Cancel</Button>
                            </DialogActions>
                        </Dialog> */}
                    </div>
                </main>
            </div> : <div className={classes.logout}><BlockIcon /><br /><div>Please <a href="http://localhost:3000/">login</a> to use the administration dashboard.</div></div>
            }
        </div >
    );
}

export default Group;
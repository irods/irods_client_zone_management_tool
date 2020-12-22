import React, { useState, useEffect } from 'react';
import { Link } from '@reach/router';
import axios from 'axios';

import BlockIcon from '@material-ui/icons/Block';

import Appbar from '../components/Appbar';
import Sidebar from '../components/Sidebar';
import Cookies from 'js-cookie';
import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { FormControl, InputLabel, Typography } from '@material-ui/core';
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
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120
    },
    table: {
        minWidth: 650
    },
    tableContainer: {
        marginTop: 20
    },
    errorMsg: {
        color: 'red'
    },
    link_button: {
        textDecoration: 'none'
    }
}));

function User() {
    const classes = useStyles();
    const auth = useAuth();
    const token = auth.token;
    console.log(token);
    const [users, setUsers] = useState([]);
    const [currUser, setCurrUser] = useState([]);
    const [addFormOpen, setAddFormOpen] = useState(false);
    const [addErrorMessage, setAddError] = useState();
    const [addName, setAddName] = useState();
    const [addUser_type, setAddUserType] = useState();
    const [addZone_name, setAddZoneName] = useState();
    const [removeConfirmation, setRemoveConfirmation] = useState(false);
    const [zones, setZone] = useState([]);
    const isAuthenticated = token != null ? true : false;

    useEffect(() => {
        const result = axios({
            method: 'GET',
            url: 'http://54.210.60.122:80/irods-rest/1.0.0/query',
            headers: {
                'Authorization': token,
                'Accept': 'application/json'
            },
            params: {
                query_string: "SELECT USER_NAME, USER_TYPE, USER_ZONE WHERE USER_TYPE = 'rodsuser'",
                query_limit: 100,
                row_offset: 0,
                query_type: 'general'
            }

        }).then(res => {
            setUsers(res.data['_embedded']);
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
    }, [])

    async function addUser() {
        console.log(addUser_type);
        console.log(addZone_name);
        console.log(addName);
        try {
            await axios({
                method: 'POST',
                url: 'http://54.210.60.122:80/irods-rest/1.0.0/admin',
                headers: {
                    'Authorization': token
                },
                params: {
                    action: 'add',
                    target: 'user',
                    arg2: addName,
                    arg3: addUser_type,
                    arg4: addZone_name,
                    arg5: '',
                }
            }).then(res => {
                console.log(res);
                window.location.reload();
            })
        } catch (e) {
            setAddError("Error when adding new user. Please check the input.")
        }
    }

    async function removeUser() {
        try {
            await axios({
                method: 'POST',
                url: 'http://54.210.60.122:80/irods-rest/1.0.0/admin',
                headers: {
                    'Authorization': token
                },
                params: {
                    action: 'rm',
                    target: 'user',
                    arg2: currUser[0],
                    arg3: currUser[2]
                }
            }).then(res => {
                window.location.reload();
            })
        } catch (e) {

        }
    }

    const handleAddUserType = event => {
        setAddUserType(event.target.value);
    }

    const handleAddUserName = event => {
        setAddName(event.target.value);
    }

    const handleAddZoneName = event => {
        setAddZoneName(event.target.value);
    }

    const handleRemoveConfirmationOpen = props => {
        setCurrUser(props);
        setRemoveConfirmation(true);
    }

    const handleRemoveConfirmationClose = () => {
        setRemoveConfirmation(false);
    }

    const handleAddFormOpen = () => {
        setAddFormOpen(true);
    }

    const handleAddFormClose = () => {
        setAddFormOpen(false);
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
                            Add New User
                        </Button>
                        <TableContainer className={classes.tableContainer} component={Paper}>
                            <Table className={classes.table} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><b>Username</b></TableCell>
                                        <TableCell align="right"><b>Type</b></TableCell>
                                        <TableCell align="right"><b>Zone</b></TableCell>
                                        <TableCell align="right"><b>Action</b></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map(this_user =>
                                        <TableRow key={this_user[0]}>
                                            <TableCell component="th" scope="row">{this_user[0]}</TableCell>
                                            <TableCell align="right">{this_user[1]}</TableCell>
                                            <TableCell align="right">{this_user[2]}</TableCell>
                                            <TableCell align="right"> {(this_user[0] == 'rods' || this_user[0] == 'public') ? <p></p> : <span><Link className={classes.link_button} to='/user/edit' state={{ userInfo: this_user }}><Button color="primary">Edit</Button></Link>
                                                <Button color="secondary" onClick={() => { handleRemoveConfirmationOpen(this_user) }}>Remove</Button></span>}</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Dialog open={addFormOpen} onClose={handleAddFormClose} aria-labelledby="form-dialog-title">
                            <DialogTitle>Add New User</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    You can add a new user there.
                                </DialogContentText>
                                <form className={classes.container}>
                                    <FormControl className={classes.formControl}>
                                        <TextField
                                            native
                                            id="name"
                                            label="Username"
                                            onChange={handleAddUserName}
                                        />
                                    </FormControl>
                                    <FormControl className={classes.formControl}>
                                        <InputLabel htmlFor="user-type-select">Zone Name</InputLabel>
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
                                    <FormControl className={classes.formControl}>
                                        <InputLabel htmlFor="user-type-select">User Type</InputLabel>
                                        <Select
                                            native
                                            id="user-type-select"
                                            value={addUser_type}
                                            onChange={handleAddUserType}
                                        >
                                            <option aria-label="None" value="" />
                                            <option value="rodsadmin">rodsadmin</option>
                                            <option value="groupadmin">groupadmin</option>
                                            <option value="rodsuser">rodsuser</option>
                                        </Select>
                                    </FormControl>
                                </form>
                                <p className={classes.errorMsg}>{addErrorMessage}</p>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={addUser} color="primary">Save</Button>
                                <Button onClick={handleAddFormClose} color="primary">Cancel</Button>
                            </DialogActions>
                        </Dialog>
                        <Dialog open={removeConfirmation} onClose={handleRemoveConfirmationClose} aria-labelledby="form-dialog-title">
                            <DialogTitle>Warning</DialogTitle>
                            <DialogContent>
                                <Typography>Are you sure to remove <b>{currUser[0]}</b>?</Typography>
                                <p className={classes.errorMsg}>{ }</p>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={removeUser} color="secondary">Remove</Button>
                                <Button onClick={handleRemoveConfirmationClose} color="primary">Cancel</Button>
                            </DialogActions>
                        </Dialog>
                    </div>
                </main>
            </div> : <div className={classes.logout}><BlockIcon /><br /><div>Please <a href="http://localhost:3000/">login</a> to use the administration dashboard.</div></div>}
        </div>
    );
}

export default User;
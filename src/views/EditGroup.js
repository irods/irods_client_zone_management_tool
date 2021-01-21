import React, { useEffect, useState } from 'react';


import axios from 'axios';
import { Link } from '@reach/router';

import BlockIcon from '@material-ui/icons/Block';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';


import Appbar from '../components/Appbar';
import Sidebar from '../components/Sidebar';
import Cookies from 'js-cookie';
import { Button, FormControl, LinearProgress, TextField, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
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
    link_button: {
        textDecoration: 'none'
    }
}));

function EditGroup(props) {
    const currentGroup = props.location.state.groupInfo;
    const classes = useStyles();
    const token = Cookies.get('token');
    const [isLoading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const isAuthenticated = token != null ? true : false;

    const [usersInGroup, setUsersInGroup] = useState([]);
    const [searchUserName, setSearchName] = useState();
    const [searchUserNameResult, setSearchNameResult] = useState([]);

    useEffect(() => {
        setLoading(true);
        const result = axios({
            method: 'GET',
            url: 'http://54.210.60.122:80/irods-rest/1.0.0/query',
            headers: {
                'Accept': 'application/json',
                'Authorization': token
            },
            params: {
                query_string: `SELECT USER_NAME, USER_TYPE, USER_ZONE WHERE USER_GROUP_NAME = '${currentGroup[0]}' AND USER_TYPE != 'rodsgroup'`,
                query_limit: 100,
                row_offset: 0,
                query_type: 'general'
            }
        }).then(res => {
            console.log(res.data._embedded);
            setUsersInGroup(res.data._embedded);
            setLoading(false);
        })
    }, [isAuthenticated, refresh])

    useEffect(() => {
        const searchResult = axios({
            method: 'GET',
            url: 'http://54.210.60.122:80/irods-rest/1.0.0/query',
            headers: {
                'Authorization': token,
            },
            params: {
                query_string: `SELECT USER_NAME, USER_TYPE, USER_ZONE WHERE USER_NAME LIKE '%${searchUserName}%' AND USER_TYPE = 'rodsuser'`,
                query_limit: 3,
                row_offset: 0,
                query_type: 'general'
            }
        }).then(res => {
            setSearchNameResult(res.data._embedded);
        })
    }, [searchUserName])

    async function removeUserFromGroup(props) {
        try {
            const removeUserResult = await axios({
                method: 'POST',
                url: 'http://54.210.60.122:80/irods-rest/1.0.0/admin',
                params: {
                    action: 'modify',
                    target: 'group',
                    arg2: currentGroup[0],
                    arg3: 'remove',
                    arg4: props[0],
                    arg5: props[2]
                },
                headers: {
                    'Authorization': token,
                    'Accept': 'application/json'
                }
            }).then(res => {
                setRefresh(!refresh);
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
                    arg2: currentGroup[0],
                    arg3: 'add',
                    arg4: props[0],
                    arg5: props[2]
                },
                headers: {
                    'Authorization': token,
                    'Accept': 'application/json'
                }
            }).then(res => {
                setRefresh(!refresh);
                console.log(res);
            })
        }
        catch (e) {
            console.log(e);
        }
    }

    const handleSearchUserName = event => {
        setSearchName(event.target.value);
    }

    return (
        <div>
            {isAuthenticated == true ? <div className={classes.root}>
                <Appbar />
                <Sidebar />
                <main className={classes.content}>
                    <div className={classes.toolbar} />
                    <div className={classes.main}>
                        <Link to="/group" className={classes.link_button}><Button><ArrowBackIcon /></Button></Link>
                        {currentGroup[0]}
                        <div>
                            <Table className={classes.user_table} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><b>User Name</b></TableCell>
                                        <TableCell align="right"><b>Type</b></TableCell>
                                        <TableCell align="right"><b>Zone</b></TableCell>
                                        <TableCell align="right"><b>Action</b></TableCell>
                                    </TableRow>
                                </TableHead>
                                {usersInGroup.length > 0 ? <TableBody>
                                    {usersInGroup.map(thisUser => <TableRow>
                                        <TableCell component="th" scope="row">{thisUser[0]}</TableCell>
                                        <TableCell align="right">{thisUser[1]}</TableCell>
                                        <TableCell align="right">{thisUser[2]}</TableCell>
                                        <TableCell align='right'><Button color="secondary" onClick={() => { removeUserFromGroup(thisUser) }}>Remove</Button></TableCell>
                                    </TableRow>)}
                                </TableBody> : <br />}
                            </Table>
                            <br />
                            <FormControl className={classes.formControl}>
                                <Typography>Add Users: </Typography>
                                <TextField
                                    native
                                    id="searchUserName"
                                    label="User Name"
                                    onChange={handleSearchUserName}
                                />
                            </FormControl>
                            {searchUserNameResult.length > 0 ?
                                <Table className={classes.user_table} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><b>User Name</b></TableCell>
                                            <TableCell align="right"><b>Type</b></TableCell>
                                            <TableCell align="right"><b>Zone</b></TableCell>
                                            <TableCell align="right"><b>Action</b></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {searchUserNameResult.map(thisUser => <TableRow>
                                            <TableCell component="th" scope="row">{thisUser[0]}</TableCell>
                                            <TableCell align="right">{thisUser[1]}</TableCell>
                                            <TableCell align="right">{thisUser[2]}</TableCell>
                                            <TableCell align='right'><Button color="secondary" onClick={() => { addUserToGroup(thisUser) }}>Add</Button></TableCell>
                                        </TableRow>)}
                                    </TableBody>
                                </Table> : <br />}
                            {isLoading == true ? <div><LinearProgress /></div> : <div />}
                        </div>
                    </div>
                </main>
            </div> : <div className={classes.logout}><BlockIcon /><br /><div>Please <a href="http://localhost:3000/">login</a> to use the administration dashboard.</div></div>}
        </div>
    );
}

export default EditGroup;
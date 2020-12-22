import React, { useEffect, useState } from 'react';


import axios from 'axios';
import { Link } from 'react-router-dom';

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

function EditUser(props) {
    const currentUser = props.location.state.userInfo;
    const classes = useStyles();
    const token = Cookies.get('token');
    const [isLoading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const isAuthenticated = token != null ? true : false;

    const [groupsOfUser, setGroupOfUser] = useState([]);
    const [searchGroupName, setSearchName] = useState();
    const [searchGroupNameResult, setSearchNameResult] = useState([]);

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
                query_string: `SELECT USER_GROUP_NAME, USER_ZONE WHERE USER_NAME = '${currentUser[0]}'`,
                query_limit: 100,
                row_offset: 0,
                query_type: 'general'
            }
        }).then(res => {
            let newArray = [];
            for (let user in res.data._embedded) {
                if (res.data._embedded[user][0] !== currentUser[0]) newArray.push(res.data._embedded[user]);
            }
            console.log(newArray);
            setGroupOfUser(newArray);
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
                query_string: `SELECT USER_GROUP_NAME, USER_ZONE WHERE USER_GROUP_NAME LIKE '%${searchGroupName}%'`,
                query_limit: 3,
                row_offset: 0,
                query_type: 'general'
            }
        }).then(res => {
            setSearchNameResult(res.data._embedded);
        })
    }, [searchGroupName])

    async function removeGroupFromUser(props) {
        try {
            const removeUserResult = await axios({
                method: 'POST',
                url: 'http://54.210.60.122:80/irods-rest/1.0.0/admin',
                params: {
                    action: 'modify',
                    target: 'group',
                    arg2: props[0],
                    arg3: 'remove',
                    arg4: currentUser[0],
                    arg5: currentUser[2]
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

    async function addGroupToUser(props) {
        try {
            await axios({
                method: 'POST',
                url: 'http://54.210.60.122:80/irods-rest/1.0.0/admin',
                params: {
                    action: 'modify',
                    target: 'group',
                    arg2: props[0],
                    arg3: 'add',
                    arg4: currentUser[0],
                    arg5: currentUser[2]
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

    const handleSearchGroupName = event => {
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
                        <Link to="/user" className={classes.link_button}><Button><ArrowBackIcon /></Button></Link>
                        {currentUser[0]}
                        <div>
                            <Table className={classes.user_table} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><b>Group Name</b></TableCell>
                                        <TableCell align="right"><b>Zone</b></TableCell>
                                        <TableCell align="right"><b>Action</b></TableCell>
                                    </TableRow>
                                </TableHead>
                                {groupsOfUser.length > 0 ? <TableBody>
                                    {groupsOfUser.map(thisGroup => <TableRow>
                                        <TableCell component="th" scope="row">{thisGroup[0]}</TableCell>
                                        <TableCell align="right">{thisGroup[1]}</TableCell>
                                        <TableCell align='right'><Button color="secondary" onClick={() => {removeGroupFromUser(thisGroup)}}>Remove</Button></TableCell>
                                    </TableRow>)}
                                </TableBody> : <span />}
                            </Table>
                            <br />
                            <FormControl className={classes.formControl}>
                                <Typography>Add Groups: </Typography>
                                <TextField
                                    native
                                    id="searchGroupName"
                                    label="Group Name"
                                    onChange={handleSearchGroupName}
                                />
                            </FormControl>
                            {searchGroupNameResult.length > 0 ?
                                <Table className={classes.user_table} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><b>Group Name</b></TableCell>
                                            <TableCell align="right"><b>Zone</b></TableCell>
                                            <TableCell align="right"><b>Action</b></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {searchGroupNameResult.map(thisGroup => <TableRow>
                                            <TableCell component="th" scope="row">{thisGroup[0]}</TableCell>
                                            <TableCell align="right">{thisGroup[1]}</TableCell>
                                            <TableCell align='right'><Button color="secondary" onClick={() => {addGroupToUser(thisGroup)}}>Add</Button></TableCell>
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

export default EditUser;
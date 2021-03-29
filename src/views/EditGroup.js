import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from '@reach/router';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Appbar from '../components/Appbar';
import Sidebar from '../components/Sidebar';
import Logout from '../views/Logout';
import { Button, FormControl, LinearProgress, TextField, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import { useEnvironment } from '../contexts/EnvironmentContext';
import { useServer } from '../contexts/ServerContext';


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
    },
    search_textfield: {
        marginLeft: '2vw'
    },
    add_button: {
        color: '#04bdaf'
    }
}));

function EditGroup(props) {
    const auth = localStorage.getItem('zmt-token');
    if (auth === null) {
        return <Logout />
    }

    const { zoneName } = useServer();
    const currentGroup = props.location.state.groupInfo;
    const classes = useStyles();
    const [isLoading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const { restApiLocation } = useEnvironment();

    const [usersInGroup, setUsersInGroup] = useState([]);
    const [searchUserName, setSearchName] = useState('');
    const [searchUserNameResult, setSearchNameResult] = useState([]);

    useEffect(() => {
        setLoading(true);
        const result = axios({
            method: 'GET',
            url: `${restApiLocation}/query`,
            headers: {
                'Accept': 'application/json',
                'Authorization': auth
            },
            params: {
                query_string: `SELECT USER_NAME, USER_TYPE WHERE USER_GROUP_NAME = '${currentGroup[0]}' AND USER_TYPE != 'rodsgroup'`,
                query_limit: 100,
                row_offset: 0,
                query_type: 'general'
            }
        }).then((res) => {
            setUsersInGroup(res.data._embedded);
            setLoading(false);
        })
    }, [refresh])

    useEffect(() => {
        setLoading(true);
        const searchResult = axios({
            method: 'GET',
            url: `${restApiLocation}/query`,
            headers: {
                'Authorization': auth,
            },
            params: {
                query_string: `SELECT USER_NAME, USER_TYPE WHERE USER_NAME LIKE '%${searchUserName}%' AND USER_TYPE != 'rodsgroup'`,
                query_limit: 10,
                row_offset: 0,
                query_type: 'general'
            }
        }).then((res) => {
            setSearchNameResult(res.data._embedded);
            setLoading(false);
        })
    }, [searchUserName])



    async function removeUserFromGroup(props) {
        try {
            const removeUserResult = await axios({
                method: 'POST',
                url: `${restApiLocation}/admin`,
                params: {
                    action: 'modify',
                    target: 'group',
                    arg2: currentGroup[0],
                    arg3: 'remove',
                    arg4: props[0],
                    arg5: zoneName
                },
                headers: {
                    'Authorization': auth,
                    'Accept': 'application/json'
                }
            }).then((res) => {
                setRefresh(!refresh);
            })
        } catch (e) {
            alert(e)
        }
    }

    async function addUserToGroup(props) {
        try {
            await axios({
                method: 'POST',
                url: `${restApiLocation}/admin`,
                params: {
                    action: 'modify',
                    target: 'group',
                    arg2: currentGroup[0],
                    arg3: 'add',
                    arg4: props[0],
                    arg5: zoneName
                },
                headers: {
                    'Authorization': auth,
                    'Accept': 'application/json'
                }
            }).then((res) => {
                setRefresh(!refresh);
            })
        }
        catch (e) {
            alert(e)
        }
    }

    const checkUser = (user) => {
        for (let i = 0; i < usersInGroup.length; i++) {
            if (usersInGroup[i][0] == user[0] && usersInGroup[i][1] == user[1]) {
                return true;
            }
        }
        return false;
    }

    const handleSearchUserName = (event) => {
        setSearchName(event.target.value);
    }

    return (
        <div className={classes.root}>
            <Appbar />
            <Sidebar menu_id="2" />
            <main className={classes.content}>
                <div className={classes.toolbar} />
                <div className={classes.main}>
                    <Link to="/group" className={classes.link_button}><Button><ArrowBackIcon /></Button></Link>
                    {currentGroup[0]}
                    <br />
                    <div className="edit_search_bar">
                        <Typography>Find User</Typography>
                        <TextField
                            native
                            id="searchUserName"
                            label="Search Username"
                            className={classes.search_textfield}
                            onChange={handleSearchUserName}
                        />
                    </div>
                    <br />
                    <div className="edit_container">
                        {searchUserNameResult.length > 0 ?
                            <Table className={classes.user_table} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><b>User Name</b></TableCell>
                                        <TableCell align="right"><b>Type</b></TableCell>
                                        <TableCell align="right"><b>Status</b></TableCell>
                                        <TableCell align="right"><b>Action</b></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {searchUserNameResult.map((thisUser) => <TableRow>
                                        <TableCell component="th" scope="row">{thisUser[0]}</TableCell>
                                        <TableCell align="right">{thisUser[1]}</TableCell>
                                        <TableCell align="right">{checkUser(thisUser) ? `Member of ${currentGroup[0]}` : `Not in ${currentGroup[0]}`}</TableCell>
                                        <TableCell align='right'>{checkUser(thisUser) ? <Button color="secondary" onClick={() => { removeUserFromGroup(thisUser) }}>Remove</Button> : <Button className={classes.add_button} onClick={() => { addUserToGroup(thisUser) }}>Add</Button>}</TableCell>
                                    </TableRow>)}
                                </TableBody>
                            </Table> : <br />}
                    </div>
                    {isLoading == true ? <div><LinearProgress /></div> : <div />}
                </div>
            </main>
        </div>
    );
}

export default EditGroup;
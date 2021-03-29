import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from '@reach/router';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Appbar from '../components/Appbar';
import Sidebar from '../components/Sidebar';
import Logout from '../views/Logout';
import { Button, FormControl, LinearProgress, TextField, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@material-ui/core';
import { useEnvironment } from '../contexts/EnvironmentContext';
import { useServer } from '../contexts/ServerContext';


const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontSize: theme.spacing(3)
    },
    link_button: {
        textDecoration: "none"
    },
    search_textfield: {
        marginLeft: '2vw'
    },
    add_button: {
        color: '#04bdaf'
    }
}));

function EditUser(props) {
    const auth = localStorage.getItem('zmt-token');
    if (auth === null) {
        return <Logout />
    }
    const currentUser = props.location.state.userInfo;
    const classes = useStyles();
    const [isLoading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const { restApiLocation } = useEnvironment();
    const { zoneName } = useServer();
    const [groupsOfUser, setGroupOfUser] = useState([]);
    const [searchGroupName, setSearchName] = useState('');
    const [searchGroupNameResult, setSearchNameResult] = useState([]);

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
                query_string: `SELECT USER_GROUP_NAME WHERE USER_NAME = '${currentUser[0]}' AND USER_GROUP_NAME != '${currentUser[0]}'`,
                query_limit: 100,
                row_offset: 0,
                query_type: 'general'
            }
        }).then((res) => {
            setGroupOfUser(res.data._embedded);
            setLoading(false);
        })
    }, [refresh])

    useEffect(() => {
        const searchResult = axios({
            method: 'GET',
            url: `${restApiLocation}/query`,
            headers: {
                'Authorization': auth,
            },
            params: {
                query_string: `SELECT USER_NAME WHERE USER_GROUP_NAME LIKE '%${searchGroupName}%' AND USER_TYPE = 'rodsgroup'`,
                query_limit: 100,
                row_offset: 0,
                query_type: 'general'
            }
        }).then((res) => {
            setSearchNameResult(res.data._embedded);
        })
    }, [searchGroupName])

    async function removeGroupFromUser(props) {
        try {
            const removeUserResult = await axios({
                method: 'POST',
                url: `${restApiLocation}/admin`,
                params: {
                    action: 'modify',
                    target: 'group',
                    arg2: props[0],
                    arg3: 'remove',
                    arg4: currentUser[0],
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

    async function addGroupToUser(props) {
        try {
            await axios({
                method: 'POST',
                url: `${restApiLocation}/admin`,
                params: {
                    action: 'modify',
                    target: 'group',
                    arg2: props[0],
                    arg3: 'add',
                    arg4: currentUser[0],
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

    const checkGroup = (group) => {
        for (let i = 0; i < groupsOfUser.length; i++) {
            if (groupsOfUser[i][0] == group[0]) {
                return true;
            }
        }
        return false;
    }

    return (
        <div className={classes.root}>
            <Appbar />
            <Sidebar menu_id="1" />
            <main className={classes.content}>
                <div className={classes.toolbar} />
                <div className={classes.main}>
                    <Link to="/user" className={classes.link_button}><Button><ArrowBackIcon /></Button></Link>
                    {currentUser[0]}
                    <div className="edit_search_bar">
                        <Typography>Find Group</Typography>
                        <TextField
                            native
                            id="searchGroupName"
                            label="Search Groupname"
                            className={classes.search_textfield}
                            onChange={(e) => setSearchName(event.target.value)}
                        />
                    </div>
                    <br />
                    <div className="edit_container">
                        {searchGroupNameResult.length > 0 ?
                            <Table className={classes.user_table} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><b>Group Name</b></TableCell>
                                        <TableCell align="right"><b>Status</b></TableCell>
                                        <TableCell align="right"><b>Action</b></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {searchGroupNameResult.map((thisGroup) => <TableRow>
                                        <TableCell component="th" scope="row">{thisGroup[0]}</TableCell>
                                        <TableCell align="right">{checkGroup(thisGroup) ? "In group" : "Not in group"}</TableCell>
                                        <TableCell align='right'>{checkGroup(thisGroup) ? <Button color="secondary" onClick={() => { removeGroupFromUser(thisGroup) }}>Remove</Button> : <Button className={classes.add_button} onClick={() => { addGroupToUser(thisGroup) }}>Add</Button>}</TableCell>
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

export default EditUser;
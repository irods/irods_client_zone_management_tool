import React, { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from '@reach/router';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { Logout } from './';
import { makeStyles, Button, LinearProgress, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@material-ui/core';
import { useEnvironment, useServer } from '../contexts';

const useStyles = makeStyles((theme) => ({
    link_button: {
        textDecoration: 'none'
    },
    filter_textfield: {
        marginLeft: '2vw'
    },
    add_button: {
        color: '#04bdaf'
    }
}));

export const EditGroup = (props) => {
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
    const [filterUserName, setFilterName] = useState('');
    const [filterUserNameResult, setFilterNameResult] = useState([]);

    useEffect(() => {
        setLoading(true);
        axios({
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
        axios({
            method: 'GET',
            url: `${restApiLocation}/query`,
            headers: {
                'Authorization': auth,
            },
            params: {
                query_string: `SELECT USER_NAME, USER_TYPE WHERE USER_NAME LIKE '%${filterUserName}%' AND USER_TYPE != 'rodsgroup'`,
                query_limit: 10,
                row_offset: 0,
                query_type: 'general'
            }
        }).then((res) => {
            setFilterNameResult(res.data._embedded);
            setLoading(false);
        })
    }, [filterUserName])



    async function removeUserFromGroup(props) {
        try {
            await axios({
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
            if (usersInGroup[i][0] === user[0] && usersInGroup[i][1] === user[1]) {
                return true;
            }
        }
        return false;
    }

    const handleFilterUserName = (event) => {
        setFilterName(event.target.value);
    }

    return (
        <Fragment>
            <Link to="/groups" className={classes.link_button}><Button><ArrowBackIcon /></Button></Link>
            {currentGroup[0]}
            <br />
            <div className="edit_filter_bar">
                <Typography>Find User</Typography>
                <TextField
                    id="filterUserName"
                    label="Filter UserName"
                    className={classes.filter_textfield}
                    onChange={handleFilterUserName}
                />
            </div>
            <br />
            <div className="edit_container">
                {filterUserNameResult.length > 0 ?
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
                            {filterUserNameResult.map((thisUser) => <TableRow key={thisUser[0]}>
                                <TableCell component="th" scope="row">{thisUser[0]}</TableCell>
                                <TableCell align="right">{thisUser[1]}</TableCell>
                                <TableCell align="right">{checkUser(thisUser) ? `Member of ${currentGroup[0]}` : `Not in ${currentGroup[0]}`}</TableCell>
                                <TableCell align='right'>{checkUser(thisUser) ? <Button color="secondary" onClick={() => { removeUserFromGroup(thisUser) }}>Remove</Button> : <Button className={classes.add_button} onClick={() => { addUserToGroup(thisUser) }}>Add</Button>}</TableCell>
                            </TableRow>)}
                        </TableBody>
                    </Table> : <br />}
            </div>
            {isLoading === true ? <div><LinearProgress /></div> : <div />}
        </Fragment>
    );
}
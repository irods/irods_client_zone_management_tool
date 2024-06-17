import React, { Fragment, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Link, navigate } from '@reach/router';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { makeStyles, Button, LinearProgress, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@material-ui/core';
import { useEnvironment, useServer } from '../contexts';
import { AddUserToGroupController, RemoveUserFromGroupController } from '../controllers/GroupController';

const useStyles = makeStyles(() => ({
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
    // navigate to groups page if no group info is passed along
    if (!props.location.state) navigate('/groups')
    // navigate to login page if no token is found
    if (!localStorage.getItem('zmt-token')) navigate('/')
    
    const auth = localStorage.getItem('zmt-token');
    const currentGroup = props.location.state ? props.location.state.groupInfo : new Array(2);
    const { localZoneName } = useServer();
    const classes = useStyles();
    const [isLoading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const { restApiLocation } = useEnvironment();
    const [usersInGroup, setUsersInGroup] = useState([]);
    const [filterUserName, setFilterName] = useState('');
    const [filterUserNameResult, setFilterNameResult] = useState();

    const loadCurrentGroupInfo = useCallback(() => {
        setLoading(true);
        axios({
            method: 'GET',
            url: `${restApiLocation}/query`,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${auth}`
            },
            params: {
                op: "execute_genquery",
                query: `SELECT USER_NAME, USER_TYPE WHERE USER_GROUP_NAME = '${currentGroup[0]}' AND USER_TYPE != 'rodsgroup'`,
                limit: 100,
                offset: 0,
            }
        }).then((res) => {
            setUsersInGroup(res.data.rows);
            setLoading(false);
        })
    }, [auth, currentGroup, restApiLocation])

    const loadFilteredUsers = useCallback(() => {
        setLoading(true);
        axios({
            method: 'GET',
            url: `${restApiLocation}/query`,
            headers: {
                'Authorization': `Bearer ${auth}`,
            },
            params: {
                op: "execute_genquery",
                query: `SELECT USER_NAME, USER_TYPE WHERE USER_NAME LIKE '%${filterUserName.toUpperCase()}%' AND USER_TYPE != 'RODSGROUP'`,
                limit: 10,
                offset: 0,
                'case-sensitive': 0
            }
        }).then((res) => {
            setFilterNameResult(res.data.rows);
            setLoading(false);
        })
    }, [auth, restApiLocation, filterUserName])

    async function removeUserFromGroup(user) {
        try {
            await RemoveUserFromGroupController(
                user[0],
                localZoneName,
                currentGroup[0],
                restApiLocation
            )
            .then(() => {
                setRefresh(!refresh);
            })
        } catch (e) {
            alert(e)
        }
    }

    async function addUserToGroup(user) {
        try {
            await AddUserToGroupController(
                user[0],
                localZoneName,
                currentGroup[0],
                restApiLocation
            )
            .then(() => {
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

    useEffect(() => {
        if (currentGroup[0]) loadCurrentGroupInfo()
    }, [refresh, loadCurrentGroupInfo])

    useEffect(() => {
        if (currentGroup[0]) loadFilteredUsers()
    }, [loadFilteredUsers])

    return (
        <Fragment>
            {isLoading === true ? <div><LinearProgress /></div> : <div className="table_view_spinner_holder" />}
            <Link to="/groups" className={classes.link_button}><Button><ArrowBackIcon /></Button></Link>
            {currentGroup[0]}
            <br />
            <div className="edit_filter_bar">
                <Typography>Find User</Typography>
                <TextField
                    id="filterUserName"
                    label="Filter"
                    placeholder="Filter by User Name"
                    className={classes.filter_textfield}
                    onChange={handleFilterUserName}
                />
            </div>
            <br />
            <div className="edit_container">
                {filterUserNameResult &&
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
                            {filterUserNameResult.length === 0 ? <TableRow><TableCell colSpan={4}><div className="table_view_no_results_container">No results found for [{filterUserName}].</div></TableCell></TableRow> : filterUserNameResult.map((thisUser) => <TableRow key={thisUser[0]}>
                                <TableCell component="th" scope="row">{thisUser[0]}</TableCell>
                                <TableCell align="right">{thisUser[1]}</TableCell>
                                <TableCell align="right">{checkUser(thisUser) ? `Member of ${currentGroup[0]}` : `Not in ${currentGroup[0]}`}</TableCell>
                                <TableCell align='right'>{checkUser(thisUser) ? <Button color="secondary" onClick={() => { removeUserFromGroup(thisUser) }}>Remove</Button> : <Button className={classes.add_button} onClick={() => { addUserToGroup(thisUser) }}>Add</Button>}</TableCell>
                            </TableRow>)}
                        </TableBody>
                    </Table>}
            </div>
        </Fragment>
    );
}

EditGroup.propTypes = {
    location: PropTypes.any
}
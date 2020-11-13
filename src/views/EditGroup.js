import React, { useEffect, useState } from 'react';


import axios from 'axios';
import { Link } from 'react-router-dom';

import BlockIcon from '@material-ui/icons/Block';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';


import Appbar from '../components/Appbar';
import Sidebar from '../components/Sidebar';
import Cookies from 'js-cookie';
import { Button, LinearProgress } from '@material-ui/core';
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
    const currentGroup = props.location.groupInfo;
    const classes = useStyles();
    const token = Cookies.get('token');
    const [isLoading, setLoading] = useState(false);
    const isAuthenticated = token != null ? true : false;

    const [usersInGroup, setUsersInGroup] = useState([]);

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
                query_string: `SELECT USER_NAME, USER_TYPE, USER_ZONE WHERE USER_GROUP_NAME = '${currentGroup[0]}'`,
                query_limit: 100,
                row_offset: 0,
                query_type: 'general'
            }
        }).then(res => {
            if (res.data.count !== '1') {
                setUsersInGroup(res.data._embedded);
            }
            else {
                setUsersInGroup([]);
            }
            setLoading(false);
        })
    }, [isAuthenticated])

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
                        <Table className={classes.user_table} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell><b>User Name</b></TableCell>
                                    <TableCell align="right"><b>Zone</b></TableCell>
                                    <TableCell align="right"><b>Action</b></TableCell>
                                </TableRow>
                            </TableHead>
                            {usersInGroup.length > 0 ? <TableBody>
                                {usersInGroup.map(thisUser => <TableRow>
                                    <TableCell component="th" scope="row">{thisUser[0]}</TableCell>
                                    <TableCell align="right">{thisUser[1]}</TableCell>
                                    <TableCell align='right'><Button color="secondary">Remove</Button></TableCell>
                                </TableRow>)}
                            </TableBody> : <br />}
                        </Table>
                        {isLoading == true ? <div><LinearProgress /></div> : <div/>}
                    </div>
                </main>
            </div> : <div className={classes.logout}><BlockIcon /><br /><div>Please <a href="http://localhost:3000/">login</a> to use the administration dashboard.</div></div>}
        </div>
    );
}

export default EditGroup;
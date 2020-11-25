import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import BlockIcon from '@material-ui/icons/Block';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Appbar from '../components/Appbar';
import Button from '@material-ui/core/Button';
import Sidebar from '../components/Sidebar';
import Cookies from 'js-cookie';
import { makeStyles } from '@material-ui/core';

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

function EditResource(props) {
    const currentResc = props.location.resourceInfo;
    const classes = useStyles();
    const token = Cookies.get('token');
    const isAuthenticated = token != null ? true : false;

    useEffect(() => {
        const result = axios({
            method: 'GET',
            url: 'http://54.210.60.122:80/irods-rest/1.0.0/query',
            headers: {
                'Accept': 'application/json',
                'Authorization': token
            },
            params: {
                query_string: `SELECT RESC_VAULT_PATH, RESC_LOC, RESC_INFO, RESC_FREE_SPACE, RESC_COMMENT,RESC_STATUS,RESC_CONTEXT WHERE RESC_NAME = '${currentResc[0]}'`,
                query_limit: 100,
                row_offset: 0,
                query_type: 'general'
            }
        }).then(res => {
            console.log(res.data._embedded);
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
                    <Link to="/resource" className={classes.link_button}><Button><ArrowBackIcon /></Button></Link>
                        {currentResc[0]}
                    </div>
                </main>
            </div> : <div className={classes.logout}><BlockIcon /><br /><div>Please <a href="http://localhost:3000/">login</a> to use the administration dashboard.</div></div>}
        </div>
    );
}

export default EditResource;
import React, { useState } from 'react';
import Logout from './Logout';
import Appbar from '../components/Appbar';
import Sidebar from '../components/Sidebar';
import { useServer } from '../contexts/ServerContext';
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
    }
}))

function Server() {
    const auth = localStorage.getItem('zmt-token');
    if (auth === null) {
        return <Logout />
    }
    const classes = useStyles();
    const { serverContext } = useServer();
    return (
        <div className={classes.root}>
            <Appbar />
            <Sidebar menu_id="2" />
            <main className={classes.content}>
                <div className={classes.toolbar} />
                <div className={classes.main}>
                    server page
                </div>
            </main>
        </div>
    )
}

export default Server;
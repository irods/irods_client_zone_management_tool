import React, { Fragment, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Paper, Typography } from '@material-ui/core';
import { useServer } from '../contexts/ServerContext';
import { Logout } from './';

const useStyles = makeStyles((theme) => ({
    grid: {
        padding: '10px 20px'
    },
    gridItem: {
        padding: '10px'
    },
    paper: {
        height: 170,
        width: 180,
        padding: theme.spacing(1)
    },
    paper_title: {
        fontSize: 20
    },
    paper_content: {
        paddingTop: 20,
        textAlign: 'center',
        color: '#18bc9c',
        fontSize: 50,
    }
}));

export const Home = () => {
    const auth = localStorage.getItem('zmt-token')
    if (auth === null) {
        return <Logout />
    }
    const { userContext, groupContext, rescContext, zoneContext, loadData } = useServer();
    const classes = useStyles();

    const [status, setStatus] = useState()

    useEffect(() => {
        loadData();
        setStatus("OK");
    }, [])

    return (
        <Fragment>
            <Grid className={classes.grid} container>
                <Grid item xs className={classes.gridItem}>
                    <Paper className={classes.paper}>
                        <Typography className={classes.paper_title}>Zone Status</Typography>
                        <Typography className={classes.paper_content}>{status}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs className={classes.gridItem}>
                    <Paper className={classes.paper}>
                        <Typography className={classes.paper_title}>Servers</Typography>
                        <Typography className={classes.paper_content}>{zoneContext === undefined ? 0 : zoneContext.length}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs className={classes.gridItem}>
                    <Paper className={classes.paper}>
                        <Typography className={classes.paper_title}>Resources</Typography>
                        <Typography className={classes.paper_content}>{rescContext === undefined ? 0 : rescContext.total}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs className={classes.gridItem}>
                    <Paper className={classes.paper}>
                        <Typography className={classes.paper_title}>Users</Typography>
                        <Typography className={classes.paper_content}>{userContext === undefined ? 0 : userContext.total}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs className={classes.gridItem}>
                    <Paper className={classes.paper}>
                        <Typography className={classes.paper_title}>Groups</Typography>
                        <Typography className={classes.paper_content}>{groupContext === undefined ? 0 : groupContext.total}</Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Fragment>
    );
};
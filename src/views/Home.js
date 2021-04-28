import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Appbar from '../components/Appbar';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Container } from '@material-ui/core';
import { Grid, Paper } from '@material-ui/core';
import { useServer } from '../contexts/ServerContext';
import Logout from './Logout';

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
    tab_panel: {
        width: 600,
    },
    info: {
        margin: theme.spacing(1),
    },
    server: {
        width: theme.spacing(8)
    },
    server_card: {
        width: theme.spacing(40),
    },
    server_details: {
        flexGrow: 1,
        display: 'flex',
        height: 600
    },
    divider: {
        marginTop: theme.spacing(20)
    },
    status_box: {
        display: 'flex',
        justifyContent: 'center'
    },
    logout: {
        marginTop: theme.spacing(20),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontSize: theme.spacing(3)
    },
    tabs: {
        width: 250,
        borderRight: `1px solid ${theme.palette.divider}`,
    },
    tab: {
        marginTop: 30,
        textTransform: 'none',
        fontSize: 18
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

function Home() {
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
        <div>
            <div className={classes.root}><Appbar /><Sidebar menu_id="1" /><main className={classes.content}><div className={classes.toolbar} />
                <div className={classes.main}>
                    <Container className={classes.status_box}>
                        <Grid item xs={12} md={8} lg={9}>
                            <Paper className={classes.paper}>
                                <Typography className={classes.paper_title}>Zone Status</Typography>
                                <Typography className={classes.paper_content}>{status}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={8} lg={9}>
                            <Paper className={classes.paper}>
                                <Typography className={classes.paper_title}>Servers</Typography>
                                <Typography className={classes.paper_content}>{zoneContext === undefined ? 0 : zoneContext.length}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={8} lg={9}>
                            <Paper className={classes.paper}>
                                <Typography className={classes.paper_title}>Resources</Typography>
                                <Typography className={classes.paper_content}>{rescContext === undefined ? 0 : rescContext.total}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={8} lg={9}>
                            <Paper className={classes.paper}>
                                <Typography className={classes.paper_title}>Users</Typography>
                                <Typography className={classes.paper_content}>{userContext === undefined ? 0 : userContext.total}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={8} lg={9}>
                            <Paper className={classes.paper}>
                                <Typography className={classes.paper_title}>Groups</Typography>
                                <Typography className={classes.paper_content}>{groupContext === undefined ? 0 : groupContext.total}</Typography>
                            </Paper>
                        </Grid>
                    </Container>
                    </div></main>
            </div>
        </div >
    );
}

export default Home;
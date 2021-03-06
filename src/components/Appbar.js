import React, { useState, useEffect } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { CssBaseline } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useServer } from '../contexts/ServerContext';
import { useEnvironment } from '../contexts/EnvironmentContext';

const drawerWidth = 240;

function Appbar() {
    const environment = useEnvironment();
    const useStyles = makeStyles((theme) => ({
        appBar: {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: drawerWidth,
            background: environment.primaryColor
        },
        rightToolbar: {
            marginLeft: "auto",
            marginRight: -12,
            fontSize: 18
        },
        logo: {
            width: 70,
            marginRight: 20
        },
        branding: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none'
        }
    }));
    const classes = useStyles();
    const [zoneName, setZoneName] = useState();
    const server = useServer();

    useEffect(() => {
        setZoneName(server.zoneContext[0]['icat_server']['service_account_environment']['irods_zone_name']);
    }, [])

    return (<div>
        <CssBaseline />
        <AppBar position="fixed" className={classes.appBar} >
            <Toolbar >
                <a className={classes.branding}>
                    <img className={classes.logo} src={require(`../img/${environment.appbarLogo}`)}></img> <Typography variant="h6"> {environment.brandingName} </Typography> </a>
                <Typography className={classes.rightToolbar} variant="h6" noWrap > {zoneName} </Typography>
            </Toolbar>
        </AppBar>
    </div>
    )
}

export default Appbar;
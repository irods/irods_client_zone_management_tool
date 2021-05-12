import React from 'react';
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
    const { zoneName } = useServer();
    const AppBarLogo = require(`../img/${environment.appbarLogo}`).default;
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

    return (<div>
        <CssBaseline />
        <AppBar position="fixed" className={classes.appBar} >
            <Toolbar >
                <a className={classes.branding}>
                    <img alt="Branding Icon" className={classes.logo} src={AppBarLogo}></img> <Typography variant="h6"> {environment.brandingName} </Typography> </a>
                <Typography className={classes.rightToolbar} variant="h6" noWrap > {zoneName} </Typography>
            </Toolbar>
        </AppBar>
    </div>
    )
}

export default Appbar;
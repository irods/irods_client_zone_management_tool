import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Link from '@material-ui/core/Link'
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { CssBaseline } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Cookies from 'js-cookie';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    appBar: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
        background: '#18bc9c'
    },
    rightToolbar: {
        marginLeft: "auto",
        marginRight: -12,
        fontSize: 18
    }
}));

function Appbar() {

    const classes = useStyles();
    const current_window = "http://localhost:3000/home";


    return (
        <div>
            <CssBaseline />
            <AppBar position="fixed" className={classes.appBar}>
                <Toolbar>
                    <Typography variant="h6" noWrap>
                        iRODS Client Zone Management Tool
          </Typography>
                    <Typography className={classes.rightToolbar} variant="h6" noWrap>
                        Welcome, {Cookies.get('username')}!
          </Typography>
                </Toolbar>
            </AppBar>
        </div>
    )
}

export default Appbar;
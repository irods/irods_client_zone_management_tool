import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { makeStyles, useTheme } from '@material-ui/core/styles';

import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    appBar: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    }
}));

function Sidebar() {
    const token = Cookies.get('token');
    const isAuthenticated = token != null ? true : false;
    const classes = useStyles();
    const theme = useTheme();
    const logout = () => {
        Cookies.remove('token');
        Cookies.remove('username');
        window.location.reload();
    }

    return (
            <Drawer
                className={classes.drawer}
                variant="permanent"
                classes={{
                    paper: classes.drawerPaper,
                }}
                anchor="left"
            >
                <div className={classes.toolbar} />
                <Divider />
                <List>
                    <ListItem button key='zone_report'>
                        <ListItemText primary='Zone Report' />
                    </ListItem>
                    <ListItem button key='query'>
                        <ListItemText primary='Query' />
                    </ListItem>
                    <ListItem button key='admin'>
                        <ListItemText primary='User Administration' />
                    </ListItem>
                </List>
                <Divider />
                <List>
                    <ListItem button key='current_session'>
                        <ListItemText primary='Current Session' />
                    </ListItem>
                </List>
                <Divider />
                <List>
                    <ListItem button key='logout' onClick={logout}>
                        <ListItemText primary='Logout' />
                    </ListItem>
                </List>
            </Drawer>
    );
}

export default Sidebar;
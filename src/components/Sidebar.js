import React, { useState } from 'react';
import { Link } from '@reach/router';
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

import { useServer } from '../contexts/ServerContext';

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
        height: '90%'
    },
    drawerPaper: {
        width: drawerWidth,
    }
}));

function Sidebar() {
    const token = Cookies.get('token');
    const isAuthenticated = token != null ? true : false;
    const classes = useStyles();
    const server = useServer();

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
                    <ListItem button component={Link} to="/home" key='home'>
                        <ListItemText primary='Home' />
                    </ListItem>
                    <ListItem button component={Link} to="/user" key='user'>
                        <ListItemText>User ({server.userContext.total})</ListItemText>
                    </ListItem>
                    <ListItem button component={Link} to="/group" key='group'>
                        <ListItemText>Group ({server.groupContext.total})</ListItemText>
                    </ListItem>
                    <ListItem button component={Link} to="/resource" key='resource'>
                        <ListItemText>Resource ({server.rescContext.total})</ListItemText>
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
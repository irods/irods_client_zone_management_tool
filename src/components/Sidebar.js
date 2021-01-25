import React, { useState, useEffect } from 'react';
import { Link } from '@reach/router';
import Cookies from 'js-cookie';
import { makeStyles, useTheme } from '@material-ui/core/styles';

import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import MenuItem from '@material-ui/core/MenuItem';
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

function Sidebar(props) {
    const token = Cookies.get('token');
    const isAuthenticated = token != null ? true : false;
    const classes = useStyles();
    const server = useServer();
    const selected = props.menu_id;
    const [userCounts, setUserCounts] = useState();
    const [groupCounts, setGroupCounts] = useState();
    const [rescCounts, setRescCounts] = useState();

    useEffect(() => {
        setUserCounts(`(${server.userContext.total})`);
        setGroupCounts(`(${server.groupContext.total})`);
        setRescCounts(`(${server.rescContext.total})`);
    },[])

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
                    <MenuItem button selected={selected == 0} component={Link} to="/home" key='home'>
                        <ListItemText primary='Home' />
                    </MenuItem>
                    <MenuItem button selected={selected == 1} component={Link} to="/user" key='user'>
                        <ListItemText>User {userCounts}</ListItemText>
                    </MenuItem>
                    <MenuItem button selected={selected == 2} component={Link} to="/group" key='group'>
                        <ListItemText>Group {groupCounts}</ListItemText>
                    </MenuItem>
                    <MenuItem button selected={selected == 3} component={Link} to="/resource" key='resource'>
                        <ListItemText>Resource {rescCounts}</ListItemText>
                    </MenuItem>
                </List>
                <Divider />
                <List>
                    <MenuItem button component={Link} to="/logout" key='logout'>
                        <ListItemText primary='Logout' />
                    </MenuItem>
                </List>
            </Drawer>
    );
}

export default Sidebar;
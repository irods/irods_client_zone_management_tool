import React from 'react';
import { Link } from '@reach/router';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';

import { useServer } from '../contexts/ServerContext';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
        height: '95vh',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
    }
}));

function Sidebar(props) {
    const classes = useStyles();
    const selected = props.menu_id;
    const { userContext, groupContext, rescContext} = useServer();

    return (
            <Drawer
                className={classes.drawer}
                variant="permanent"
                classes={{
                    paper: classes.drawerPaper,
                }}
                anchor="left"
            >
                <Divider />
                <List>
                    <MenuItem button selected={selected === 0} component={Link} to="/home" key='home'>
                        <ListItemText primary='Home' />
                    </MenuItem>
                    <MenuItem button selected={selected === 1} component={Link} to="/user" key='user'>
                        <ListItemText>Users ({userContext === undefined ? 0 : userContext.total})</ListItemText>
                    </MenuItem>
                    <MenuItem button selected={selected === 2} component={Link} to="/group" key='group'>
                        <ListItemText>Groups ({groupContext === undefined ? 0 : groupContext.total})</ListItemText>
                    </MenuItem>
                    <MenuItem button selected={selected === 3} component={Link} to="/resource" key='resource'>
                        <ListItemText>Resources ({rescContext === undefined ? 0 : rescContext.total})</ListItemText>
                    </MenuItem>
                    <MenuItem button>
                        <ListItemText>Servers</ListItemText>
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
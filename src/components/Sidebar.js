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
    const { userTotal, groupTotal, rescTotal, zoneContext } = useServer();

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
                <MenuItem button selected={selected === '1'} component={Link} to="/home" key='home'>
                    <ListItemText primary='Home' />
                </MenuItem>
                <MenuItem button selected={selected === '2'} component={Link} to="/servers" key='server'>
                    <ListItemText>Servers ({zoneContext === undefined ? 0 : zoneContext.length})</ListItemText>
                </MenuItem>
                <MenuItem button selected={selected === '3'} component={Link} to="/resources" key='resource'>
                    <ListItemText>Resources ({rescTotal})</ListItemText>
                </MenuItem>

                <MenuItem button selected={selected === '4'} component={Link} to="/users" key='user'>
                    <ListItemText>Users ({userTotal})</ListItemText>
                </MenuItem>
                <MenuItem button selected={selected === '5'} component={Link} to="/groups" key='group'>
                    <ListItemText>Groups ({groupTotal})</ListItemText>
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
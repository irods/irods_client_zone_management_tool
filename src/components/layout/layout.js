import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, navigate, useLocation } from '@reach/router';
import { AppBar, CssBaseline, Drawer, Divider, Hidden, IconButton, List, ListItemText, MenuItem, Toolbar, Typography } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles } from '@material-ui/core/styles';
import { useEnvironment, useServer } from '../../contexts';

const drawerWidth = '200px';

export const Layout = ({ children }) => {
    // load first part of a url path
    const pathname = useLocation().pathname.split('/')[1];
    const environment = useEnvironment();
    const useStyles = makeStyles((theme) => ({
        root: {
            display: 'flex',
            width: '100vw',
            maxHeight: '100vh'
        },
        appBar: {
            width: '100%',
            height: '64px',
            background: environment.primaryColor,
        },
        rightToolbar: {
            marginLeft: "auto",
            marginRight: -12,
            fontSize: 18
        },
        sidebarContainer: {
            [theme.breakpoints.up('sm')]: {
                width: drawerWidth,
                flexShrink: 0,
            },
        },
        logo: {
            width: 70,
            height: '64px',
            marginRight: 20
        },
        branding: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            height: '64px'
        },
        drawer: {
            width: 'auto',
            flexShrink: 0,
        },
        drawerPaper: {
            width: drawerWidth,
            marginTop: '64px',
            height: `calc(100vh - 50px - 64px)`,
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
        },
        component: {
            flexGrow: 1,
            overflow: 'auto',
            width: '100%',
            height: 'calc(100vh - 50px)'
        },
        toolbar: theme.mixins.toolbar,
        mobileMenu: {
            position: 'absolute',
            right: '2px'
        }
    }))
    const classes = useStyles();
    const { localZoneName, zones } = useServer();
    const AppBarLogo = require(`../../img/${environment.appbarLogo}`).default;
    const [mobileOpen, setMobileOpen] = useState(false);
    const { userTotal, groupTotal, rescTotal, zoneContext } = useServer();

    const logoutHandler = () => {
        localStorage.removeItem('zmt-token');
        localStorage.removeItem('zmt-username');
        localStorage.removeItem('zmt-inactiveChecks'); 
        localStorage.removeItem('zmt-checkIntervals');
        navigate('/');
    }

    const drawer = (
        <div>
            <Divider />
            <List>
                <MenuItem button selected={pathname === 'home'} component={Link} to="/home" key='home'>
                    <ListItemText primary='Home' />
                </MenuItem>
                <MenuItem button selected={pathname === 'zones'} component={Link} to="/zones" key='zone'>
                    <ListItemText>Zones ({zones === undefined ? 0 : zones.length})</ListItemText>
                </MenuItem>
                <MenuItem button selected={pathname === 'servers'} component={Link} to="/servers" key='server'>
                    <ListItemText>Servers ({zoneContext === undefined ? 0 : zoneContext.length})</ListItemText>
                </MenuItem>
                <MenuItem button selected={pathname === 'resources'} component={Link} to="/resources" key='resource'>
                    <ListItemText>Resources ({rescTotal})</ListItemText>
                </MenuItem>

                <MenuItem button selected={pathname === 'users'} component={Link} to="/users" key='user'>
                    <ListItemText>Users ({userTotal})</ListItemText>
                </MenuItem>
                <MenuItem button selected={pathname === 'groups'} component={Link} to="/groups" key='group'>
                    <ListItemText>Groups ({groupTotal})</ListItemText>
                </MenuItem>
            </List>
            <Divider />
            <List>
                <MenuItem button onClick={() => logoutHandler()} key='logout'>
                    <ListItemText primary='Logout' />
                </MenuItem>
            </List>
        </div>
    );

    return (
        <div id="zmt-layout" className={classes.root}>
            <CssBaseline />
            <AppBar id="zmt-appbar" className={classes.appBar} >
                <Toolbar >
                    <a href="/" className={classes.branding}>
                        <img alt="Branding Icon" className={classes.logo} src={AppBarLogo}></img></a>
                    <Hidden xsDown>
                        <Typography variant="h6"> {environment.brandingName}</Typography>
                        <Typography className={classes.rightToolbar} variant="h6" noWrap > {localZoneName} </Typography>
                    </Hidden>
                    <Hidden smUp>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            className={classes.mobileMenu}
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Hidden>
                </Toolbar>
            </AppBar>
            <div id="zmt-sidebar" className={classes.sidebarContainer}>
                <Hidden smUp implementation="css">
                    <Drawer
                        variant="temporary"
                        anchor="left"
                        open={mobileOpen}
                        onClose={() => setMobileOpen(false)}
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        ModalProps={{
                            keepMounted: true
                        }}
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
                <Hidden xsDown implementation="css">
                    <Drawer
                        className={classes.drawer}
                        variant="permanent"
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        anchor="left"
                        open
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
            </div>
            <div className={classes.component}>
                <div className={classes.toolbar} />
                <div className="main_wrapper">
                    {children}
                </div>
            </div>
        </div>
    )
}

Layout.propTypes = {
    children: PropTypes.node.isRequired
}
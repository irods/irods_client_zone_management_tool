import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { makeStyles, useTheme } from '@material-ui/core/styles';

import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import BlockIcon from '@material-ui/icons/Block'
import AppBar from '@material-ui/core/AppBar';
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
    logout:{
        display: 'flex',
        flexDirection: 'column',
        marginTop: theme.spacing(12),
        alignItems: 'center',
        fontSize: 25,
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
    },
    // necessary for content to be below app bar
    toolbar: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(3),
    },
    main :{
        whiteSpace: "pre-wrap",
        fontSize:20
    }
}));

function Home() {
    const token = Cookies.get('token');
    const [main, setMain] = useState(`Welcome, ${Cookies.get('username')}!`);
    const [zone_report, setReport] = useState([]);
    const isAuthenticated = token != null ? true : false;
    const classes = useStyles();
    const theme = useTheme();
    const drawer = (
        <div>
            <List>
                {['Zone Report', 'Admin', 'Access', 'Query', 'Stream'].map((text, index) => {
                    <ListItem button key={text}>
                        <ListItemText primary={text} />
                    </ListItem>
                })}
            </List>
        </div>
    )

    const logout = () => {
        Cookies.remove('token');
        Cookies.remove('username');
        window.location.reload();
    }

    async function get_zone_report() {
        const result = await axios({
            method: 'POST',
            url: 'http://54.210.60.122:80/irods-rest/1.0.0/zone_report',
            headers: {
                'Accept': 'application/json',
                'Authorization': `${token}`
            }
        }).then(res => {
            let zones = res.data.zones;
            let tem_main = '';
            setReport(res.data.zones);
            console.log(res);
            zones.forEach(zone => {
                tem_main+=(`Hostname: ${zone['icat_server']['host_system_information']['hostname']}\n`);
                tem_main+=(`OS Distribution Name: ${zone['icat_server']['host_system_information']['os_distribution_name']}\n`);
                tem_main+=(`OS Distribution Version: ${zone['icat_server']['host_system_information']['os_distribution_version']}\n`);
                tem_main+=(`Service Account Group Name: ${zone['icat_server']['host_system_information']['service_account_group_name']}\n`);
                tem_main+=(`Service Account User Name: ${zone['icat_server']['host_system_information']['service_account_user_name']}\n`);
            })
            setMain(tem_main);
        })
    }

    return (
        <div>
            {isAuthenticated == true ? <div className={classes.root}>
                <CssBaseline />
                <AppBar position="fixed" className={classes.appBar}>
                    <Toolbar>
                        <Typography variant="h6" noWrap>
                            iRODS Administrator Dashboard
          </Typography>
                    </Toolbar>
                </AppBar>
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
                        <ListItem button key='zone_report' onClick={get_zone_report}>
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
                <main className={classes.content}>
                    <div className={classes.toolbar} />
                    <div className={classes.main}>
                        {main}
                    </div>
                </main>
            </div> : <div className={classes.logout}><BlockIcon /><br/><div>Please <a href="http://localhost:3000/">login</a> to use the administration dashboard.</div></div>}
        </div>
    );
}

export default Home;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { makeStyles, useTheme } from '@material-ui/core/styles';

import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
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
}));

function Home() {
    const token = Cookies.get('token');
    const [main, setMain] = useState('Welcome!')
    const [zone_report, setReport] = useState();
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
            setReport(res);
            setMain(`Schema Version: ${res.data.schema_version}`);
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
                    </List>
                    <Divider />
                    <List>
                        {['Current Session', 'Logout'].map((text, index) => (
                            <ListItem button key={text}>
                                <ListItemText primary={text} />
                            </ListItem>
                        ))}
                    </List>
                </Drawer>
                <main className={classes.content}>
                    <div className={classes.toolbar} />
                    <div>
                        {main}
                    </div>
                </main>
            </div> : <div>Please login to use the administration dashboard.</div>}
        </div>
    );
}

export default Home;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { makeStyles, useTheme } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

function Home() {
    const [zone_report, getReport] = useState();
    const token = Cookies.get('token');
    const isAuthenticated = token != null ? true : false;
    const theme = useTheme();
    const drawer = (
        <div>
            <List>
            {['Zone Report', 'Admin', 'Access', 'Query', 'Stream'].map((text, index) =>{
                <ListItem button key={text}>
                    <ListItemText primary={text} />
                </ListItem>
            })}
            </List>
        </div>
    )

    useEffect(() => {
        axios({
            method: 'POST',
            url: 'http://54.210.60.122:80/irods-rest/1.0.0/zone_report',
            headers: {
                'Accept': 'application/json',
                'Authorization': `${token}`
            }
        }).then(res => {
            getReport(res);
            console.log(res);
        })
    }, []);

    return (
        <div>
            {isAuthenticated == true ? <div>
                You are authenticated!
                <nav>
                    <Drawer
                    anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                    >
                    {drawer}
                    </Drawer>
                </nav>
        </div> : <div>Please login to use the administration dashboard.</div>}
        </div>
    );
}

export default Home;
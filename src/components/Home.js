import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Appbar from './Appbar';
import axios from 'axios';
import Cookies from 'js-cookie';
import { makeStyles, useTheme } from '@material-ui/core/styles';

import ServerIcon from '../img/servers-logo.png';
import BlockIcon from '@material-ui/icons/Block'
import { CssBaseline, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    toolbar: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(3),
    },
    main: {
        whiteSpace: "pre-wrap",
        fontSize: 20
    },
    server: {
        width: theme.spacing(10)
    },
    server_box:{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    divider: {
        marginTop: theme.spacing(20)
    }
}));

function Home() {
    const token = Cookies.get('token');
    const [main, setMain] = useState(`Welcome, ${Cookies.get('username')}!`);
    const [zone_reports, setReport] = useState([]);
    const [result, setResult] = useState();
    const [mouseIn, setMouseIn] = useState(false);
    const [hostname, setHostname] = useState('');
    const [currentZone, setCurrentZone] = useState({});
    const isAuthenticated = token != null ? true : false;
    const classes = useStyles();
    const theme = useTheme();
    let zone_id = 0;

    useEffect(() => {
        const result = axios({
            method: 'POST',
            url: 'http://54.210.60.122:80/irods-rest/1.0.0/zone_report',
            headers: {
                'Accept': 'application/json',
                'Authorization': `${token}`
            }
        }).then(res => {
            setReport(res.data.zones);
            setResult(`Number of Server Running: ${res.data.zones.length}`);
        })
    }, [isAuthenticated]);


    const handleMouseIn = event => {
        setMouseIn(true);
        setCurrentZone(zone_reports[event.target.id]['icat_server']['host_system_information']);
        // tem_result += (`Hostname: ${zone_reports[current_zone]['icat_server']['host_system_information']['hostname']}\n`);
        // tem_result += (`OS Distribution Name: ${zone_reports[current_zone]['icat_server']['host_system_information']['os_distribution_name']}\n`);
        // tem_result += (`OS Distribution Version: ${zone_reports[current_zone]['icat_server']['host_system_information']['os_distribution_version']}\n`);
        // tem_result += (`Service Account Group Name: ${zone_reports[current_zone]['icat_server']['host_system_information']['service_account_group_name']}\n`);
        // tem_result += (`Service Account User Name: ${zone_reports[current_zone]['icat_server']['host_system_information']['service_account_user_name']}\n`);
    }

    const handleMouseOut = event => {
        setMouseIn(false);
    }

    return (
        <div>
            {isAuthenticated == true ? <div className={classes.root}><Appbar /><Sidebar /><main className={classes.content}><div className={classes.toolbar} />
                <div className={classes.main}>{zone_reports.length > 0 ? zone_reports.map(zone_report =>
                    <div className={classes.server_box}>
                        <img className={classes.server} id={zone_id++} src={ServerIcon} onMouseEnter={handleMouseIn} onMouseLeave={handleMouseOut}></img>
                <p>iCAT Server #{zone_id}</p>
                    </div>
                ) : <div>Loading...</div>}</div><hr className={classes.divider}/>{mouseIn == true ? <div><p>Hostname: {currentZone['hostname']}</p><p>OS Distribution Name: {currentZone['os_distribution_version']}</p><p>OS Distribution Version: {currentZone['os_distribution_version']}</p></div> : <div>Number of Server Running: {zone_reports.length}</div>}</main>

            </div> : <div className={classes.logout}><BlockIcon /><br /><div>Please <a href="http://localhost:3000/">login</a> to use the administration dashboard.</div></div>}
        </div>
    );
}

// 50 iRODS/ 25 helx UI/ 25 robokop UI 

export default Home;
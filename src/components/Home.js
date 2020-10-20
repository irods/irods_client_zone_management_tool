import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Appbar from './Appbar';
import axios from 'axios';
import Cookies from 'js-cookie';
import { makeStyles, useTheme } from '@material-ui/core/styles';

import ServerIcon from '../img/servers-logo.png';
import BlockIcon from '@material-ui/icons/Block'
import { CssBaseline } from '@material-ui/core';

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
        width: theme.spacing(5)
    }
}));

function Home() {
    const token = Cookies.get('token');
    const [main, setMain] = useState(`Welcome, ${Cookies.get('username')}!`);
    const [zone_reports, setReport] = useState([]);
    const [test, setTest] = useState(0);
    const isAuthenticated = token != null ? true : false;
    const classes = useStyles();
    const theme = useTheme();

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
            setTest(1);
        })
    }, [isAuthenticated]);

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
            setReport([...res.data.zones]);
            // zones.forEach(zone => {
            //     tem_main+=(<img src={ServerIcon}></img>);
            //     tem_main+=(`Hostname: ${zone[0]['icat_server']['host_system_information']['hostname']}\n`);
            //     tem_main+=(`OS Distribution Name: ${zone['icat_server']['host_system_information']['os_distribution_name']}\n`);
            //     tem_main+=(`OS Distribution Version: ${zone['icat_server']['host_system_information']['os_distribution_version']}\n`);
            //     tem_main+=(`Service Account Group Name: ${zone['icat_server']['host_system_information']['service_account_group_name']}\n`);
            //     tem_main+=(`Service Account User Name: ${zone['icat_server']['host_system_information']['service_account_user_name']}\n`);
            // })
            setMain(tem_main);
            console.log(zone_reports);
        })
    }

    return (
        <div>
            {isAuthenticated == true ? <div className={classes.root}><Appbar /><Sidebar /><main className={classes.content}><div className={classes.toolbar} />
                <div className={classes.main}>{zone_reports.length > 0 ? zone_reports.map(zone_report =>
                    <div>
                        <img className={classes.server} src={ServerIcon}></img>
                        <p>Hostname: {zone_report['icat_server']['host_system_information']['hostname']}</p>
                    </div>
                ) : <div>Loading...</div>}</div></main>
                {/* <main className={classes.content}>
                    <div className={classes.toolbar} />
                    <div className={classes.main}>
                        <div>{test}</div>
                        {zone_reports.map(zone_report => {
                            <div>
                                <img src={ServerIcon}></img>
                                <div>Hostname: {zone_report['icat_server']['host_system_information']['hostname']}</div></div>
                        })}
                    </div>
                </main> */}
            </div> : <div className={classes.logout}><BlockIcon /><br /><div>Please <a href="http://localhost:3000/">login</a> to use the administration dashboard.</div></div>}
        </div>
    );
}

// 50 iRODS/ 25 helx UI/ 25 robokop UI 

export default Home;
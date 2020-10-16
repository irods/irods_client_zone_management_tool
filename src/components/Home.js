import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar'
import axios from 'axios';
import Cookies from 'js-cookie';
import { makeStyles, useTheme } from '@material-ui/core/styles';

import ServerIcon from '../img/servers-logo.png';
import BlockIcon from '@material-ui/icons/Block'

const useStyles = makeStyles((theme) => ({
}));

function Home() {
    const token = Cookies.get('token');
    const [main, setMain] = useState(`Welcome, ${Cookies.get('username')}!`);
    const [zone_reports, setReport] = useState([]);
    const isAuthenticated = token != null ? true : false;
    const classes = useStyles();
    const theme = useTheme();

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
            {isAuthenticated == true ? <div><Sidebar/>
                <main className={classes.content}>
                    <div className={classes.toolbar} />
                    <div className={classes.main}>
                        {zone_reports.map(zone_report => {
                            <div>
                            <img src={ServerIcon}></img>
                            <div>Hostname: {zone_report[0]['icat_server']['host_system_information']['hostname']}</div></div>
                        })}
                    </div>
                </main>
            </div> : <div className={classes.logout}><BlockIcon /><br/><div>Please <a href="http://localhost:3000/">login</a> to use the administration dashboard.</div></div>}
        </div>
    );
}

export default Home;
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Appbar from './Appbar';
import axios from 'axios';
import Cookies from 'js-cookie';
import { makeStyles, useTheme } from '@material-ui/core/styles';

import ServerIcon from '../img/servers-logo.png';
import BlockIcon from '@material-ui/icons/Block';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Pagination from '@material-ui/lab/Pagination';
import { CssBaseline, Typography, CircularProgress } from '@material-ui/core';
import { Avatar, Card, CardHeader, CardActions, CardContent, Collapse } from '@material-ui/core';

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
        width: theme.spacing(8)
    },
    server_card: {
        width: theme.spacing(40),
    },
    divider: {
        marginTop: theme.spacing(20)
    },
    status_box: {
        display: 'flex',
        fontSize: theme.spacing(3),
    },
    logout: {
        marginTop: theme.spacing(20),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontSize: theme.spacing(3)
    }
}));

function Home() {
    const token = Cookies.get('token');
    const [main, setMain] = useState(`Welcome, ${Cookies.get('username')}!`);
    const [zone_reports, setReport] = useState([]);
    const [result, setResult] = useState();
    const [mouseIn, setMouseIn] = useState(false);
    const [currentZone, setCurrentZone] = useState({});
    const [expanded, setExpanded] = useState(false);
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

    const handleExpandClick = () => {
        setExpanded(!expanded);
    }

    return (
        <div>
            {isAuthenticated == true ? <div className={classes.root}><Appbar /><Sidebar /><main className={classes.content}><div className={classes.toolbar} />
    <div className={classes.main}><Typography>Number of Server Running: {zone_reports.length}</Typography><br/><Pagination count={1} /><br/>{zone_reports.length > 0 ? zone_reports.map(zone_report =>
                    <Card className={classes.server_card}>
                        <CardHeader
                            avatar={
                                <img className={classes.server} id={zone_id} src={ServerIcon}></img>
                            }
                            title="Server"
                            subheader="iCAT Server"
                            action={
                                <IconButton
                                    onClick={handleExpandClick}>
                                    <ExpandMoreIcon />
                                </IconButton>
                            }
                        />
                        <Collapse in={expanded} timeout="auto" unmountOnExit>
                            <CardContent>
                                <Typography paragraph>Hostname: {zone_report['icat_server']['host_system_information']['hostname']}</Typography>
                                <Typography paragraph>OS Distribution Name: {zone_report['icat_server']['host_system_information']['os_distribution_name']}</Typography>
                                <Typography paragraph>OS Distribution Version: {zone_report['icat_server']['host_system_information']['os_distribution_version']}</Typography>

                            </CardContent>
                        </Collapse>
                    </Card>
                ) : <div><CircularProgress /> Loading...</div>}</div></main>

            </div> : <div className={classes.logout}><BlockIcon /><br /><div>Please <a href="http://localhost:3000/">login</a> to use the administration dashboard.</div></div>
            }
        </div >
    );
}

// 50 iRODS/ 25 helx UI/ 25 robokop UI 

export default Home;
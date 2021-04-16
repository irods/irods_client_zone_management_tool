import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Sidebar from '../components/Sidebar';
import Appbar from '../components/Appbar';
import { makeStyles } from '@material-ui/core/styles';
import ServerIcon from '../img/servers-logo.png';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Pagination from '@material-ui/lab/Pagination';
import { Typography, CircularProgress, Container } from '@material-ui/core';
import { Button, Card, CardHeader, CardContent, Collapse } from '@material-ui/core';
import { Dialog, DialogContent, DialogTitle } from '@material-ui/core';
import { Box, Grid, Paper, Tab, Tabs } from '@material-ui/core';
import { useServer } from '../contexts/ServerContext';
import Logout from './Logout';

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
    tab_panel: {
        width: 600,
    },
    info: {
        margin: theme.spacing(1),
    },
    server: {
        width: theme.spacing(8)
    },
    server_card: {
        width: theme.spacing(40),
    },
    server_details: {
        flexGrow: 1,
        display: 'flex',
        height: 600
    },
    divider: {
        marginTop: theme.spacing(20)
    },
    status_box: {
        display: 'flex',
        justifyContent: 'center'
    },
    logout: {
        marginTop: theme.spacing(20),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontSize: theme.spacing(3)
    },
    tabs: {
        width: 250,
        borderRight: `1px solid ${theme.palette.divider}`,
    },
    tab: {
        marginTop: 30,
        textTransform: 'none',
        fontSize: 18
    },
    paper: {
        height: 170,
        width: 180,
        padding: theme.spacing(1)
    },
    paper_title: {
        fontSize: 20
    },
    paper_content: {
        paddingTop: 20,
        textAlign: 'center',
        color: '#18bc9c',
        fontSize: 50,
    }
}));

function Home() {
    const auth = localStorage.getItem('zmt-token')
    if (auth === null) {
        return <Logout />
    }
    const { userContext, groupContext, rescContext, zoneContext, loadData } = useServer();
    const [curr_zone, setCurrZone] = useState();
    const [details, setDetails] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [tabValue, setTab] = useState(0);
    const classes = useStyles();
    let zone_id = 0;

    const [status, setStatus] = useState()

    useEffect(() => {
        loadData();
        setStatus("OK");
    }, [])

    const handleExpandClick = () => {
        setExpanded(!expanded);
    }

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    }

    const viewDetails = (event) => {
        setDetails(true);
    }

    const closeDetails = (event) => {
        setDetails(false);
    }

    function TabPanel(props) {
        const { children, value, index, ...other } = props;

        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`vertical-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Box p={3}>
                        <Typography>{children}</Typography>
                    </Box>
                )}
            </div>
        );
    }

    TabPanel.propTypes = {
        children: PropTypes.node,
        index: PropTypes.any.isRequired,
        value: PropTypes.any.isRequired,
    };

    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    return (
        <div>
            <div className={classes.root}><Appbar /><Sidebar menu_id="0" /><main className={classes.content}><div className={classes.toolbar} />
                <div className={classes.main}>
                    <Container className={classes.status_box}>
                        <Grid item xs={12} md={8} lg={9}>
                            <Paper className={classes.paper}>
                                <Typography className={classes.paper_title}>Servers</Typography>
                                <Typography className={classes.paper_content}>{zoneContext === undefined ? 0 : zoneContext['servers'].length + 1}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={8} lg={9}>
                            <Paper className={classes.paper}>
                                <Typography className={classes.paper_title}>Zone Status</Typography>
                                <Typography className={classes.paper_content}>{status}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={8} lg={9}>
                            <Paper className={classes.paper}>
                                <Typography className={classes.paper_title}>Users</Typography>
                                <Typography className={classes.paper_content}>{userContext === undefined ? 0 : userContext.total}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={8} lg={9}>
                            <Paper className={classes.paper}>
                                <Typography className={classes.paper_title}>Groups</Typography>
                                <Typography className={classes.paper_content}>{groupContext === undefined ? 0 : groupContext.total}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={8} lg={9}>
                            <Paper className={classes.paper}>
                                <Typography className={classes.paper_title}>Resources</Typography>
                                <Typography className={classes.paper_content}>{rescContext === undefined ? 0 : rescContext.total}</Typography>
                            </Paper>
                        </Grid>
                    </Container>
                    <br />
                    <Pagination count={1} /><br />{zoneContext !== undefined ?
                        <Card key={zone_id} className={classes.server_card} id={zone_id}>
                            <CardHeader
                                avatar={
                                    <img alt="Zone Icon" className={classes.server} id={zone_id} src={ServerIcon}></img>
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
                                    <Typography paragraph>Hostname: {zoneContext['icat_server']['host_system_information']['hostname']}</Typography>
                                    <Typography paragraph>OS Distribution Name: {zoneContext['icat_server']['host_system_information']['os_distribution_name']}</Typography>
                                    <Typography paragraph>OS Distribution Version: {zoneContext['icat_server']['host_system_information']['os_distribution_version']}</Typography>
                                    <Button onClick={viewDetails} color="primary">Details</Button>
                                </CardContent>
                                {details === true ? <Dialog open={details} className={classes.dialog} onClose={closeDetails}>
                                    <DialogTitle>Server Details</DialogTitle>
                                    <DialogContent className={classes.server_details}>
                                        <Tabs orientation="vertical" variant="scrollable" value={tabValue} className={classes.tabs} onChange={handleTabChange} aria-label="vertical tabs example">
                                            <Tab className={classes.tab} label="Host" {...a11yProps(0)} />
                                            <Tab className={classes.tab} label="Service" {...a11yProps(1)} />
                                            <Tab className={classes.tab} label="Plugin" {...a11yProps(2)} />
                                        </Tabs>
                                        <TabPanel className={classes.tab_panel} value={tabValue} index={0}>
                                            <Typography component={'span'} className={classes.info}>Schema Name: {zoneContext['icat_server']['host_access_control_config']['schema_name']}</Typography>
                                            <Typography component={'span'} className={classes.info}>Schema Version: {zoneContext['icat_server']['host_access_control_config']['schema_version']}</Typography>
                                            <Typography component={'span'} className={classes.info}>Catalog Schema Version: {zoneContext['icat_server']['version']['catalog_schema_version']}</Typography>
                                            <Typography component={'span'} className={classes.info}>Configuration Schema Version: {zoneContext['icat_server']['version']['configuration_schema_version']}</Typography>
                                            <Typography component={'span'} className={classes.info}>iRODS Version: {zoneContext['icat_server']['version']['irods_version']}</Typography>
                                            <Typography component={'span'} className={classes.info}>Installation Time: {zoneContext['icat_server']['version']['installation_time']}</Typography>
                                        </TabPanel>
                                        <TabPanel className={classes.tab_panel} value={tabValue} index={1}>
                                        </TabPanel>
                                        <TabPanel className={classes.tab_panel} value={tabValue} index={2}>
                                        </TabPanel>
                                    </DialogContent>
                                </Dialog> : <span />}
                            </Collapse>
                        </Card> : <div><CircularProgress /> Loading...</div>}</div></main>
            </div>
        </div >
    );
}

export default Home;
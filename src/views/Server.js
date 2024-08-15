import React, { Fragment, useEffect, useState } from 'react';
import { TabPanel } from '../components'
import { useEnvironment, useServer } from '../contexts';
import { makeStyles, Button, Dialog, DialogContent, DialogTitle, Paper, Tab, Tabs, LinearProgress } from '@material-ui/core';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TableSortLabel } from '@material-ui/core';
import { navigate } from '@reach/router';

const useStyles = makeStyles((theme) => ({
    pagination: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    tab_panel: {
        width: 700,
    },
    info: {
        margin: theme.spacing(1),
        fontSize: 14
    },
    plugin_info: {
        fontSize: 14
    },
    server: {
        width: theme.spacing(8)
    },
    server_details: {
        flexGrow: 1,
        display: 'flex',
        height: 600,
        padding: 0
    },
    tabs: {
        width: 250,
    },
    tab: {
        marginTop: 20,
        textTransform: 'none',
        fontSize: 15
    }
}))

export const Server = () => {
    if (!localStorage.getItem('zmt-token')) navigate('/');

    const classes = useStyles();
    const { isLoadingZoneContext, zoneContext, filteredServers, loadCurrServers } = useServer();
    const environment = useEnvironment();
    const serversPageKey = environment.serversPageKey;
    const [currPage, setCurrPage] = useState(1);
    const [perPage, setPerPage] = useState(parseInt(localStorage.getItem(serversPageKey), 10));
    const [tabValue, setTabValue] = useState(0);
    const [openDetails, setOpenDetails] = useState(false);
    const [currServer, setCurrServer] = useState();
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("role");

    useEffect(() => {
        // runs on initial render
        const serversPerPage = localStorage.getItem(serversPageKey);
        
        if (!serversPerPage) {
            localStorage.setItem(serversPageKey, environment.defaultItemsPerPage);
            setPerPage(environment.defaultItemsPerPage);
        } 
    }, [])

    useEffect(() => {
        loadCurrServers(perPage * (currPage - 1), perPage, order, orderBy);
        environment.pageTitle = environment.serversTitle;
        document.title = `${environment.titleFormat()}`
    }, [perPage, currPage, order, orderBy])

    const handleSort = props => {
        const isAsc = orderBy === props && order === 'desc';
        setOrder(isAsc ? 'asc' : 'desc');
        setOrderBy(props);
    }

    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    return (
        <Fragment>
            {isLoadingZoneContext ? <LinearProgress /> : <div className="table_view_spinner_holder" />}
            <br />
            {zoneContext === undefined ? <div>Cannot load server data. Please check your iRODS Client HTTP API endpoint connection.</div> :
                <Fragment>
                    <TablePagination component="div" className={classes.pagination} page={currPage - 1} count={parseInt(zoneContext.length)} rowsPerPage={perPage} onChangePage={(event, value) => { setCurrPage(value + 1) }} onChangeRowsPerPage={(e) => { setPerPage(e.target.value); setCurrPage(1); localStorage.setItem(serversPageKey, e.target.value) }} />
                    <TableContainer className={classes.tableContainer} component={Paper}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ width: '25%' }}><TableSortLabel active={orderBy === "role"} direction={orderBy === "role" ? order : 'asc'} onClick={() => { handleSort("role") }}><b>Role</b></TableSortLabel></TableCell>
                                    <TableCell style={{ width: '15%' }}><TableSortLabel active={orderBy === "irods-version"} direction={orderBy === "irods-version" ? order : 'asc'} onClick={() => { handleSort("irods-version") }}><b>iRODS Version</b></TableSortLabel></TableCell>
                                    <TableCell style={{ width: '25%' }}><TableSortLabel active={orderBy === "hostname"} direction={orderBy === "hostname" ? order : 'asc'} onClick={() => { handleSort("hostname") }}><b>Hostname</b></TableSortLabel></TableCell>
                                    <TableCell style={{ width: '10%' }}><TableSortLabel active={orderBy === "resources"} direction={orderBy === "resources" ? order : 'asc'} onClick={() => { handleSort("resources") }}><b>Resources</b></TableSortLabel></TableCell>
                                    <TableCell style={{ width: '20%' }}><TableSortLabel active={orderBy === "os"} direction={orderBy === "os" ? order : 'asc'} onClick={() => { handleSort("os") }}><b>OS Distribution</b></TableSortLabel></TableCell>
                                    <TableCell style={{ width: '5%' }} align="right"></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {!isLoadingZoneContext && filteredServers && (filteredServers.length === 0 ? <TableRow><TableCell colSpan={6}><div className="table_view_no_results_container">No results found.</div></TableCell></TableRow> :
                                    filteredServers.map((server) =>
                                        <TableRow key={server['host_system_information']['hostname']}>
                                            <TableCell style={{ borderLeft: `25px solid ${server['server_config']['catalog_service_role'] === 'provider'? '#04d1c2' : '#808080'}`, width: '25%' }}>{server['server_config']['catalog_service_role'] === 'provider' ? "Catalog Service Provider" : "Catalog Service Consumer"}</TableCell>
                                            <TableCell style={{ width: '15%' }}>{server['version']['irods_version']}</TableCell>
                                            <TableCell style={{ width: '25%' }}>{server['host_system_information']['hostname']}</TableCell>
                                            <TableCell style={{ width: '10%' }}>{server['resources']}</TableCell>
                                            <TableCell style={{ width: '20%' }}>{server['host_system_information']['os_distribution_name'] + " " + server['host_system_information']['os_distribution_version']}</TableCell>
                                            <TableCell style={{ width: '5%' }} align='right'><Button color="primary" onClick={() => { setCurrServer(server); setOpenDetails(true); }}>Details</Button></TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {currServer !== undefined &&
                        <Dialog open={openDetails} className={classes.dialog} onClose={() => setOpenDetails(false)}>
                            <DialogTitle>Server Details</DialogTitle>
                            <DialogContent className={classes.server_details}>
                                <Tabs orientation="vertical" variant="scrollable" value={tabValue} className={classes.tabs} onChange={(event, newValue) => setTabValue(newValue)} aria-label="vertical tabs example" indicatorColor="primary" textColor="primary">
                                    <Tab className={classes.tab} label="General" {...a11yProps(0)} />
                                    <Tab className={classes.tab} label="Service Configuration" {...a11yProps(1)} />
                                    <Tab className={classes.tab} label="Service Account Environment" {...a11yProps(2)} />
                                    <Tab className={classes.tab} label={<React.Fragment><span>Plugin ({currServer['plugins'].length})</span></React.Fragment>} {...a11yProps(3)} />
                                </Tabs>
                                <TabPanel className={classes.tab_panel} value={tabValue} index={0}>
                                    <p className={classes.info}>Hostname: {currServer['host_system_information']['hostname']}</p>
                                    <p className={classes.info}>OS Distribution Name: {currServer['host_system_information']['os_distribution_name']}</p>
                                    <p className={classes.info}>OS Distribution Version: {currServer['host_system_information']['os_distribution_version']}</p>
                                    <p className={classes.info}>Service Account Group Name: {currServer['host_system_information']['service_account_group_name']}</p>
                                    <p className={classes.info}>Service Account User Name: {currServer['host_system_information']['service_account_user_name']}</p>
                                    <p className={classes.info}>Schema Name: {currServer['server_config']['schema_name']}</p>
                                    <p className={classes.info}>Schema Version: {currServer['server_config']['schema_version']}</p>
                                    <p className={classes.info}>Catalog Schema Version: {currServer['version']['catalog_schema_version']}</p>
                                    <p className={classes.info}>Configuration Schema Version: {currServer['version']['configuration_schema_version']}</p>
                                    <p className={classes.info}>iRODS Version: {currServer['version']['irods_version']}</p>
                                    <p className={classes.info}>Installation Time: {currServer['version']['installation_time']}</p>
                                </TabPanel>
                                <TabPanel className={classes.tab_panel} value={tabValue} index={1}>
                                    <p className={classes.info}>Catalog Provider Hosts: {currServer['server_config']['catalog_provider_hosts']}</p>
                                    <p className={classes.info}>Catalog Service Role: {currServer['server_config']['catalog_service_role']}</p>
                                    <p className={classes.info}>Client Api Whitelist Policy: {currServer['server_config']['client_api_whitelist_policy']}</p>
                                    <p className={classes.info}>Default Dir Mode: {currServer['server_config']['default_dir_mode']}</p>
                                    <p className={classes.info}>Default File Mode: {currServer['server_config']['default_file_mode']}</p>
                                    <p className={classes.info}>Default Hash Scheme: {currServer['server_config']['default_hash_scheme']}</p>
                                    <p className={classes.info}>Default Resource Name: {currServer['server_config']['default_resource_name']}</p>
                                    <p className={classes.info}>Match Hash Policy: {currServer['server_config']['match_hash_policy']}</p>
                                    <p className={classes.info}>Server Control Plane Encryption Algorithm: {currServer['server_config']['server_control_plane_encryption_algorithm']}</p>
                                    <p className={classes.info}>Server Control Plane Encryption Num Hash Rounds: {currServer['server_config']['server_control_plane_encryption_num_hash_rounds']}</p>
                                    <p className={classes.info}>Server Control Plane Port: {currServer['server_config']['server_control_plane_port']}</p>
                                    <p className={classes.info}>Server Port Range: {currServer['server_config']['server_port_range_start']} - {currServer['server_config']['server_port_range_end']}</p>
                                    <p className={classes.info}>Zone Auth Scheme: {currServer['server_config']['zone_auth_scheme']}</p>
                                    <p className={classes.info}>Zone Port: {currServer['server_config']['zone_port']}</p>
                                    <p className={classes.info}>Zone User: {currServer['server_config']['zone_user']}</p>
                                </TabPanel>
                                <TabPanel className={classes.tab_panel} value={tabValue} index={2}>
                                    <p className={classes.info}>iRODS Client Server Negotiation: {currServer['service_account_environment']['irods_client_server_negotiation']}</p>
                                    <p className={classes.info}>iRODS Client Server Policy: {currServer['service_account_environment']['irods_client_server_policy']}</p>
                                    <p className={classes.info}>iRODS Connection Refresh Time: {currServer['service_account_environment']['irods_connection_pool_refresh_time_in_seconds']}</p>
                                    <p className={classes.info}>iRODS CWD: {currServer['service_account_environment']['irods_cwd']}</p>
                                    <p className={classes.info}>iRODS Default Hash Scheme: {currServer['service_account_environment']['irods_default_hash_scheme']}</p>
                                    <p className={classes.info}>iRODS Default Resource: {currServer['service_account_environment']['irods_default_resource']}</p>
                                    <p className={classes.info}>iRODS Encryption Algorithm: {currServer['service_account_environment']['irods_encryption_algorithm']}</p>
                                    <p className={classes.info}>iRODS Encryption Key Size: {currServer['service_account_environment']['irods_encryption_key_size']}</p>
                                    <p className={classes.info}>iRODS Encryption Hash Rounds: {currServer['service_account_environment']['irods_encryption_num_hash_rounds']}</p>
                                    <p className={classes.info}>iRODS Encryption Salt Size: {currServer['service_account_environment']['irods_encryption_salt_size']}</p>
                                    <p className={classes.info}>iRODS Home: {currServer['service_account_environment']['irods_home']}</p>
                                    <p className={classes.info}>iRODS Maximum Size for Single Buffer In Megabytes: {currServer['service_account_environment']['irods_maximum_size_for_single_buffer_in_megabytes']}</p>
                                </TabPanel>
                                <TabPanel className={classes.tab_panel} value={tabValue} index={3}>
                                    <table>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <b>Name</b>
                                                </td>
                                                <td>
                                                    <b>Type</b>
                                                </td>
                                            </tr>
                                            {currServer['plugins'].map(plugin => (
                                                <tr key={plugin.name}>
                                                    <td>
                                                        <div className={classes.plugin_info}>{plugin.name}</div>
                                                    </td>
                                                    <td>
                                                        <p className={classes.info}>{plugin.type}</p>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </TabPanel>
                            </DialogContent>
                        </Dialog>
                    }
                </Fragment>
            }
        </Fragment>
    )
}

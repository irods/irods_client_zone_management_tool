import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CircularProgress from '@material-ui/core/CircularProgress';
import Appbar from '../components/Appbar';
import Sidebar from '../components/Sidebar';
import Logout from '../views/Logout';
import Cookies from 'js-cookie';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { FormControl, Input, InputLabel } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { StylesProvider } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Paper } from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import Pagination from '@material-ui/lab/Pagination';
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';
import { useServer } from '../contexts/ServerContext';

import '../App.css';
import Rows from '../components/Rows';
import { useEnvironment } from '../contexts/EnvironmentContext';

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
    logout: {
        marginTop: theme.spacing(20),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontSize: theme.spacing(3)
    },
    dialog_action: {
        margin: theme.spacing(1)
    },
    formControl: {
        margin: theme.spacing(1),
        width: 200
    },
    table: {
        minWidth: 650
    },
    tableContainer: {
        marginTop: 20
    },
    container: {
        display: 'flex',
        flexDirection: 'row'
    },
    remove_content: {
        fontSize: 18
    },
    remove_result: {
        textAlign: 'center',
        color: 'red'
    },
    sort_arrow: {
        opacity: 0.2
    },
    add_hidden: {
        display: 'none'
    },
    pagination: {
        display: 'flex',
        flexDirection: 'row',
        margin: theme.spacing(1),
        justifyContent: 'center'
    },
    pagination_item: {
        transitionDuration: '1.5s'
    },
    search: {
        marginLeft: 30,
        width: 200
    },
    add_button: {
        marginLeft: 30
    },
    itemsControl: {
        marginLeft: 30,
        minWidth: 120
    }
}));

function Resource() {
    const token = Cookies.get('token');
    if (token === undefined) {
        return <Logout />
    }
    const classes = useStyles();
    const [isLoading, setLoading] = useState(false);
    const [resc, setResc] = useState([]);
    const [addFormOpen, setAddFormOpen] = useState(false);
    const [addResult, setAddResult] = useState();

    const [removeFormOpen, setRemoveFormOpen] = useState(false);
    const [removeResult, setRemoveResult] = useState();

    const [rescName, setRescName] = useState();
    const [rescType, setRescType] = useState();
    const [rescHostname, setRescHostname] = useState();
    const [rescLocation, setRescLocation] = useState();
    const [rescZone, setRescZone] = useState();
    const [rescVaultPath, setRescVaultPath] = useState();
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState(0);

    const [zone, setZone] = useState(localStorage.getItem('zoneName'));
    const [currPage, setCurrPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalPage, setTotalPage] = useState();

    const [searchRescName, setSearchName] = useState();


    const server = useServer();
    const environment = useEnvironment();

    useEffect(() => {
        loadContent(currPage, perPage);
    }, [currPage, perPage, searchRescName])

    useEffect(() => {
        if (resc.length !== 0) {
            const sortedArray = [...resc];
            sortedArray.sort(getComparator(order, orderBy));
            setResc(sortedArray);
            console.log(sortedArray);
        }
    }, [order, orderBy])

    function descendingComparator(a, b, orderBy) {
        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    }

    function getComparator(order, orderBy) {
        return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
    }

    const loadContent = async (prop) => {
        console.log(server)
        let _query;
        if (searchRescName == undefined) {
            _query = `SELECT RESC_NAME,RESC_TYPE_NAME,RESC_ZONE_NAME,RESC_VAULT_PATH,RESC_LOC,RESC_INFO, RESC_FREE_SPACE, RESC_COMMENT,RESC_STATUS,RESC_CONTEXT`
        }
        else {
            _query = `SELECT RESC_NAME,RESC_TYPE_NAME,RESC_ZONE_NAME,RESC_VAULT_PATH,RESC_LOC,RESC_INFO, RESC_FREE_SPACE, RESC_COMMENT,RESC_STATUS,RESC_CONTEXT WHERE RESC_NAME LIKE '%${searchRescName}%'`
        }
        const groupResult = axios({
            method: 'GET',
            url: `${environment.restApiLocation}/irods-rest/1.0.0/query`,
            headers: {
                'Authorization': Cookies.get('token')
            },
            params: {
                query_string: _query,
                query_limit: perPage,
                row_offset: (currPage - 1) * perPage,
                query_type: 'general'
            }
        }).then((res) => {
            let sortedArray = res.data._embedded;
            sortedArray.sort();
            setResc(sortedArray);
            setTotalPage(Math.ceil(res.data.total / perPage));
        }).catch((e) => {
        });
    }

    const updateContent = () => {
        server.updateResource();
        console.log("Request updating server provider.");
        loadContent();
    }

    async function addResource() {
        setAddFormOpen(true);
        setLoading(true);
        const rescAddResult = await axios({
            method: 'POST',
            url: `${environment.restApiLocation}/irods-rest/1.0.0/admin`,
            headers: {
                'Authorization': token
            },
            params: {
                action: 'add',
                target: 'resource',
                arg2: rescName,
                arg3: rescType,
                arg4: rescLocation + ":" + rescVaultPath,
                arg5: "",
                arg6: zone
            }
        }).then((res) => {
            window.location.reload();
            setAddResult("Resource created.")
            setLoading(false);
        }).catch((e) => {
            setAddResult(`Error Code ${e.response.data.error_code}: ${e.response.data.error_message}`);
            setLoading(false);
        })
    }

    const handleAddRowOpen = () => {
        // setAddFormOpen(true);
        document.getElementById("add_newrow").style["display"] = "contents";
    }

    const handleAddFormClose = () => {
        setAddFormOpen(false);
    }

    const handleAddRowClose = () => {
        document.getElementById("add_newrow").style["display"] = "none";
    }

    const handleRemoveFormOpen = (props) => {
        setRescName(props[0]);
        setRemoveFormOpen(true);
    }

    const handleRemoveFormClose = () => {
        setRemoveFormOpen(false);
        setRemoveResult();
    }

    const handleRescNameChange = (event) => {
        setRescName(event.target.value);
    }

    const handleRescTypeChange = (event) => {
        setRescType(event.target.value);
    }

    const handleRescLocationChange = (event) => {
        console.log(encodeURI(event.target.value));
        setRescLocation(encodeURI(event.target.value));
    }
    const handleRescVaultPathChange = (event) => {
        setRescVaultPath(event.target.value);
    }

    const handleSort = (props) => {
        const isAsc = orderBy === props && order == 'desc';
        setOrder(isAsc ? 'asc' : 'desc');
        setOrderBy(props);
    }

    const handlePageChange = (event, value) => {
        setCurrPage(value);
    }


    return (
        <div className={classes.root}>
            <Appbar />
            <Sidebar menu_id="3" />
            <main className={classes.content}>
                <div className={classes.toolbar} />
                <div className={classes.main}>
                    <div className={classes.pagination}>
                        <Pagination className={classes.pagination_item} count={totalPage} onChange={handlePageChange} />
                        <FormControl className={classes.itemsControl}>
                            <InputLabel htmlFor="items-per-page">Items Per Page</InputLabel>
                            <Select
                                native
                                id="items-per-page"
                                label="Items Per Page"
                                onChange={(event) => { setPerPage(event.target.value); setCurrPage(1); }}
                            >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </Select>
                        </FormControl>
                        <TextField
                            className={classes.search}
                            id="search-term"
                            label="Search"
                            placeholder="Search by ResourceName"
                            onChange={(event) => setSearchName(event.target.value)}
                        />
                        <Button className={classes.add_button} variant="outlined" color="primary" onClick={handleAddRowOpen}>
                            Add New Resource
                        </Button>
                    </div>
                    <br />
                    <TableContainer className={classes.tableContainer} component={Paper}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead>
                                <StylesProvider injectFirst>
                                    <TableRow>
                                        <TableCell style={{ fontSize: '1.1rem', width: '20%' }} key="0"><b>Resource Name</b><TableSortLabel active={orderBy === 0} direction={orderBy === 0 ? order : 'asc'} onClick={() => { handleSort(0) }} /></TableCell>
                                        <TableCell style={{ fontSize: '1.1rem', width: '20%' }} key="1" align="left"><b>Type</b><TableSortLabel active={orderBy === 1} direction={orderBy === 1 ? order : 'asc'} onClick={() => { handleSort(1) }} /></TableCell>
                                        <TableCell style={{ fontSize: '1.1rem', width: '15%' }} key="8" align="left"><b>Hostname</b><TableSortLabel active={orderBy === 4} direction={orderBy === 4 ? order : 'asc'} onClick={() => { handleSort(4) }} /></TableCell>
                                        <TableCell style={{ fontSize: '1.1rem', width: '25%' }} key="3" align="left"><b>Vault Path</b><TableSortLabel active={orderBy === 3} direction={orderBy === 3 ? order : 'asc'} onClick={() => { handleSort(3) }} /></TableCell>
                                        <TableCell style={{ fontSize: '1.1rem', width: '30%' }} key="2" align="left"><b>Zone</b><TableSortLabel active={orderBy === 2} direction={orderBy === 2 ? order : 'asc'} onClick={() => { handleSort(2) }} /></TableCell>
                                    </TableRow>
                                </StylesProvider>
                            </TableHead>
                            <TableBody>
                                <TableRow id="add_newrow" className={classes.add_hidden}>
                                    <TableCell><Input id="name"
                                        onChange={handleRescNameChange}></Input></TableCell>
                                    <TableCell><Select
                                        native
                                        id="zone-type-select"
                                        placeholder="Resource Type"
                                        onChange={handleRescTypeChange}
                                    >
                                        <option aria-label="None" value="" />
                                        <option value="compound">Compound</option>
                                        <option value="load_balance">Load Balance</option>
                                        <option value="passthru">Passthru</option>
                                        <option value="random">Random</option>
                                        <option value="replication">Replication</option>
                                        <option value="round_robin">Round Robin</option>
                                        <option value="deferred">Deferred</option>
                                        <option value="emc_ecs">EMC ECS</option>
                                        <option value="emc_isilon">EMC Isilon</option>
                                        <option value="mockarchive">Mockarchive</option>
                                        <option value="mso">MSO</option>
                                        <option value="mssofile">MSSOFile</option>
                                        <option value="non_blocking">Non-blocking</option>
                                        <option value="struct_file">Struct file</option>
                                        <option value="universal_mass_storage">Universal Mass Storage</option>
                                        <option value="unixfilesystem">Unix File System</option>
                                        <option value="wos">WOS</option>
                                    </Select></TableCell>
                                    <TableCell><Input id="location"
                                        onChange={handleRescLocationChange}></Input></TableCell>
                                    <TableCell><Input id="vault_path"
                                        onChange={handleRescVaultPathChange}></Input></TableCell>
                                    <TableCell><ToggleButtonGroup size="small"><ToggleButton onClick={addResource}><SaveIcon /></ToggleButton><ToggleButton onClick={handleAddRowClose}><CloseIcon /></ToggleButton></ToggleButtonGroup></TableCell>
                                </TableRow>
                                {resc.map(this_resc => <Rows key={this_resc[0]} row={this_resc} handleRemoveFormOpen={handleRemoveFormOpen} />)}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Dialog open={addFormOpen} onClose={handleAddFormClose} aria-labelledby="form-dialog-title">
                        <DialogTitle>Add New Resource</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Resource Name: {rescName}<br />
                                    Type: {rescType}<br />
                                    Vault Path: {rescLocation}<br />
                                    Zone: {rescZone}
                            </DialogContentText>
                            {isLoading == true ? <div className={classes.progress}>Creating in progress...<CircularProgress /></div> : <p>{addResult}</p>}
                        </DialogContent>
                        <DialogActions className={classes.dialog_action}>
                        </DialogActions>
                    </Dialog>
                </div>
            </main>
        </div>
    );
}

export default Resource;
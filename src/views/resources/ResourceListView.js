import React, { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import { Logout } from '../../views/Logout';
import { makeStyles, Button, CircularProgress, Input, Select, TextField, LinearProgress } from '@material-ui/core';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Table, TableBody, TableCell, TableContainer, TablePagination, TableHead, TableRow, TableSortLabel, Paper } from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';
import { useEnvironment, useServer } from '../../contexts';
import '../../App.css';
import ResourceRows from '../../components/ResourceRows';
import ListIcon from '@material-ui/icons/List';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import { navigate } from '@reach/router';

const useStyles = makeStyles((theme) => ({
    dialog_action: {
        margin: theme.spacing(1)
    },
    tableContainer: {
        marginTop: 20
    },
    add_hidden: {
        display: 'none'
    },
    filterGroup: {
        display: 'flex',
        flexDirection: 'row',
        margin: theme.spacing(1),
        justifyContent: 'center'
    },
    pagination: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    filter: {
        marginLeft: 30,
        width: 300
    },
    add_button: {
        marginLeft: 30
    }
}));

export const ResourceListView = () => {
    const auth = localStorage.getItem('zmt-token');
    const classes = useStyles();
    const tab = 'list';
    const [isLoading, setLoading] = useState(false);
    const [addFormOpen, setAddFormOpen] = useState(false);
    const [addResult, setAddResult] = useState();
    const [rescName, setRescName] = useState();
    const [rescType, setRescType] = useState();
    const [rescLocation, setRescLocation] = useState();
    const [rescVaultPath, setRescVaultPath] = useState();
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("RESC_NAME");
    const [currPage, setCurrPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [filterRescName, setFilterName] = useState('');
    const { restApiLocation } = useEnvironment();
    const { isLoadingRescContext, zoneName, rescContext, rescTypes, loadResource } = useServer();

    useEffect(() => {
        if(zoneName) loadResource((currPage - 1) * perPage, perPage, filterRescName, order, orderBy);
    }, [currPage, perPage, filterRescName, order, orderBy])

    async function addResource() {
        setAddFormOpen(true);
        setLoading(true);
        await axios({
            method: 'POST',
            url: `${restApiLocation}/admin`,
            headers: {
                'Authorization': auth
            },
            params: {
                action: 'add',
                target: 'resource',
                arg2: rescName,
                arg3: rescType,
                arg4: rescLocation + ":" + rescVaultPath,
                arg5: "",
                arg6: zoneName
            }
        }).then(() => {
            window.location.reload();
            setAddResult("Resource created.")
            setLoading(false);
        }).catch((e) => {
            setAddResult(`Error Code ${e.response.data.error_code}: ${e.response.data.error_message}`);
            setLoading(false);
        })
    }

    const handleAddRowOpen = () => {
        document.getElementById("add_newrow").style["display"] = "contents";
    }

    const handleAddFormClose = () => {
        setAddFormOpen(false);
    }

    const handleAddRowClose = () => {
        document.getElementById("add_newrow").style["display"] = "none";
    }

    const handleRemoveFormOpen = (resc) => {
        setRescName(resc[0]);
    }

    const handleRescNameChange = (event) => {
        // trim all whitespace in the resource name
        setRescName(event.target.value.trim());
    }

    const handleRescTypeChange = (event) => {
        setRescType(event.target.value.trim());
    }

    const handleRescLocationChange = (event) => {
        setRescLocation(encodeURI(event.target.value.trim()));
    }
    const handleRescVaultPathChange = (event) => {
        setRescVaultPath(event.target.value.trim());
    }

    const handleSort = (props) => {
        const isAsc = orderBy === props && order === 'desc';
        setOrder(isAsc ? 'asc' : 'desc');
        setOrderBy(props);
    }

    const handlePageChange = (event, value) => {
        setCurrPage(value + 1);
    }

    if (auth === null) {
        return <Logout />
    }

    return (
        <Fragment>
            {isLoadingRescContext ? <LinearProgress /> : <div className="table_view_spinner_holder" />}
            <br />
            {rescContext === undefined ? <div>Cannot load resource data. Please check iRODS Client Rest API.</div> : <Fragment>
                <ToggleButtonGroup className={classes.tabGroup} size="small" value={tab}>
                    <ToggleButton value="list" aria-label="list" onClick={() => navigate('/resources')}><ListIcon /></ToggleButton>
                    <ToggleButton value="tree" aria-label="tree" onClick={() => navigate('/resources/tree')}><AccountTreeIcon /></ToggleButton>
                </ToggleButtonGroup>
                <div className={classes.filterGroup}>
                    <TextField
                        className={classes.filter}
                        id="filter-term"
                        label="Filter"
                        placeholder="Filter by Name or Hostname"
                        onChange={(e) => setFilterName(e.target.value)}
                    />
                    <Button className={classes.add_button} variant="outlined" color="primary" onClick={handleAddRowOpen}>
                        Add New Resource
                    </Button>
                </div>
                <Fragment><TablePagination component="div" className={classes.pagination} page={currPage - 1} count={parseInt(rescContext.total)} rowsPerPage={perPage} onChangePage={handlePageChange} onChangeRowsPerPage={(e) => { setPerPage(e.target.value); setCurrPage(1) }} />
                    <TableContainer className={classes.tableContainer} component={Paper}>
                        <Table aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                </TableRow>
                                <TableRow>
                                    <TableCell style={{ fontSize: '1.1rem', width: '20%' }} key="0" ><TableSortLabel active={orderBy === 'RESC_NAME'} direction={orderBy === 'RESC_NAME' ? order : 'asc'} onClick={() => { handleSort('RESC_NAME') }} ><b>Name</b></TableSortLabel></TableCell>
                                    <TableCell style={{ fontSize: '1.1rem', width: '20%' }} key="1" align="left"><TableSortLabel active={orderBy === 'RESC_TYPE_NAME'} direction={orderBy === 'RESC_TYPE_NAME' ? order : 'asc'} onClick={() => { handleSort('RESC_TYPE_NAME') }}><b>Type</b></TableSortLabel></TableCell>
                                    <TableCell style={{ fontSize: '1.1rem', width: '25%' }} key="8" align="left"><TableSortLabel active={orderBy === 'RESC_LOC'} direction={orderBy === 'RESC_LOC' ? order : 'asc'} onClick={() => { handleSort('RESC_LOC') }}><b>Hostname</b></TableSortLabel></TableCell>
                                    <TableCell style={{ fontSize: '1.1rem', width: '25%' }} key="3" align="left"><TableSortLabel active={orderBy === 'RESC_VAULT_PATH'} direction={orderBy === 'RESC_VAULT_PATH' ? order : 'asc'} onClick={() => { handleSort('RESC_VAULT_PATH') }}><b>Vault Path</b></TableSortLabel></TableCell>
                                    <TableCell style={{ fontSize: '1.1rem', width: '1%' }} align="right"></TableCell>
                                </TableRow>
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
                                        {rescTypes.length && rescTypes.map(type => <option key={`resource-type-${type}`} value={type}>{type}</option>)}
                                    </Select></TableCell>
                                    <TableCell><Input id="location"
                                        onChange={handleRescLocationChange}></Input></TableCell>
                                    <TableCell><Input id="vault_path"
                                        onChange={handleRescVaultPathChange}></Input></TableCell>
                                    <TableCell><ToggleButtonGroup size="small"><ToggleButton value="save" onClick={addResource}><SaveIcon /></ToggleButton><ToggleButton value="close" onClick={handleAddRowClose}><CloseIcon /></ToggleButton></ToggleButtonGroup></TableCell>
                                </TableRow>
                                {!isLoadingRescContext && (rescContext._embedded.length === 0 ? <TableRow><TableCell colSpan={4}><div className="table_view_no_results_container">No results found for [{filterRescName}].</div></TableCell></TableRow> :
                                rescContext._embedded.map(this_resc => <ResourceRows key={this_resc[0]} row={this_resc} handleRemoveFormOpen={handleRemoveFormOpen} />))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Fragment>
                <Dialog open={addFormOpen} onClose={handleAddFormClose} aria-labelledby="form-dialog-title">
                    <DialogTitle>Add New Resource</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Resource Name: {rescName}<br />
                            Type: {rescType}<br />
                            Hostname: {rescLocation}<br />
                            Vault Path: {rescVaultPath}
                        </DialogContentText>
                        {isLoading === true ? <div className={classes.progress}>Creating in progress...<CircularProgress /></div> : <p>{addResult}</p>}
                    </DialogContent>
                    <DialogActions className={classes.dialog_action}>
                    </DialogActions>
                </Dialog>
            </Fragment>
            }
        </Fragment>
    );
}
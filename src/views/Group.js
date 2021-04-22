import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from '@reach/router'
import Appbar from '../components/Appbar';
import Sidebar from '../components/Sidebar';
import Logout from '../views/Logout';
import { makeStyles } from '@material-ui/core';
import { Button, FormControl, TextField, Input, InputLabel, Select, Typography } from '@material-ui/core';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Paper } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';

import { useServer } from '../contexts/ServerContext';
import { useEnvironment } from '../contexts/EnvironmentContext';

import Pagination from '@material-ui/lab/Pagination';
import '../App.css';

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
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        minWidth: 200
    },
    link_button: {
        textDecoration: 'none'
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120
    },
    table: {
        minWidth: 650
    },
    user_table: {
        maxWidth: 650
    },
    tableContainer: {
        marginTop: 20
    },
    errorMsg: {
        color: 'red'
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
    filter: {
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

function Group() {
    const { restApiLocation } = useEnvironment();
    const auth = localStorage.getItem('zmt-token');
    if (auth === null) {
        return <Logout />
    }
    const classes = useStyles();
    const { zoneName, groupContext, loadGroup } = useServer();

    const [addErrorMsg, setAddErrorMsg] = useState();
    const [removeErrorMsg, setRemoveErrorMsg] = useState();
    const [addFormOpen, setAddFormOpen] = useState(false);
    const [removeFormOpen, setRemoveFormOpen] = useState(false);
    const [currGroup, setCurrGroup] = useState([]);
    const [filterGroupName, setFilterName] = useState('');
    let group_id = 0;

    const [currPage, setCurrPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("USER_NAME");


    // load group from context provider,
    // pass in perPage, currentPage, filtername('' by default), order, orderBy

    useEffect(() => {
        loadGroup(perPage * (currPage - 1), perPage, filterGroupName, order, "USER_NAME");
    }, [currPage, perPage, filterGroupName, order, orderBy])

    async function addGroup() {
        try {
            await axios({
                method: 'POST',
                url: `${restApiLocation}/admin`,
                params: {
                    action: 'add',
                    target: 'user',
                    arg2: document.getElementById('add-group-name').value,
                    arg3: 'rodsgroup',
                    arg4: zoneName,
                    arg5: ''
                },
                headers: {
                    'Authorization': auth,
                    'Accept': 'application/json'
                }
            }).then(res => {
                window.location.reload();
            })
        }
        catch (e) {
            setAddFormOpen(true);
            setAddErrorMsg("Failed to add group " + e.response.data.error_code + ": " + e.response.data.error_message)
        }
    }

    async function removeGroup() {
        try {
            await axios({
                method: 'POST',
                url: `${restApiLocation}/admin`,
                params: {
                    action: 'rm',
                    target: 'user',
                    arg2: currGroup[0],
                    arg3: zoneName,
                },
                headers: {
                    'Authorization': auth,
                    'Accept': 'application/json'
                }
            }).then(res => {
                window.location.reload();
            })
        } catch (e) {
            console.log(e);
            setRemoveErrorMsg("Failed to remove group " + e.response.error + ":" + e.response.data.error_message)
        }
    }

    const handleAddRowOpen = () => {
        document.getElementById('add-group-row').style["display"] = "contents";
    }

    const handleAddRowClose = () => {
        document.getElementById('add-group-row').style["display"] = "none";
        document.getElementById('add-group-name').value = '';
    }

    const handleAddFormClose = () => {
        handleAddRowClose();
        setAddFormOpen(false);
    }

    const handlePageChange = (event, value) => {
        setCurrPage(value);
    }

    const handleSort = props => {
        const isAsc = orderBy === props && order === 'desc';
        setOrder(isAsc ? 'asc' : 'desc');
        setOrderBy(props);
    }

    const handleRemoveAction = group => {
        setCurrGroup(group);
        setRemoveFormOpen(true);
    }

    const handleRemoveFormClose = () => {
        setRemoveFormOpen(false);
        setRemoveErrorMsg();
    }

    return (
        <div className={classes.root}>
            <Appbar />
            <Sidebar menu_id="5" />
            <main className={classes.content}>
                <div className={classes.toolbar} />
                <div className={classes.main}>
                    <div className={classes.pagination}>
                        <Pagination className={classes.pagination_item} count={Math.ceil(groupContext.total / perPage)} onChange={handlePageChange} />
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
                            className={classes.filter}
                            id="filter-term"
                            label="Filter"
                            placeholder="Filter by GroupName"
                            onChange={(event) => setFilterName(event.target.value)}
                        />
                        <Button className={classes.add_button} variant="outlined" color="primary" onClick={handleAddRowOpen}>
                            Add New Group
                        </Button>
                    </div>
                    <TableContainer className={classes.tableContainer} component={Paper}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ fontSize: '1.1rem', width: '30%' }}><b>Group Name</b><TableSortLabel active={orderBy === "USER_NAME"} direction={orderBy === "USER_NAME" ? order : 'asc'} onClick={() => { handleSort("USER_NAME") }} /></TableCell>
                                    <TableCell style={{ fontSize: '1.1rem', width: '30%', textAlign: 'center' }} ><b>Users</b></TableCell>
                                    <TableCell style={{ fontSize: '1.1rem', width: '30%' }} align="right"><b>Action</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow id="add-group-row" style={{ display: 'none' }}>
                                    <TableCell><Input placeholder="Enter new groupname" id="add-group-name" /></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell align="right"><ToggleButtonGroup size="small"><ToggleButton value="add" onClick={addGroup}><SaveIcon /></ToggleButton><ToggleButton value="close" onClick={handleAddRowClose}><CloseIcon /></ToggleButton></ToggleButtonGroup></TableCell>
                                </TableRow>
                                {groupContext._embedded.map((group) =>
                                    <TableRow key={group_id}>
                                        <TableCell style={{ fontSize: '1.1rem', width: '30%' }} component="th" scope="row">{group[0]}</TableCell>
                                        <TableCell style={{ fontSize: '1.1rem', width: '30%', textAlign: 'center' }} component="th" scope="row">{group[1]}</TableCell>
                                        <TableCell style={{ fontSize: '1.1rem', width: '30%' }} align='right'><Link className={classes.link_button} to='/groups/edit' state={{ groupInfo: group }}><Button color="primary">Edit</Button></Link> {group[0] === 'public' ? <span id={group_id++}></span> : <Button id={group_id++} color="secondary" onClick={() => handleRemoveAction(group)}>Remove</Button>}</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Dialog open={addFormOpen} className={classes.formContainer} onClick={handleAddFormClose} aria-labelledby="form-dialog-title">
                        <DialogTitle>Adding New Group</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Error Message:
                                </DialogContentText>
                            <p className={classes.errorMsg}>{addErrorMsg}</p>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleAddFormClose} color="primary">Close</Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog open={removeFormOpen} className={classes.formContainer} onClose={handleRemoveFormClose} aria-labelledby="form-dialog-title">
                        <DialogTitle>Warning</DialogTitle>
                        <DialogContent>
                            <Typography>Are you sure to remove <b>{currGroup[0]}</b>?</Typography>
                            <p className={classes.errorMsg}>{removeErrorMsg}</p>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={removeGroup} color="secondary">Remove</Button>
                            <Button onClick={handleRemoveFormClose} color="primary">Cancel</Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </main>
        </div>
    );
}

export default Group;
import React, { Fragment, useState, useEffect } from 'react';
import { Link } from '@reach/router';
import axios from 'axios';
import { useEnvironment, useServer } from '../contexts';
import { makeStyles, StylesProvider, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Typography, Input, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TableSortLabel, Select, Paper } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { Logout } from './';

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120
    },
    itemsControl: {
        marginLeft: 30,
        minWidth: 120
    },
    table: {
        minWidth: 650
    },
    tableContainer: {
        marginTop: 20
    },
    errorMsg: {
        color: 'red'
    },
    link_button: {
        textDecoration: 'none'
    },
    pagination: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    filterGroup: {
        display: 'flex',
        flexDirection: 'row',
        margin: theme.spacing(1),
        justifyContent: 'center'
    },
    filter: {
        marginLeft: 30
    },
    add_button: {
        marginLeft: 30
    }
}));

export const User = () => {
    const { restApiLocation } = useEnvironment();
    const auth = localStorage.getItem('zmt-token');
    const classes = useStyles();
    const [currUser, setCurrUser] = useState([]);
    const [addFormOpen, setAddFormOpen] = useState(false);
    const [addErrorMsg, setAddErrorMsg] = useState();
    const [removeErrorMsg, setRemoveErrorMsg] = useState();
    const userTypes = ["rodsuser", "rodsadmin", "groupadmin"];
    const [removeConfirmation, setRemoveConfirmation] = useState(false);
    const [currPage, setCurrPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [filterUsername, setFilterName] = useState('');
    const { zoneName, userContext, loadUser } = useServer();

    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("USER_NAME");

    async function addUser() {
        try {
            await axios({
                method: 'POST',
                url: `${restApiLocation}/admin`,
                headers: {
                    'Authorization': auth
                },
                params: {
                    action: 'add',
                    target: 'user',
                    arg2: document.getElementById('add-user-name').value,
                    arg3: document.getElementById('add-user-type').value,
                    arg4: zoneName,
                    arg5: '',
                }
            }).then(() => {
                window.location.reload();
            })
        } catch (e) {
            setAddFormOpen(true);
            setAddErrorMsg("Failed to add user " + e.response.data.error_code + ": " + e.response.data.error_message)
        }
    }

    async function removeUser() {
        try {
            await axios({
                method: 'POST',
                url: `${restApiLocation}/admin`,
                headers: {
                    'Authorization': auth
                },
                params: {
                    action: 'rm',
                    target: 'user',
                    arg2: currUser[0],
                    arg3: zoneName
                }
            }).then(() => {
                window.location.reload();
            })
        } catch (e) {
            setRemoveErrorMsg("Failed to remove user " + e.response.data.error_code + ": " + e.response.data.error_message)
        }
    }

    const handleRemoveConfirmationOpen = (props) => {
        setCurrUser(props);
        setRemoveConfirmation(true);
    }

    const handleRemoveConfirmationClose = () => {
        setRemoveConfirmation(false);
    }

    const handleAddRowOpen = () => {
        document.getElementById('add-user-row').style["display"] = "contents";
    }

    const handleAddRowClose = () => {
        document.getElementById('add-user-row').style["display"] = "none";
        document.getElementById('add-user-name').value = "";
        document.getElementById('add-user-type').value = "rodsuser";
    }

    const handleAddFormClose = () => {
        handleAddRowClose();
        setAddFormOpen(false);
    }

    const handlePageChange = (event, value) => {
        setCurrPage(value + 1);
    }

    const handleSort = (props) => {
        const isAsc = orderBy === props && order === 'desc';
        setOrder(isAsc ? 'asc' : 'desc');
        setOrderBy(props);
    }

    useEffect(() => {
        loadUser(perPage * (currPage - 1), perPage, filterUsername, order, orderBy)
    }, [currPage, perPage, filterUsername, order, orderBy])

    if (auth === null) {
        return <Logout />
    }

    return (
        <Fragment>
                <div className={classes.filterGroup}>
                    <TextField
                        className={classes.filter}
                        id="filter-term"
                        label="Filter"
                        placeholder="Filter by UserName"
                        onChange={(event) => setFilterName(event.target.value)}
                    />
                    <Button className={classes.add_button} variant="outlined" color="primary" onClick={handleAddRowOpen}>
                        Add New User
                    </Button>
                </div>
                <TablePagination component="div" className={classes.pagination} page={currPage - 1} count={parseInt(userContext.total)} rowsPerPage={perPage} onChangePage={handlePageChange} onChangeRowsPerPage={(e) => { setPerPage(e.target.value); setCurrPage(1) }} />
                <TableContainer className={classes.tableContainer} component={Paper}>
                    <Table className={classes.table} aria-label="simple table">
                        <TableHead>
                            <StylesProvider injectFirst>
                                <TableRow>
                                    <TableCell style={{ fontSize: '1.1rem', width: '20%' }}><b>Username</b><TableSortLabel active={orderBy === 'USER_NAME'} direction={orderBy === 'USER_NAME' ? order : 'asc'} onClick={() => { handleSort('USER_NAME') }} /></TableCell>
                                    <TableCell style={{ fontSize: '1.1rem', width: '20%' }} align="right"><b>Type</b><TableSortLabel active={orderBy === 'USER_TYPE'} direction={orderBy === 'USER_TYPE' ? order : 'asc'} onClick={() => { handleSort('USER_TYPE') }} /></TableCell>
                                    <TableCell style={{ fontSize: '1.1rem', width: '20%' }} align="right"><b>Action</b></TableCell>
                                </TableRow>
                            </StylesProvider>
                        </TableHead>
                        <TableBody>
                            <TableRow id="add-user-row" style={{ display: 'none' }}>
                                <TableCell><Input id="add-user-name" placeholder="Enter new username" /></TableCell>
                                <TableCell align="right"><Select
                                    native
                                    id="add-user-type"
                                >
                                    {userTypes.map(this_user_type => <option key={this_user_type} value={this_user_type}>{this_user_type}</option>)}
                                </Select></TableCell>
                                <TableCell align="right"><ToggleButtonGroup size="small"><ToggleButton value="save" onClick={addUser}><SaveIcon /></ToggleButton><ToggleButton value="close" onClick={handleAddRowClose}><CloseIcon /></ToggleButton></ToggleButtonGroup></TableCell>
                            </TableRow>
                            {userContext !== undefined ? userContext._embedded.map((this_user) =>
                                <TableRow key={this_user[0]}>
                                    <TableCell style={{ fontSize: '1.1rem', width: '20%' }} component="th" scope="row">{this_user[0]}</TableCell>
                                    <TableCell style={{ fontSize: '1.1rem', width: '20%' }} align="right">{this_user[1]}</TableCell>
                                    <TableCell style={{ fontSize: '1.1rem', width: '20%' }} align="right"> {(this_user[0] === 'rods' || this_user[0] === 'public') ? <p></p> : <span><Link className={classes.link_button} to='/users/edit' state={{ userInfo: this_user }}><Button color="primary">Edit</Button></Link>
                                        <Button color="secondary" onClick={() => { handleRemoveConfirmationOpen(this_user) }}>Remove</Button></span>}</TableCell>
                                </TableRow>
                            ) : <span />}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Dialog open={addFormOpen} onClose={handleAddFormClose} aria-labelledby="form-dialog-title">
                    <DialogTitle>Adding New User</DialogTitle>
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
                <Dialog open={removeConfirmation} onClose={handleRemoveConfirmationClose} aria-labelledby="form-dialog-title">
                    <DialogTitle>Warning</DialogTitle>
                    <DialogContent>
                        <Typography>Are you sure to remove <b>{currUser[0]}</b>?</Typography>
                        <p className={classes.errorMsg}>{removeErrorMsg}</p>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={removeUser} color="secondary">Remove</Button>
                        <Button onClick={handleRemoveConfirmationClose} color="primary">Cancel</Button>
                    </DialogActions>
                </Dialog>
        </Fragment>
    );
}
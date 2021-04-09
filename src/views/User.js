import React, { useState, useEffect } from 'react';
import { Link } from '@reach/router';
import axios from 'axios';
import Appbar from '../components/Appbar';
import Sidebar from '../components/Sidebar';
import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { FormControl, InputLabel, Typography } from '@material-ui/core';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { Input, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Paper } from '@material-ui/core';
import { Select } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';

import Pagination from '@material-ui/lab/Pagination';
import { StylesProvider } from '@material-ui/core/styles';
import '../App.css';

import { useServer } from '../contexts/ServerContext';
import { useEnvironment } from '../contexts/EnvironmentContext';

import Logout from '../views/Logout';



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
        flexDirection: 'row',
        margin: theme.spacing(1),
        justifyContent: 'center'
    },
    pagination_item: {
        transitionDuration: '1.5s'
    },
    filter: {
        marginLeft: 30
    },
    add_button: {
        marginLeft: 30
    }
}));

function User() {
    const { restApiLocation } = useEnvironment();
    const auth = localStorage.getItem('zmt-token');
    if (auth === null) {
        return <Logout />
    }
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
            }).then((res) => {
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
            }).then((res) => {
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
        setCurrPage(value);
    }

    const handleSort = (props) => {
        const isAsc = orderBy === props && order === 'desc';
        setOrder(isAsc ? 'asc' : 'desc');
        setOrderBy(props);
    }

    useEffect(() => {
        loadUser(perPage * (currPage - 1), perPage, filterUsername, order, orderBy)

    }, [currPage, perPage, filterUsername, order, orderBy])



    return (
        <div className={classes.root}>
            <Appbar />
            <Sidebar menu_id="1" />
            <main className={classes.content}>
                <div className={classes.toolbar} />
                <div className={classes.main}>
                    <div className={classes.pagination}>
                        <Pagination className={classes.pagination_item} count={userContext !== undefined ? Math.ceil(userContext.total / perPage) : 0} onChange={handlePageChange} />
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
                            placeholder="Filter by UserName"
                            onChange={(event) => setFilterName(event.target.value)}
                        />
                        <Button className={classes.add_button} variant="outlined" color="primary" onClick={handleAddRowOpen}>
                            Add New User
                        </Button>
                    </div>
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
                                        <TableCell style={{ fontSize: '1.1rem', width: '20%' }} align="right"> {(this_user[0] === 'rods' || this_user[0] === 'public') ? <p></p> : <span><Link className={classes.link_button} to='/user/edit' state={{ userInfo: this_user }}><Button color="primary">Edit</Button></Link>
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
                </div>
            </main>
        </div>
    );
}

export default User;
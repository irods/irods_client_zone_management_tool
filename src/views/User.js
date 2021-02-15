import React, { useState, useEffect } from 'react';
import { Link } from '@reach/router';
import axios from 'axios';

import BlockIcon from '@material-ui/icons/Block';

import Appbar from '../components/Appbar';
import Sidebar from '../components/Sidebar';
import Cookies from 'js-cookie';
import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { FormControl, InputLabel, Typography } from '@material-ui/core';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Paper } from '@material-ui/core';
import { Select, MenuItem } from '@material-ui/core';

import Pagination from '@material-ui/lab/Pagination';
import { StylesProvider } from '@material-ui/core/styles';
import '../App.css';

import { useServer } from '../contexts/ServerContext';
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
    search: {
        marginLeft: 30
    },
    add_button: {
        marginLeft: 30
    }
}));

function User() {
    const classes = useStyles();
    const token = Cookies.get('token');
    const [users, setUsers] = useState([]);
    const [currUser, setCurrUser] = useState([]);
    const [addFormOpen, setAddFormOpen] = useState(false);
    const [addErrorMessage, setAddError] = useState();
    const [addName, setAddName] = useState();
    const [addUser_type, setAddUserType] = useState();
    const [addZone_name, setAddZoneName] = useState();
    const [removeConfirmation, setRemoveConfirmation] = useState(false);
    const [zone, setZone] = useState(localStorage.getItem('zoneName'));
    const [currPage, setCurrPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalPage, setTotalPage] = useState();
    const isAuthenticated = token != null ? true : false;

    const [searchUsername, setSearchName] = useState();

    const server = useServer();
    const environment = useEnvironment();

    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState(0);

    useEffect(() => {
        loadContent(currPage, perPage);
    }, [currPage, perPage, searchUsername])

    useEffect(() => {
        if (users.length !== 0) {
            const sortedArray = [...users];
            sortedArray.sort(getComparator(order, orderBy));
            setUsers(sortedArray);
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
        if (searchUsername == undefined) {
            _query = `SELECT USER_NAME, USER_TYPE WHERE USER_TYPE = 'rodsuser'`
        }
        else {
            _query = `SELECT USER_NAME, USER_TYPE WHERE USER_TYPE = 'rodsuser' and USER_NAME LIKE '%${searchUsername}%'`
        }
        const userResult = axios({
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
        }).then(res => {
            let sortedArray = res.data._embedded;
            sortedArray.sort();
            setUsers(sortedArray);
            setTotalPage(Math.ceil(res.data.total / perPage));
        }).catch(e => {
            console.log(e);
        });
    }

    const updateContent = () => {
        server.updateUser();
        console.log("Request updating server provider.");
        loadContent();
    }

    async function addUser() {
        console.log(addUser_type);
        console.log(addZone_name);
        console.log(addName);
        try {
            await axios({
                method: 'POST',
                url: `${environment.restApiLocation}/irods-rest/1.0.0/admin`,
                headers: {
                    'Authorization': Cookies.get('token')
                },
                params: {
                    action: 'add',
                    target: 'user',
                    arg2: addName,
                    arg3: addUser_type,
                    arg4: addZone_name,
                    arg5: '',
                }
            }).then(res => {
                console.log(res);
                setAddFormOpen(false);
                updateContent();
                window.location.reload();
            })
        } catch (e) {
            setAddError("Error when adding new user. Please check the input.")
        }
    }

    async function removeUser() {
        try {
            await axios({
                method: 'POST',
                url: `${environment.restApiLocation}/irods-rest/1.0.0/admin`,
                headers: {
                    'Authorization': Cookies.get('token')
                },
                params: {
                    action: 'rm',
                    target: 'user',
                    arg2: currUser[0],
                    arg3: server.zoneName[0]
                }
            }).then(res => {
                updateContent();
                window.location.reload();
            })
        } catch (e) {
            console.log(e)
        }
    }

    const handleAddUserType = event => {
        setAddUserType(event.target.value);
    }

    const handleAddUserName = event => {
        setAddName(event.target.value);
    }

    const handleAddZoneName = event => {
        setAddZoneName(event.target.value);
    }

    const handleRemoveConfirmationOpen = props => {
        setCurrUser(props);
        setRemoveConfirmation(true);
    }

    const handleRemoveConfirmationClose = () => {
        setRemoveConfirmation(false);
    }

    const handleAddFormOpen = () => {
        setAddFormOpen(true);
    }

    const handleAddFormClose = () => {
        setAddFormOpen(false);
    }

    const handlePageChange = (event, value) => {
        setCurrPage(value);
    }

    const handleSort = props => {
        const isAsc = orderBy === props && order == 'desc';
        setOrder(isAsc ? 'asc' : 'desc');
        setOrderBy(props);
    }


    return (
        <div>
            {isAuthenticated == true ? <div className={classes.root}>
                <Appbar />
                <Sidebar menu_id="1" />
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
                                placeholder="Search by username"
                                onChange={(event) => setSearchName(event.target.value)}
                            />
                            <Button className={classes.add_button} variant="outlined" color="primary" onClick={handleAddFormOpen}>
                                Add New User
                        </Button>
                        </div>
                        <TableContainer className={classes.tableContainer} component={Paper}>
                            <Table className={classes.table} aria-label="simple table">
                                <TableHead>
                                    <StylesProvider injectFirst>
                                        <TableRow>
                                            <TableCell style={{ fontSize: '1.1rem', width: '20%' }}><b>Username</b><TableSortLabel active={orderBy === 0} direction={orderBy === 0 ? order : 'asc'} onClick={() => { handleSort(0) }} /></TableCell>
                                            <TableCell style={{ fontSize: '1.1rem', width: '20%' }} align="right"><b>Type</b><TableSortLabel active={orderBy === 1} direction={orderBy === 1 ? order : 'asc'} onClick={() => { handleSort(1) }} /></TableCell>
                                            <TableCell style={{ fontSize: '1.1rem', width: '20%' }} align="right"><b>Action</b></TableCell>
                                        </TableRow>
                                    </StylesProvider>
                                </TableHead>
                                <TableBody>
                                    {users.map(this_user =>
                                        <TableRow key={this_user[0]}>
                                            <TableCell style={{ fontSize: '1.1rem', width: '20%' }} component="th" scope="row">{this_user[0]}</TableCell>
                                            <TableCell style={{ fontSize: '1.1rem', width: '20%' }} align="right">{this_user[1]}</TableCell>
                                            <TableCell style={{ fontSize: '1.1rem', width: '20%' }} align="right"> {(this_user[0] == 'rods' || this_user[0] == 'public') ? <p></p> : <span><Link className={classes.link_button} to='/user/edit' state={{ userInfo: this_user }}><Button color="primary">Edit</Button></Link>
                                                <Button color="secondary" onClick={() => { handleRemoveConfirmationOpen(this_user) }}>Remove</Button></span>}</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Dialog open={addFormOpen} onClose={handleAddFormClose} aria-labelledby="form-dialog-title">
                            <DialogTitle>Add New User</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    You can add a new user there.
                                </DialogContentText>
                                <form className={classes.container}>
                                    <FormControl className={classes.formControl}>
                                        <TextField
                                            native
                                            id="name"
                                            label="Username"
                                            onChange={handleAddUserName}
                                        />
                                    </FormControl>
                                    <FormControl className={classes.formControl}>
                                        <InputLabel htmlFor="user-type-select">Zone Name</InputLabel>
                                        <Select
                                            native
                                            id="zone"
                                            label="Zone Name"
                                            onChange={handleAddZoneName}
                                            defaultValue={zone}
                                        >
                                            <option value={zone} selected>{zone}</option>
                                        </Select>
                                    </FormControl>
                                    <FormControl className={classes.formControl}>
                                        <InputLabel htmlFor="user-type-select">User Type</InputLabel>
                                        <Select
                                            native
                                            id="user-type-select"
                                            value={addUser_type}
                                            onChange={handleAddUserType}
                                        >
                                            <option aria-label="None" value="" />
                                            <option value="rodsadmin">rodsadmin</option>
                                            <option value="groupadmin">groupadmin</option>
                                            <option value="rodsuser">rodsuser</option>
                                        </Select>
                                    </FormControl>
                                </form>
                                <p className={classes.errorMsg}>{addErrorMessage}</p>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={addUser} color="primary">Save</Button>
                                <Button onClick={handleAddFormClose} color="primary">Cancel</Button>
                            </DialogActions>
                        </Dialog>
                        <Dialog open={removeConfirmation} onClose={handleRemoveConfirmationClose} aria-labelledby="form-dialog-title">
                            <DialogTitle>Warning</DialogTitle>
                            <DialogContent>
                                <Typography>Are you sure to remove <b>{currUser[0]}</b>?</Typography>
                                <p className={classes.errorMsg}>{ }</p>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={removeUser} color="secondary">Remove</Button>
                                <Button onClick={handleRemoveConfirmationClose} color="primary">Cancel</Button>
                            </DialogActions>
                        </Dialog>
                    </div>
                </main>
            </div> : <div className={classes.logout}><BlockIcon /><br /><div>Please <a href="http://localhost:3000/">login</a> to use the administration dashboard.</div></div>}
        </div>
    );
}

export default User;
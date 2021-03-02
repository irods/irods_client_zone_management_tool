import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from '@reach/router'
import Appbar from '../components/Appbar';
import Sidebar from '../components/Sidebar';
import Logout from '../views/Logout';
import Cookies from 'js-cookie';
import { makeStyles } from '@material-ui/core';
import { Button, FormControl, TextField, Input, InputLabel, Select } from '@material-ui/core';
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

function Group() {
    const token = Cookies.get('token');
    if (token === undefined) {
        return <Logout />
    }
    const classes = useStyles();
    const server = useServer();
    const environment = useEnvironment();

    const [errorMsg, setErrorMsg] = useState();
    const [addFormOpen, setAddFormOpen] = useState(false);
    const [addGroupName, setAddGroupName] = useState();
    const [groups, setGroup] = useState([]);
    const [currGroup, setCurrGroup] = useState([]);


    const [searchGroupName, setSearchName] = useState();
    let group_id = 0;

    const [zone, setZone] = useState(localStorage.getItem('zoneName'));
    const [currPage, setCurrPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalPage, setTotalPage] = useState();

    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState(0);

    useEffect(() => {
        loadContent(currPage, perPage);
    }, [currPage, perPage, searchGroupName])

    useEffect(() => {
        if (groups.length !== 0) {
            const sortedArray = [...groups];
            sortedArray.sort(getComparator(order, orderBy));
            setGroup(sortedArray);
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

    // load group content information at each render time

    const loadContent = async (prop) => {
        let _query;
        if (searchGroupName == undefined) {
            _query = `SELECT USER_NAME, USER_TYPE WHERE USER_TYPE = 'rodsgroup'`
        }
        else {
            _query = `SELECT USER_NAME, USER_TYPE WHERE USER_TYPE = 'rodsgroup' and USER_NAME LIKE '%${searchGroupName}%'`
        }
        const groupListResult = await axios({
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
        });
        const groupList = groupListResult.data._embedded.sort();
        setTotalPage(groupListResult.data.total / perPage);

        // iterate group name array to retrieve each group user counts

        let inputArray = groupList;
        for (let i = 0; i < inputArray.length; i++) {
            let temName = inputArray[i][0];
            await axios({
                method: 'GET',
                url: `${environment.restApiLocation}/irods-rest/1.0.0/query`,
                headers: {
                    'Authorization': Cookies.get('token')
                },
                params: {
                    query_string: `SELECT USER_NAME, USER_TYPE, USER_ZONE WHERE USER_GROUP_NAME = '${temName}' AND USER_TYPE != 'rodsgroup'`,
                    query_limit: 100,
                    row_offset: 0,
                    query_type: 'general'
                }
            }).then((res) => {
                inputArray[i].push(res.data._embedded.length);
                if (i === inputArray.length - 1) {
                    setGroup(inputArray);
                }
            })
        }
    }

    const updateContent = () => {
        server.updateGroup();
        loadContent();
    }

    async function addGroup() {
        try {
            const addGroupResult = await axios({
                method: 'POST',
                url: `${environment.restApiLocation}/irods-rest/1.0.0/admin`,
                params: {
                    action: 'add',
                    target: 'user',
                    arg2: document.getElementById('add-group-name'),
                    arg3: 'rodsgroup',
                    arg4: zone,
                    arg5: ''
                },
                headers: {
                    'Authorization': token,
                    'Accept': 'application/json'
                }
            }).then(res => {
                localStorage.setItem("groupContext", groups.length + 1)
                window.location.reload();
            })
        }
        catch (e) {
            console.log(e);
            setAddFormOpen(true);
            setErrorMsg(`Cannot add new group. ${e.mssage}`)
        }
    }

    async function removeGroup() {
        try {
            const addGroupResult = await axios({
                method: 'POST',
                url: `${environment.restApiLocation}/irods-rest/1.0.0/admin`,
                params: {
                    action: 'rm',
                    target: 'user',
                    arg2: currGroup[0],
                    arg3: zone,
                },
                headers: {
                    'Authorization': token,
                    'Accept': 'application/json'
                }
            }).then(res => {
                localStorage.setItem("groupContext", groups.length - 1)
                window.location.reload();
            })
        } catch (e) {
            console.log(e);
        }
    }

    const handlecurrentGroup = event => {
        if (event.target.id !== '') {
            setCurrGroup(groups[event.target.id]);
            console.log(groups[event.target.id]);
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
        const isAsc = orderBy === props && order == 'desc';
        setOrder(isAsc ? 'asc' : 'desc');
        setOrderBy(props);
    }

    return (
        <div className={classes.root}>
            <Appbar />
            <Sidebar menu_id="2" />
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
                            placeholder="Search by GroupName"
                            onChange={(event) => setSearchName(event.target.value)}
                        />
                        <Button className={classes.add_button} variant="outlined" color="primary" onClick={handleAddRowOpen}>
                            Add New Group
                        </Button>
                    </div>
                    <TableContainer className={classes.tableContainer} component={Paper}>
                        <Table className={classes.table} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ fontSize: '1.1rem', width: '30%' }}><b>Group Name</b><TableSortLabel active={orderBy === 0} direction={orderBy === 0 ? order : 'asc'} onClick={() => { handleSort(0) }} /></TableCell>
                                    <TableCell style={{ fontSize: '1.1rem', width: '30%', textAlign: 'center' }} ><b>User Counts</b><TableSortLabel active={orderBy === 2} direction={orderBy === 2 ? order : 'asc'} onClick={() => { handleSort(2) }} /></TableCell>
                                    <TableCell style={{ fontSize: '1.1rem', width: '30%' }} align="right"><b>Action</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow id="add-group-row" style={{ display: 'none' }}>
                                    <TableCell><Input placeholder="Enter new groupname"id="add-group-name" /></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell align="right"><ToggleButtonGroup size="small"><ToggleButton onClick={addGroup}><SaveIcon /></ToggleButton><ToggleButton onClick={handleAddRowClose}><CloseIcon /></ToggleButton></ToggleButtonGroup></TableCell>
                                </TableRow>
                                {groups.map((group) =>
                                    <TableRow key={group_id}>
                                        <TableCell style={{ fontSize: '1.1rem', width: '30%' }} component="th" scope="row">{group[0]}</TableCell>
                                        <TableCell style={{ fontSize: '1.1rem', width: '30%', textAlign: 'center' }} component="th" scope="row">{group[2]}</TableCell>
                                        <TableCell style={{ fontSize: '1.1rem', width: '30%' }} align='right'><Link className={classes.link_button} to='/group/edit' state={{ groupInfo: group }}><Button color="primary">Edit</Button></Link> {group[0] == 'public' ? <span id={group_id++}></span> : <Button id={group_id++} color="secondary" onMouseOver={handlecurrentGroup} onClick={removeGroup}>Remove</Button>}</TableCell>
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
                            <p className={classes.errorMsg}>{errorMsg}</p>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleAddFormClose} color="primary">Close</Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </main>
        </div>
    );
}

export default Group;
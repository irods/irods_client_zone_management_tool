import React, { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from '@reach/router'
import { useEnvironment, useServer } from '../contexts';
import { Logout } from './';
import { makeStyles, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Input, Typography } from '@material-ui/core';
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, Paper } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';
import { Skeleton, ToggleButton, ToggleButtonGroup } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
    link_button: {
        textDecoration: 'none'
    },
    tableContainer: {
        marginTop: 20,
    },
    errorMsg: {
        color: 'red'
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
        width: 200
    },
    add_button: {
        marginLeft: 30
    }
}));

export const Group = () => {
    const { restApiLocation } = useEnvironment();
    const auth = localStorage.getItem('zmt-token');
    const classes = useStyles();
    const { zoneName, groupContext, loadGroup } = useServer();

    const [addErrorMsg, setAddErrorMsg] = useState();
    const [removeErrorMsg, setRemoveErrorMsg] = useState();
    const [addFormOpen, setAddFormOpen] = useState(false);
    const [removeFormOpen, setRemoveFormOpen] = useState(false);
    const [currGroup, setCurrGroup] = useState([]);
    const [filterGroupName, setFilterName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [groupContextWithUserCount, setGroupContextWithUserCount] = useState(new Map());
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

    useEffect(() => {
        const loadGroupUserCounts = async () => {
            setIsLoading(true);
            let inputArray = groupContext;
            let userCountMap = new Map();
            for (let i = 0; i < inputArray._embedded.length; i++) {
                let thisGroupName = inputArray._embedded[i][0];
                await axios({
                    method: 'GET',
                    url: `${restApiLocation}/query`,
                    headers: {
                        'Authorization': localStorage.getItem('zmt-token')
                    },
                    params: {
                        query_string: `SELECT USER_NAME, USER_TYPE, USER_ZONE WHERE USER_GROUP_NAME = '${thisGroupName}' AND USER_TYPE != 'rodsgroup'`,
                        query_limit: 100,
                        row_offset: 0,
                        query_type: 'general'
                    }
                }).then((res) => {
                    inputArray._embedded[i].push(res.data._embedded.length);
                    userCountMap.set(thisGroupName, res.data._embedded.length);
                    if (i === inputArray._embedded.length - 1) {
                        setGroupContextWithUserCount(userCountMap);
                    }
                })
            }
            setIsLoading(false)
        }
        loadGroupUserCounts();
    }, [groupContext])

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
            }).then(() => {
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
            }).then(() => {
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
        setCurrPage(value + 1);
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
                    placeholder="Filter by GroupName"
                    onChange={(event) => setFilterName(event.target.value)}
                />
                <Button className={classes.add_button} variant="outlined" color="primary" onClick={handleAddRowOpen}>
                    Add New Group
                </Button>
            </div>
            <TablePagination component="div" className={classes.pagination} page={currPage - 1} count={parseInt(groupContext.total)} rowsPerPage={perPage} onChangePage={handlePageChange} onChangeRowsPerPage={(e) => { setPerPage(e.target.value); setCurrPage(1) }} />
            <TableContainer className={classes.tableContainer} component={Paper}>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell style={{ fontSize: '1.1rem', width: '30%' }}><b>Group Name</b><TableSortLabel active={orderBy === "USER_NAME"} direction={orderBy === "USER_NAME" ? order : 'asc'} onClick={() => { handleSort("USER_NAME") }} /></TableCell>
                            <TableCell style={{ fontSize: '1.1rem', width: '30%' }} ><b>Users</b></TableCell>
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
                                <TableCell style={{ fontSize: '1.1rem', width: '30%' }} component="th" scope="row">{isLoading ? <Skeleton width="80%" /> : group[0]}</TableCell>
                                <TableCell style={{ fontSize: '1.1rem', width: '30%' }} component="th" scope="row">{isLoading ? <Skeleton variant="text" width="50%" /> : groupContextWithUserCount.get(group[0])}</TableCell>
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
        </Fragment>
    );
}
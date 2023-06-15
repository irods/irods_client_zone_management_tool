/*eslint no-unused-vars: "error"*/

import React, { Fragment, useEffect } from 'react';
import { navigate } from '@reach/router';
// import axios from 'axios';
import { useServer } from '../contexts';
// import { makeStyles, StylesProvider, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, LinearProgress, TextField, Typography, Input, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TableSortLabel, Select, Paper } from '@material-ui/core';
import { makeStyles, LinearProgress, TableContainer, Paper, Table, TableHead, StylesProvider, TableRow, TableCell, TableBody } from '@material-ui/core';
// import SaveIcon from '@material-ui/icons/Save';
// import CloseIcon from '@material-ui/icons/Close';
// import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
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
        marginLeft: 30,
        width: 300
    },
    add_user_name: {
        width: 200
    },
    add_button: {
        marginLeft: 30
    },
    fontInherit: {
        font: 'inherit'
    },
    table_cell: {
        wordWrap: 'break-word'
    }
}));


export const Ticket = () => {
    if (!localStorage.getItem('zmt-token')) navigate('/');
    // const location = useLocation()
    // const params = new URLSearchParams(location.search)
    // const { restApiLocation } = useEnvironment();
    // const auth = localStorage.getItem('zmt-token');
    // const userTypes = ["rodsuser", "rodsadmin", "groupadmin"];
    // const [currPage, setCurrPage] = useState(1);
    // const [perPage, setPerPage] = useState(10);
    // const [filterUsername, setFilterName] = useState(params.get('filter') ? decodeURIComponent(params.get('filter')) : '');
    const { isLoadingUserContext, loadTickets, ticketContext } = useServer();
    const classes = useStyles();
    // const [filterTicket, setFilterTicket] = useState(params.get('filter') ? decodeURIComponent(params.get('filter')) : '');
    // const [order, setOrder] = useState("asc");
    // const [orderBy, setOrderBy] = useState("USER_NAME");

  
    const perPage = 10;
    const currPage = 1;
    const order = "asc";
    const orderBy = "USER_NAME";
    useEffect(() => {
      

        loadTickets(perPage * (currPage - 1), perPage, order, orderBy)
        console.log("ticketContext: ", ticketContext)
        
    }, [currPage, perPage, order, orderBy])
    console.log("ticketContext: ", ticketContext)
    return (
      <Fragment>
        {isLoadingUserContext ? <LinearProgress /> : <div className="table_view_spinner_holder" />}

        {ticketContext === undefined ? <div>Cannot load ticket data. Please check your iRODS Client REST API endpoint connection.</div> :
            <Fragment>
                Total Entries: {ticketContext.total}
            </Fragment>
        }

        {/* <TextField
            className={classes.filter}
            id="filter-term"
            label="Filter"
            placeholder="Filter by User Name"
            onChange={handleFilterChange}
        /> */}

        <TableContainer className={classes.tableContainer} component={Paper}>
            <Table style={{ width: '100%', tableLayout: 'fixed' }} aria-label="User table">
                <TableHead>
                    <StylesProvider injectFirst>
                        <TableRow>
                            <TableCell className={classes.table_cell} style={{ width: '40%' }}>Created By</TableCell>
                            <TableCell className={classes.table_cell} style={{ width: '40%' }}>Type</TableCell>
                            <TableCell className={classes.table_cell} style={{ width: '20%' }}>Ticket String</TableCell>
                            <TableCell className={classes.table_cell} style={{ width: '20%' }}>Create Time</TableCell>
                            <TableCell className={classes.table_cell} style={{ width: '20%' }}>Modify Time</TableCell>
                            <TableCell className={classes.table_cell} style={{ width: '20%' }}>Expire Time</TableCell>
                        </TableRow>
                    </StylesProvider>
                </TableHead>
                <TableBody>
                    {
                        ticketContext._embedded.map((ticket, index) => {

                            return (
                                <TableRow key={index}>
                                    <TableCell className={classes.table_cell} style={{ width: '40%' }}>{ticket[0]}</TableCell>
                                    <TableCell className={classes.table_cell} style={{ width: '40%' }}>{ticket[1]}</TableCell>
                                    <TableCell className={classes.table_cell} style={{ width: '20%' }}>{ticket[2]}</TableCell>
                                    <TableCell className={classes.table_cell} style={{ width: '20%' }}>{new Date(parseInt(ticket[4])).toLocaleDateString()}</TableCell>
                                    <TableCell className={classes.table_cell} style={{ width: '20%' }}>{new Date(parseInt(ticket[5])).toLocaleDateString()}</TableCell>
                                    <TableCell className={classes.table_cell} style={{ width: '20%' }}>{ticket[6] ? new Date(parseInt(ticket[6])).toLocaleDateString(): ""}</TableCell>
                                </TableRow>
                            )
                        })
                    }

                </TableBody>
            </Table>

        </TableContainer>



      </Fragment>
    );
}
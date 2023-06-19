/*eslint no-unused-vars: "error"*/

import React, { useState, Fragment, useEffect } from 'react';
import { navigate, useLocation } from '@reach/router';
// import axios from 'axios';
import { useServer } from '../contexts';
// import { makeStyles, StylesProvider, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, LinearProgress, TextField, Typography, Input, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TableSortLabel, Select, Paper } from '@material-ui/core';
import { makeStyles, LinearProgress, TableContainer, Paper, Table, TableHead, StylesProvider, TableRow, TableCell, TableBody, TextField, TablePagination, TableSortLabel } from '@material-ui/core';
// import SaveIcon from '@material-ui/icons/Save';
// import CloseIcon from '@material-ui/icons/Close';
// import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import TicketRows from '../components/TicketRows';

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
    },
    header_row: {
        fontWeight: 'bold'
    }
}));


export const Ticket = () => {
    if (!localStorage.getItem('zmt-token')) navigate('/');
    const location = useLocation()
    const params = new URLSearchParams(location.search)
    // const { restApiLocation } = useEnvironment();
    // const auth = localStorage.getItem('zmt-token');
    // const userTypes = ["rodsuser", "rodsadmin", "groupadmin"];
    const [currPage, setCurrPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const { isLoadingTicketContext, loadTickets, ticketContext } = useServer();
    const classes = useStyles();
    const [filterTicket, setFilterTicket] = useState(params.get('filter') ? decodeURIComponent(params.get('filter')) : '');
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("TICKET_OWNER_NAME");
    const [ticketsData, setTicketsData] = useState([]); // array of ticket information

    // SELECT TICKET_OWNER_NAME, TICKET_TYPE, TICKET_STRING, TICKET_OBJECT_TYPE, TICKET_CREATE_TIME, TICKET_MODIFY_TIME, TICKET_EXPIRY
  

    useEffect(() => {
        loadTickets(perPage * (currPage - 1), perPage, order, orderBy)
        console.log('loading tickets')
    }, [currPage, perPage, order, orderBy])

    useEffect(() => {
        if (ticketContext !== undefined) {
            console.log("ticketContext", ticketContext);
            setTicketsData(ticketContext._embedded)
        }

    }, [ticketContext])


    const handleSort = (props) => {
        const isAsc = orderBy === props && order === 'desc';
        setOrder(isAsc ? 'asc' : 'desc');
        setOrderBy(props);
    }

    const handleFilterChange = (e) => {
        setFilterTicket(e.target.value)
        // update the path without reload, filter is also encoded 
        if (e.target.value === '') window.history.replaceState('', '', '/tickets')
        else window.history.replaceState('', '', `/tickets?filter=${encodeURIComponent(e.target.value)}`)
    }

    const handlePageChange = (event, value) => {
        setCurrPage(value + 1);
    }

    let filteredTickets = ticketsData.filter((ticket) => {
        if (filterTicket === '') return true;

        return ticket[17].includes(filterTicket) || 
        ticket[2].includes(filterTicket) ||
        ticket[0].includes(filterTicket)

    })
    
    return (
      <Fragment>

        <div className={classes.filterGroup}>
            <TextField
                className={classes.filter}
                id="filter-term"
                label="Filter"
                placeholder="Filter by owner, type, or ID"
                onChange={handleFilterChange}
                value={filterTicket}
            />
        </div>

        {isLoadingTicketContext ? <LinearProgress /> : <div className="table_view_spinner_holder" />}

        {ticketContext === undefined ?? <div>Cannot load ticket data. Please check your iRODS Client REST API endpoint connection.</div>
        }

  
        <TablePagination component="div" className={classes.pagination} page={currPage - 1} count={parseInt(ticketContext.total)} rowsPerPage={perPage} onChangePage={handlePageChange} onChangeRowsPerPage={(e) => { setPerPage(e.target.value); setCurrPage(1) }} />


        <TableContainer className={classes.tableContainer} component={Paper}>
            <Table style={{ width: '100%', tableLayout: 'fixed' }} aria-label="User table">
                <TableHead>
                    <StylesProvider injectFirst>
                        <TableRow>
                            <TableCell className={classes.table_cell, classes.header_row} style={{ width: '20%' }}>
                                <TableSortLabel
                                    active={orderBy === "TICKET_OWNER_NAME"}
                                    direction={orderBy === "TICKET_OWNER_NAME" ? order : "asc"}
                                    onClick={() => {
                                        handleSort("TICKET_OWNER_NAME");
                                    }}
                                >Owner
                                </TableSortLabel>
                            </TableCell>

                            <TableCell className={classes.table_cell, classes.header_row} style={{ width: '20%' }}>
                                <TableSortLabel
                                    active={orderBy === "TICKET_TYPE"}
                                    direction={orderBy === "TICKET_TYPE" ? order : "asc"}
                                    onClick={() => {
                                        handleSort("TICKET_TYPE");
                                    }}
                                >Type
                                </TableSortLabel>
                            </TableCell>

                            <TableCell className={classes.table_cell, classes.header_row} style={{ width: '20%' }}>
                                <TableSortLabel
                                    active={orderBy === "TICKET_STRING"}
                                    direction={orderBy === "TICKET_STRING" ? order : "asc"}
                                    onClick={() => {
                                        handleSort("TICKET_STRING");
                                    }}
                                >
                                Ticket ID
                                </TableSortLabel>
                            </TableCell>

                            <TableCell className={classes.table_cell, classes.header_row} style={{ width: '20%' }}>
                                <TableSortLabel
                                    active={orderBy === "TICKET_CREATE_TIME"}
                                    direction={orderBy === "TICKET_CREATE_TIME" ? order : "asc"}
                                    onClick={() => {
                                        handleSort("TICKET_CREATE_TIME");
                                    }}
                                >
                                Create Time
                                </TableSortLabel>
                            </TableCell>


                            <TableCell className={classes.table_cell, classes.header_row} style={{ width: '20%' }}>
                                <TableSortLabel
                                    active={orderBy === "TICKET_MODIFY_TIME"}
                                    direction={orderBy === "TICKET_MODIFY_TIME" ? order : "asc"}
                                    onClick={() => {
                                        handleSort("TICKET_MODIFY_TIME");
                                    }}
                                >
                                Modify Time
                                </TableSortLabel>
                            </TableCell>


                            <TableCell className={classes.table_cell, classes.header_row} style={{ width: '20%' }}>
                                <TableSortLabel
                                    active={orderBy === "TICKET_EXPIRY"}
                                    direction={orderBy === "TICKET_EXPIRY" ? order : "asc"}
                                    onClick={() => {
                                        handleSort("TICKET_EXPIRY");
                                    }}
                                >
                                Expire Time
                                </TableSortLabel>
                            </TableCell>

                            <TableCell
                      style={{ width: "5%" }}
                      align="right"
                    ></TableCell>
                        </TableRow>
                    </StylesProvider>
                </TableHead>
                <TableBody>
                    
                    {
                       filteredTickets.map((ticket, index) => {
                          
                            return (
                                <TicketRows key={ticket[0]} row={ticket} />
                            )
                        })
                    }

                </TableBody>
            </Table>

        </TableContainer>



      </Fragment>
    );
}
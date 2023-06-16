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

    const { isLoadingUserContext, loadTickets, ticketContext } = useServer();
    const classes = useStyles();
    const [filterTicket, setFilterTicket] = useState(params.get('filter') ? decodeURIComponent(params.get('filter')) : '');
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("TICKET_OWNER_NAME");
    const [ticketsData, setTicketsData] = useState([]); // array of ticket information

    // SELECT TICKET_OWNER_NAME, TICKET_TYPE, TICKET_STRING, TICKET_OBJECT_TYPE, TICKET_CREATE_TIME, TICKET_MODIFY_TIME, TICKET_EXPIRY
  

    useEffect(() => {
        loadTickets(perPage * (currPage - 1), perPage, order, orderBy)
        
    }, [currPage, perPage, order, orderBy])

    useEffect(() => {
        if (ticketContext !== undefined) {
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
        return ticket[0].includes(filterTicket) || 
                ticket[1].includes(filterTicket) ||
                ticket[2].includes(filterTicket) ||
                ticket[3].includes(filterTicket) ||
                ticket[4].includes(filterTicket) ||
                ticket[5].includes(filterTicket) ||
                ticket[6].includes(filterTicket)

    })
    console.log("ticketContext: ", ticketContext)
    return (
      <Fragment>

        <div className={classes.filterGroup}>
            <TextField
                className={classes.filter}
                id="filter-term"
                label="Filter"
                placeholder="Filter by User Name"
                onChange={handleFilterChange}
                value={filterTicket}
            />
        </div>

        {isLoadingUserContext ? <LinearProgress /> : <div className="table_view_spinner_holder" />}

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
                                >Created By
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
                        </TableRow>
                    </StylesProvider>
                </TableHead>
                <TableBody>
                    
                    {
                        filteredTickets.map((ticket, index) => {
                            let d1 = new Date(parseInt(ticket[4] * 1000, 10))
                            let d2 = new Date(parseInt(ticket[5] * 1000, 10))
                            let show1 = d1.toLocaleDateString() + ",  " + d1.toLocaleTimeString()
                            let show2 = d2.toLocaleDateString() + ", " + d2.toLocaleTimeString()
                            
                            if (ticket[4] == ticket[5]) {
                                show2 = "N/A"
                            }   

                            let temp = new Date(parseInt(ticket[6] * 1000, 10)) 
                            let d3 = ticket[6] ? temp.toLocaleDateString() + ", " + temp.toLocaleTimeString() : "N/A"
                            return (
                                <TableRow key={index}>
                                    <TableCell className={classes.table_cell} style={{ width: '40%' }}>{ticket[0]}</TableCell>
                                    <TableCell className={classes.table_cell} style={{ width: '40%' }}>{ticket[1]}</TableCell>
                                    <TableCell className={classes.table_cell} style={{ width: '20%' }}>{ticket[2]}</TableCell>
                                    <TableCell className={classes.table_cell} style={{ width: '20%' }}>{show1}</TableCell>
                                    <TableCell className={classes.table_cell} style={{ width: '20%' }}>{show2}</TableCell>
                                    <TableCell className={classes.table_cell} style={{ width: '20%' }}>{d3}</TableCell>
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
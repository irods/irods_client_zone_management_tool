/*eslint no-unused-vars: "error"*/

import React, { useState, Fragment, useEffect } from 'react';
import { navigate, useLocation } from '@reach/router';
import axios from 'axios';
import { useServer, useEnvironment } from '../contexts';
import { makeStyles, LinearProgress, TableContainer, Paper, Table, TableHead, StylesProvider, TableRow, TableCell, TableBody, TextField, TablePagination, TableSortLabel, InputLabel } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
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
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 240,
      },
    
}));


export const Ticket = () => {
    if (!localStorage.getItem('zmt-token')) navigate('/');
    const location = useLocation()
    const params = new URLSearchParams(location.search)
    const { restApiLocation } = useEnvironment();
    console.log("restApiLocation", restApiLocation)
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
    const [createOpen, setCreateOpen] = useState(false);

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

    const handleClickOpen = () => {
        setCreateOpen(true);
      };
    
      const handleClose = () => {
        setCreateOpen(false);
      };
    
    const handleCreateTicket = async () => {
        let dataObj = {
            logical_path: document.getElementById('logical-path').value,
            type: document.getElementById('ticket-type').value,
            use_count: document.getElementById('use-count').value,
            write_file_count: document.getElementById('write-file-count').value,
            write_byte_count: document.getElementById('write-byte-count').value,
            seconds_until_expiration: document.getElementById('seconds-until-expiration').value,
            users: document.getElementById('users').value,
            groups: document.getElementById('groups').value,
            hosts: document.getElementById('hosts').value
        }


        const response = await axios({
            method: 'GET',
            url: `${restApiLocation}/ticket`,
            params: {
                logical_path: dataObj.logical_path,
                type: dataObj.type,
                use_count: dataObj.use_count,
                write_file_count: dataObj.write_file_count,
                write_byte_count: dataObj.write_byte_count,

                seconds_until_expiration: dataObj.seconds_until_expiration,
                users: dataObj.users,
                groups: dataObj.groups,
                hosts: dataObj.hosts
            },
            headers: {
                'Authorization': localStorage.getItem('zmt-token')
            },
        }).catch(e => {})

        const exampleResponse = {
            "headers": {
              "irods-ticket": ["CS11B8C4KZX2BIl"]
            },
            "url": "/irods-rest/0.9.3/stream?logical-path=%2FtempZone%2Fhome%2Frods%2Ffile0&offset=0&count=33064"
        }

        if (exampleResponse && exampleResponse.url) {
            window.location.reload();
        }

        console.log(response);

    }
    
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

        <Button variant="outlined" color="primary" onClick={handleClickOpen}>
            New Ticket
        </Button>

        {/* 
            logical-path: The url encoded logical path to a collection or data object for which access is desired
            type: The type of ticket to create. The value must be either read or write. Defaults to read
            use-count: The maximum number of times the ticket can be used. Defaults to 0 (unlimited use)
            write-file-count: The maximum number of writes allowed to a data object. Defaults to 0 (unlimited writes)
            write-byte-count: The maximum number of bytes allowed to be written to data object. Defaults to 0 (unlimited bytes)
            seconds-until-expiration: The number of seconds before the ticket will expire. Defaults to 0 (no expiration)
            users: A comma-separated list of iRODS users who are allowed to use the generated ticket
            groups: A comma-separated list of iRODS groups that are allowed to use the generated ticket
            hosts: A comma-separated list of hosts that are allowed to use the ticket
        
        */}
        <Dialog open={createOpen} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">New Ticket</DialogTitle>
        <DialogContent>
            <DialogContentText>
            Create a new ticket
            </DialogContentText>
            
            <FormControl className={classes.formControl}>
            <TextField
                id="logical-path"
                label="Logical Path"
                type="text"
                fullWidth
            />
            </FormControl>
            
            <FormControl className={classes.formControl}>
            <InputLabel htmlFor="age-native-simple">Ticket Type</InputLabel>
            <Select
                native
                id="ticket-type"
            >
                <option value='read'>Read</option>
                <option value='write'>Write</option>
            </Select>
            </FormControl>

            <FormControl className={classes.formControl}>
            <TextField
                id="use-count"
                label="Use Count"
                type="number"
                fullWidth
            />
            </FormControl>

            <FormControl className={classes.formControl}>
            <TextField
                id="write-file-count"
                label="Write File Count"
                type="number"
                fullWidth
            />
            </FormControl>

            <FormControl className={classes.formControl}>
            <TextField
                id="write-byte-count"
                label="Write Byte Count"
                type="number"
                fullWidth
            />
            </FormControl>

            <FormControl className={classes.formControl}>
            <TextField
                id="seconds-until-expiration"
                label="Seconds Until Expiration"
                type="number"
                fullWidth
            />
            </FormControl>

            <FormControl className={classes.formControl}>
            <TextField
                id="users"
                label="Users"
                type="text"
                fullWidth
            />
            </FormControl>

            <FormControl className={classes.formControl}>
            <TextField

                id="groups"
                label="Groups"
                type="text"
                fullWidth
            />
            </FormControl>


            <FormControl className={classes.formControl}>
            <TextField

                id="hosts"
                label="Hosts"
                type="text"
                fullWidth
            />
            </FormControl>  

        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose} color="primary">
            Cancel
            </Button>
            <Button onClick={handleCreateTicket} color="primary" >
            Create Ticket
            </Button>
        </DialogActions>
        </Dialog>


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
                       filteredTickets.map((ticket) => {
                          
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
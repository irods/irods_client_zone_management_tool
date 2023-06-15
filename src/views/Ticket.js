import React, { Fragment, useEffect } from 'react';
import { navigate } from '@reach/router';
// import axios from 'axios';
import { useServer } from '../contexts';
// import { makeStyles, StylesProvider, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, LinearProgress, TextField, Typography, Input, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TableSortLabel, Select, Paper } from '@material-ui/core';
// import SaveIcon from '@material-ui/icons/Save';
// import CloseIcon from '@material-ui/icons/Close';
// import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';



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
    const { loadTickets, ticketContext } = useServer();
    // const [order, setOrder] = useState("asc");
    // const [orderBy, setOrderBy] = useState("USER_NAME");

  
    const perPage = 10;
    const currPage = 1;
    const order = "asc";
    const orderBy = "USER_NAME";
    useEffect(() => {
        // loadUsers(perPage * (currPage - 1), perPage, filterUsername, order, orderBy)
      

        loadTickets(perPage * (currPage - 1), perPage, order, orderBy)
        console.log("ticketContext: ", ticketContext)
        
    }, [currPage, perPage, order, orderBy])
    console.log("ticketContext: ", ticketContext)
    return (
      <Fragment>
        {/* {ticketContext ? (
            {ticketContext._embedded.map((ticket, index) => {
                return (
                    <div key={index}>
                        <h1>{ticket[0]}</h1>
                    </div>
                )
            })}
        ) : (
            <div>
                <h1>no tickets</h1>
            </div>
        )
        } */}

        {ticketContext === undefined ? <div>Cannot load ticket data. Please check your iRODS Client REST API endpoint connection.</div> :
            <Fragment>
                {ticketContext._embedded.map((ticket, index) => {
                    return (
                        <div key={index}>
                            <h1>{ticket[0]}</h1>
                        </div>
                    )

                }
                )}
                
                </Fragment>
        }


      </Fragment>
    );
}
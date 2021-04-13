import React, { useState } from 'react';
import Logout from './Logout';
import Appbar from '../components/Appbar';
import Sidebar from '../components/Sidebar';
import { useServer } from '../contexts/ServerContext';
import { makeStyles } from '@material-ui/core';
import { Button, FormControl, InputLabel, Select } from '@material-ui/core';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Paper } from '@material-ui/core';
import Pagination from '@material-ui/lab/Pagination';


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
    pagination: {
        display: 'flex',
        flexDirection: 'row',
        margin: theme.spacing(1),
        justifyContent: 'center'
    },
    pagination_item: {
        transitionDuration: '1.5s'
    },
    itemsControl: {
        marginLeft: 30,
        minWidth: 120
    }
}))

function Server() {
    const auth = localStorage.getItem('zmt-token');
    if (auth === null) {
        return <Logout />
    }
    const classes = useStyles();
    const { zoneContext } = useServer();
    const [currPage, setCurrPage] = useState();
    const [perPage, setPerPage] = useState(10);

    return (
        <div className={classes.root}>
            <Appbar />
            <Sidebar menu_id="2" />
            <main className={classes.content}>
                <div className={classes.toolbar} />
                {zoneContext === undefined ? <div /> :
                    <div className={classes.main}>
                        <div className={classes.pagination}>
                            <Pagination className={classes.pagination_item} count={Math.ceil(zoneContext.length / perPage)} onChange={(e) => setCurrPage(e.target.value)} />
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
                        </div>
                        <TableContainer className={classes.tableContainer} component={Paper}>
                            <Table className={classes.table} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ fontSize: '1.1rem', width: '30%' }}><b>Hostname</b></TableCell>
                                        <TableCell style={{ fontSize: '1.1rem', width: '30%' }} align="right"><b>OS Distribution</b></TableCell>
                                        <TableCell style={{ fontSize: '1.1rem', width: '30%' }} align="right"></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {zoneContext.map((server) =>
                                        <TableRow>
                                            <TableCell style={{ fontSize: '1.1rem', width: '30%' }}>{server['icat_server']['host_system_information']['hostname']}</TableCell>
                                            <TableCell style={{ fontSize: '1.1rem', width: '30%' }} align='right'>{server['icat_server']['host_system_information']['os_distribution_name'] +" "+server['icat_server']['host_system_information']['os_distribution_version']}</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                }
            </main>
        </div>
    )
}

export default Server;
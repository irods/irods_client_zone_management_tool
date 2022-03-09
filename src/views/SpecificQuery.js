import React, { Fragment, useEffect, useState } from 'react';
import { navigate } from '@reach/router';
import { useEnvironment, useServer } from '../contexts';
import { makeStyles, Button, LinearProgress, Table, TableContainer, Paper, TableHead, TableRow, TableCell, TableSortLabel, TableBody, TextareaAutosize, TextField, Snackbar, IconButton, Input, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';
import SaveIcon from '@material-ui/icons/Save';
import MuiAlert from '@material-ui/lab/Alert';
import { format } from 'sql-formatter';
import { AddSpecificQueryController, DeleteSpecificQueryController } from '../controllers/SpecificQueryController';

const useStyles = makeStyles((theme) => ({
    fontInherit: {
        font: 'inherit'
    },
    table_cell: {
        wordWrap: 'break-word'
    },
    filterGroup: {
        display: 'flex',
        flexDirection: 'row',
        margin: theme.spacing(1),
        justifyContent: 'center'
    },
    add_button: {
        marginLeft: 30
    },
    filter: {
        marginLeft: 30,
        width: 300
    }
}))

export const SpecificQuery = () => {
    if (!localStorage.getItem('zmt-token')) navigate('/');
    const classes = useStyles()
    const [status, setStatus] = useState('none')
    const [newAlias, setNewAlias] = useState()
    const [newSqlStr, setNewSqlStr] = useState()
    const [aliasToDelete, setAliasToDelete] = useState()
    const [filterInput, setFilterInput] = useState('')
    const [confirmationVisibility, setConfirmationVisibility] = useState(false)
    const [order, setOrder] = useState('asc')
    const [orderBy, setOrderBy] = useState('alias')
    const [sortedSpecificQueryContext, setSortedSpecificQueryContext] = useState()
    const { restApiLocation } = useEnvironment()
    const { specificQueryContext, isLoadingSpecificQueryContext, loadSpecificQueries } = useServer()

    const addButtonEventHandler = () => {
        setStatus('Adding')
        setNewAlias()
        setNewSqlStr()
    }

    const addSpecificQueryHandler = async () => {
        setConfirmationVisibility(false)
        await AddSpecificQueryController(newAlias, newSqlStr, restApiLocation)
            .then(res => {
                if (res.status === 200) {
                    loadSpecificQueries('')
                    setNewSqlStr()
                    setStatus('add-success')
                } else setStatus('add-failed')
            })
            .catch(() => {
                setStatus('add-failed')
            })
    }

    const deleteButtonEventHandler = (alias) => {
        setAliasToDelete(alias)
        setStatus('Deleting')
        setConfirmationVisibility(true)
    }

    const deleteSpecificQueryHandler = async () => {
        setConfirmationVisibility(false)
        await DeleteSpecificQueryController(aliasToDelete, restApiLocation)
            .then(res => {
                if (res.status === 200) {
                    loadSpecificQueries('')
                    setStatus('delete-success')
                } else setStatus('delete-failed')
            }
            ).catch(() => {
                setStatus('delete-failed')
            })
    }

    const handleSort = (newOrderBy) => {
        const isAsc = orderBy === newOrderBy && order === 'desc';
        setOrder(isAsc ? 'asc' : 'desc');
        setOrderBy(newOrderBy)
    }

    const keyEventHandler = (event) => {
        // check if enter is pressed
        if (event.keyCode === 13 && status === 'Adding') {
            setConfirmationVisibility(true)
        }
    }

    useEffect(() => {
        if (specificQueryContext?._embedded) {
            // sort by column 
            let newSortedSpecificQueryContext = [...specificQueryContext._embedded].sort((a, b) => {
                return (order === 'asc' ? 1 : -1) * (orderBy === 'alias' ? a[0].localeCompare(b[0]) : a[1].localeCompare(b[1]))
            })
            // filter by input
            setSortedSpecificQueryContext(newSortedSpecificQueryContext.filter(query => query[0].toLowerCase().includes(filterInput.toLowerCase()) || query[1].toLowerCase().includes(filterInput.toLowerCase())))
        }
    }, [filterInput, specificQueryContext, order, orderBy])

    return (
        <Fragment>
            {specificQueryContext === undefined || isLoadingSpecificQueryContext ? <LinearProgress /> : <div className="table_view_spinner_holder" />}
            <div className={classes.filterGroup}>
                <TextField className={classes.filter}
                    label="Filter"
                    onChange={(e) => setFilterInput(e.target.value)} />
                <Button className={classes.add_button} color="primary" variant="outlined" onClick={addButtonEventHandler}>Add new Specific Query</Button>
            </div>
            <br />
            <br />
            <TableContainer component={Paper}>
                <Table style={{ width: '100%'}}>
                    <TableHead>
                        <TableRow>
                            <TableCell><TableSortLabel active={orderBy === 'alias'} direction={orderBy === 'alias' ? order : 'asc'} onClick={() => handleSort('alias')}><b>Alias</b></TableSortLabel></TableCell>
                            <TableCell><TableSortLabel active={orderBy === 'sqlStr'} direction={orderBy === 'sqlStr' ? order : 'asc'} onClick={() => handleSort('sqlStr')}><b>SQL String</b></TableSortLabel></TableCell>
                            <TableCell style={{ width: '80px' }} align="center"><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {status === 'Adding' &&
                            <TableRow>
                                <TableCell><Input className={classes.fontInherit} onKeyDown={(e) => keyEventHandler(e)} onChange={(e) => setNewAlias(e.target.value)} /></TableCell>
                                <TableCell><Input fullWidth className={classes.fontInherit} onKeyDown={(e) => keyEventHandler(e)} onChange={(e) => setNewSqlStr(e.target.value)} /></TableCell>
                                <TableCell align="center"><IconButton size="small" disabled={!newAlias || !newSqlStr} onClick={() => setConfirmationVisibility(true)}><SaveIcon /></IconButton><IconButton size="small" onClick={() => setStatus('none')}><CloseIcon /></IconButton></TableCell>
                            </TableRow>}
                        {!isLoadingSpecificQueryContext && (sortedSpecificQueryContext && sortedSpecificQueryContext.length > 0 ? sortedSpecificQueryContext.map(specificQuery =>
                            <TableRow key={`specific-query-${specificQuery[0]}`}>
                                <TableCell style={{ width: '1em', whiteSpace: 'nowrap' }}>{specificQuery[0]}</TableCell>
                                <TableCell className={classes.table_cell}><TextareaAutosize disabled value={format(specificQuery[1])} rowsMax={15} style={{ whiteSpace: 'pre', overflowX: 'auto', width: '100%' }} /></TableCell>
                                <TableCell align="center" className={classes.table_cell}><IconButton size="small" disabled={specificQuery[0] === 'ls'} onClick={() => deleteButtonEventHandler(specificQuery[0])}><DeleteIcon /></IconButton></TableCell>
                            </TableRow>
                        ) : <TableRow><TableCell colSpan={3}><div className="table_view_no_results_container">No results found for [{filterInput}].</div></TableCell></TableRow>)}
                    </TableBody>
                </Table>
            </TableContainer>
            <Dialog open={confirmationVisibility}>
                <DialogTitle>Confirmation</DialogTitle>
                <DialogContent>
                    <DialogContentText>{status} specific query {status === 'Adding' ? newAlias : aliasToDelete}?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="secondary" onClick={status === 'Adding' ? addSpecificQueryHandler : deleteSpecificQueryHandler}>Confirm</Button>
                    <Button color="primary" onClick={() => setConfirmationVisibility(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={status === 'add-success'} autoHideDuration={5000} onClose={() => { setStatus('none'); }}><MuiAlert elevation={6} variant="filled" severity="success">Success! Specific query {newAlias} is added.</MuiAlert></Snackbar>
            <Snackbar open={status === 'add-failed'} autoHideDuration={5000} onClose={() => { setStatus('none'); }}><MuiAlert elevation={6} variant="filled" severity="error">Failed to add specific query {newAlias}.</MuiAlert></Snackbar>
            <Snackbar open={status === 'delete-success'} autoHideDuration={5000} onClose={() => { setStatus('none'); }}><MuiAlert elevation={6} variant="filled" severity="success">Success! Specific query {aliasToDelete} is deleted.</MuiAlert></Snackbar>
            <Snackbar open={status === 'delete-failed'} autoHideDuration={5000} onClose={() => { setStatus('none'); }}><MuiAlert elevation={6} variant="filled" severity="error">Failed to delete specific query {aliasToDelete}.</MuiAlert></Snackbar>
        </Fragment>
    )
}
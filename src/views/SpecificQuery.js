import React, { Fragment, useEffect, useState } from 'react';
import { navigate, useLocation } from '@reach/router';
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
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const classes = useStyles();
    const [status, setStatus] = useState('none');
    const [newAlias, setNewAlias] = useState(params.get('alias') ? decodeURIComponent(params.get('alias')) : "");
    const [newSqlStr, setNewSqlStr] = useState(params.get('sqlStr') ? decodeURIComponent(params.get('sqlStr')) : "");
    const [aliasToDelete, setAliasToDelete] = useState();
    const [filterInput, setFilterInput] = useState('');
    const [confirmationVisibility, setConfirmationVisibility] = useState(false);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('alias');
    const [sortedSpecificQueryContext, setSortedSpecificQueryContext] = useState();
    const environment = useEnvironment();
    const { specificQueryContext, isLoadingSpecificQueryContext, loadSpecificQueries } = useServer();

    const addButtonEventHandler = () => {
        setStatus('Adding')
        setNewAlias("")
        setNewSqlStr("")
    }

    // Format: http://localhost:9000/specific-query?add=SELECT%20*%20FROM%20R_USER_MAIN&alias=selectAll
    // everything after ? needs to be URL encoded

    useEffect(() => {
        if (newAlias === "" && newSqlStr === "") {
            window.history.replaceState('', '', '/specific-query')
        } else {
            window.history.replaceState('', '', `/specific-query?sqlStr=${encodeURIComponent(newSqlStr)}&alias=${encodeURIComponent(newAlias)}`)
        }

    }, [newAlias, newSqlStr])

    useEffect(() => {
        if (newAlias || newSqlStr) {
            setStatus('Adding');
        }
    }, [])

    const addSpecificQueryHandler = async () => {
        setConfirmationVisibility(false)
        await AddSpecificQueryController(newAlias, newSqlStr, environment.restApiLocation)
            .then(res => {
                if (res.status === 200) {
                    loadSpecificQueries()
                    setNewSqlStr("")
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
        await DeleteSpecificQueryController(aliasToDelete, environment.restApiLocation)
            .then(res => {
                if (res.status === 200) {
                    loadSpecificQueries()
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
        if (specificQueryContext?.rows) {
            // sort by column 
            let newSortedSpecificQueryContext = [...specificQueryContext.rows].sort((a, b) => {
                return (order === 'asc' ? 1 : -1) * (orderBy === 'alias' ? a[0].localeCompare(b[0]) : a[1].localeCompare(b[1]))
            })
            // filter by input
            setSortedSpecificQueryContext(newSortedSpecificQueryContext.filter(query => query[0].toLowerCase().includes(filterInput.toLowerCase()) || query[1].toLowerCase().includes(filterInput.toLowerCase())))
        }
        environment.pageTitle = environment.specificQueriesTitle;
        document.title = `${environment.titleFormat()}`
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
                                <TableCell><Input className={classes.fontInherit} onKeyDown={(e) => keyEventHandler(e)} onChange={(e) => setNewAlias(e.target.value)} value={newAlias} /></TableCell>
                                <TableCell><Input fullWidth className={classes.fontInherit} onKeyDown={(e) => keyEventHandler(e)} onChange={(e) => setNewSqlStr(e.target.value)} value={newSqlStr} /></TableCell>
                                <TableCell align="center"><IconButton size="small" disabled={!newAlias || !newSqlStr} onClick={() => setConfirmationVisibility(true)}><SaveIcon /></IconButton><IconButton size="small" onClick={() => {setStatus('none'); setNewAlias(""); setNewSqlStr("");}}><CloseIcon /></IconButton></TableCell>
                            </TableRow>}
                        {!isLoadingSpecificQueryContext && (sortedSpecificQueryContext && sortedSpecificQueryContext.length > 0 ? sortedSpecificQueryContext.map(specificQuery =>
                            <TableRow key={`specific-query-${specificQuery[0]}`}>
                                <TableCell style={{ width: '1em', whiteSpace: 'nowrap' }}>{specificQuery[0]}</TableCell>
                                <TableCell className={classes.table_cell}><TextareaAutosize disabled value={format(specificQuery[1])} rowsMax={15} style={{ whiteSpace: 'pre', width: '100%' }} /></TableCell>
                                <TableCell align="center" className={classes.table_cell}><IconButton size="small" disabled={specificQuery[0] === 'ls'} onClick={() => deleteButtonEventHandler(specificQuery[0])}><DeleteIcon /></IconButton></TableCell>
                            </TableRow>
                        ) : <TableRow><TableCell colSpan={3}><div className="table_view_no_results_container">No results found for [{filterInput}].</div></TableCell></TableRow>)}
                    </TableBody>
                </Table>
            </TableContainer>
            <Dialog open={confirmationVisibility}>
                <DialogTitle>Confirmation</DialogTitle>
                <DialogContent>
                    <DialogContentText>{status} specific query &apos;{status === 'Adding' ? newAlias : aliasToDelete}&apos;?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    {
                        status === 'Adding' ? (
                            <Fragment>
                                <Button color="secondary" onClick={() => setConfirmationVisibility(false)}>Cancel</Button>
                                <Button color="primary" onClick={addSpecificQueryHandler}>Confirm</Button>
                            </Fragment>
                        ) : (
                            <Fragment>
                                <Button color="secondary" onClick={deleteSpecificQueryHandler}>Confirm</Button>
                                <Button color="primary" onClick={() => setConfirmationVisibility(false)}>Cancel</Button>
                                
                            </Fragment>
                        )
                    }
                </DialogActions>
            </Dialog>
            <Snackbar open={status === 'add-success'} autoHideDuration={5000} onClose={() => { setStatus('none'); setNewAlias("") }}><MuiAlert elevation={6} variant="filled" severity="success">Success! Specific query &apos;{newAlias}&apos; is added.</MuiAlert></Snackbar>
            <Snackbar open={status === 'add-failed'} autoHideDuration={5000} onClose={() => { setStatus('none'); }}><MuiAlert elevation={6} variant="filled" severity="error">Failed to add specific query &apos;{newAlias}&apos;.</MuiAlert></Snackbar>
            <Snackbar open={status === 'delete-success'} autoHideDuration={5000} onClose={() => { setStatus('none'); }}><MuiAlert elevation={6} variant="filled" severity="success">Success! Specific query &apos;{aliasToDelete}&apos; is deleted.</MuiAlert></Snackbar>
            <Snackbar open={status === 'delete-failed'} autoHideDuration={5000} onClose={() => { setStatus('none'); }}><MuiAlert elevation={6} variant="filled" severity="error">Failed to delete specific query &apos;{aliasToDelete}&apos;.</MuiAlert></Snackbar>
        </Fragment>
    )
}
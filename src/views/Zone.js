import React, { useState, Fragment, useEffect } from 'react'
import { Button, Dialog, DialogTitle, DialogActions, DialogContent, LinearProgress, Table, TableCell, TableContainer, TableHead, TableRow, Paper, TableBody, Typography, IconButton, Input, Select, Snackbar, makeStyles, TableSortLabel } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import { navigate } from '@reach/router';
import { useEnvironment, useServer } from '../contexts';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';
import { AddZoneController, DeleteZoneController, ModifyZoneController } from '../controllers/ZoneController';

let initialZoneState = {
    name: '',
    type: 'remote',
    users: 0,
    hostname: '',
    port: '',
    comment: ''
}

const useStyles = makeStyles(() => ({
    fontInherit: {
        font: 'inherit'
    },
    table_cell: {
        wordWrap: 'break-word'
    }
}))

export const Zone = () => {
    if (!localStorage.getItem('zmt-token')) navigate('/');
    const { zones, loadZones, isLoadingZones } = useServer()
    const [sortedZones, setSortedZones] = useState([])
    const [status, setStatus] = useState('none')
    const [currZone, setCurrZone] = useState(initialZoneState)
    const [modifiedCurrZone, setModifiedCurrZone] = useState()
    const [confirmationDialog, setConfirmationDialog] = useState({ state: '', visibility: false })
    const [saveButtonIsDisabled, setSaveButtonIsDiabled] = useState(true)
    const [order, setOrder] = useState('')
    const [orderBy, setOrderBy] = useState('asc')
    const classes = useStyles()
    const environment = useEnvironment()

    useEffect(() => {
        if (zones && zones.length > 0) {
            setSortedZones(zones)
        }
        environment.pageTitle = environment.zonesTitle;
        document.title = `${environment.titleFormat()}`
    }, [zones])

    // sort rows if user clicks on the column arrows
    useEffect(() => {
        if (order !== '' && orderBy !== '') {
            let newSortedZone = [...sortedZones]
            newSortedZone.sort((a, b) => (order === 'asc' ? 1 : -1) * (a[orderBy].localeCompare(b[orderBy])))
            setSortedZones(newSortedZone)
        }
    }, [order, orderBy])

    // validate input and check if any inputs are changed
    useEffect(() => {
        if (status === 'edit-mode') {
            setSaveButtonIsDiabled(!(validateEditModeInput() && checkIfChanged()))
        }
        else {
            setSaveButtonIsDiabled(currZone.name === '' || currZone.hostname === '' || currZone.port === '')
        }
    }, [currZone, modifiedCurrZone])

    const handleSort = (newOrderBy) => {
        const isAsc = orderBy === newOrderBy && order === 'desc';
        setOrder(isAsc ? 'asc' : 'desc');
        setOrderBy(newOrderBy)
    }

    // insert new row into dom for zone creation
    const addNewZoneRow = () => {
        setCurrZone(initialZoneState)
        setStatus('creation')
    }

    const addZoneHandler = async () => {
        try {
            const res = await AddZoneController(currZone.name, currZone.type, currZone.hostname + ':' + currZone.port, currZone.comment, environment.httpApiLocation)
            if (res.status === 200) {
                setStatus('add-success')
                loadZones()
            }
        }
        catch (e) {
            setStatus('add-failed')
        }
    }

    // popup for delete zone confirmation
    const deleteZonePopupHandler = (zone) => {
        setCurrZone(zone)
        setConfirmationDialog({ state: 'remove', visibility: true })
    }
    const deleteZoneHandler = async () => {
        const res = await DeleteZoneController(currZone.name, environment.httpApiLocation)
        setConfirmationDialog({ state: 'remove', visibility: false })
        if (res.status === 200) {
            setStatus('remove-success')
            loadZones()
        } else {
            setStatus('remove-error')
        }
    }

    const editZoneModeHandler = (zone) => {
        setCurrZone(zone);
        setModifiedCurrZone(zone)
        setStatus('edit-mode')
    }

    const editZoneHandler = async () => {
        let newZoneName = modifiedCurrZone.name
        let newConnString = `${modifiedCurrZone.hostname}:${modifiedCurrZone.port}`
        let newComment = modifiedCurrZone.comment
        try {
            let updated = true
            if (newZoneName !== currZone.name) {
                let nameModificationRes = await ModifyZoneController(currZone.name, 'name', newZoneName, environment.httpApiLocation)
                if (nameModificationRes.status !== 200) updated = false
            }
            if (newConnString !== (currZone.hostname + ":" + currZone.port)) {
                let hostModificationRes = await ModifyZoneController(newZoneName, 'connection_info', newConnString, environment.httpApiLocation)
                if (hostModificationRes.status !== 200) updated = false
            }
            if (newComment !== currZone.comment) {
                let commentModificationRes = await ModifyZoneController(newZoneName, 'comment', newComment, environment.httpApiLocation)
                if (commentModificationRes.status !== 200) updated = false
            }
            if (updated) {
                loadZones()
                setStatus('edit-success')
            }
        }
        catch (e) {
            setStatus('edit-failed')
        }
        finally {
            setConfirmationDialog({ state: 'modify', visibility: false })
        }
    }

    // return true if inputs are valid and not empty, return false otherwise
    const validateEditModeInput = () => {
        return modifiedCurrZone.name !== '' && modifiedCurrZone.hostname !== '' && parseInt(modifiedCurrZone.port) > 0
    }

    // return true if any edit input has changed, return false otherwise
    const checkIfChanged = () => {
        return !(modifiedCurrZone.name === currZone.name && modifiedCurrZone.hostname === currZone.hostname && modifiedCurrZone.port === currZone.port && modifiedCurrZone.comment === currZone.comment)
    }

    const keyEventHandler = (event) => {
        // check if enter is pressed
        if (event.keyCode === 13) {
            if (status === 'creation') {
                addZoneHandler()
            }
            else {
                setConfirmationDialog({ state: 'modify', visibility: true })
            }
        }
    }

    return (
        <Fragment>
            {zones === undefined || isLoadingZones ? <LinearProgress /> : <div className="table_view_spinner_holder" />}
            <Button variant="outlined" color="primary" onClick={() => addNewZoneRow()}>Add new Zone</Button>
            <br />
            <br />
            <TableContainer component={Paper}>
                <Table style={{ width: '100%', tableLayout: 'fixed' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.table_cell}><TableSortLabel active={orderBy === 'name'} direction={orderBy === 'name' ? order : 'asc'} onClick={() => handleSort('name')}><b>Zone Name</b></TableSortLabel></TableCell>
                            <TableCell className={classes.table_cell}><TableSortLabel active={orderBy === 'type'} direction={orderBy === 'type' ? order : 'asc'} onClick={() => handleSort('type')}><b>Type</b></TableSortLabel></TableCell>
                            <TableCell className={classes.table_cell}><TableSortLabel active={orderBy === 'users'} direction={orderBy === 'users' ? order : 'asc'} onClick={() => handleSort('users')}><b>Users</b></TableSortLabel></TableCell>
                            <TableCell className={classes.table_cell}><TableSortLabel active={orderBy === 'hostname'} direction={orderBy === 'hostname' ? order : 'asc'} onClick={() => handleSort('hostname')}><b>Hostname</b></TableSortLabel></TableCell>
                            <TableCell className={classes.table_cell}><TableSortLabel active={orderBy === 'port'} direction={orderBy === 'port' ? order : 'asc'} onClick={() => handleSort('port')}><b>Port</b></TableSortLabel></TableCell>
                            <TableCell className={classes.table_cell}><TableSortLabel active={orderBy === 'comment'} direction={orderBy === 'comment' ? order : 'asc'} onClick={() => handleSort('comment')}><b>Comment</b></TableSortLabel></TableCell>
                            <TableCell className={classes.table_cell}><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {status === 'creation' &&
                            <TableRow id="add_zone_newrow">
                                <TableCell><Input className={classes.fontInherit} id="new_zone_name_input" onKeyDown={(e) => keyEventHandler(e)} onChange={(e) => setCurrZone({ ...currZone, name: e.target.value })} /></TableCell>
                                <TableCell><Select className={classes.fontInherit} native id="new_zone_type" value="remote" onKeyDown={(e) => keyEventHandler(e)}><option value="remote">remote</option></Select></TableCell>
                                <TableCell></TableCell>
                                <TableCell><Input id="new_zone_host_input" className={classes.fontInherit} onKeyDown={(e) => keyEventHandler(e)} onChange={(e) => setCurrZone({ ...currZone, hostname: e.target.value })} /></TableCell>
                                <TableCell><Input id="new_zone_port_input" type="number" min="1" max="65535" className={classes.fontInherit} onKeyDown={(e) => keyEventHandler(e)} onChange={(e) => setCurrZone({ ...currZone, port: e.target.value })} /></TableCell>
                                <TableCell><Input id="new_zone_comment_input" className={classes.fontInherit} onKeyDown={(e) => keyEventHandler(e)} onChange={(e) => setCurrZone({ ...currZone, comment: e.target.value })} /></TableCell>
                                <TableCell>
                                    <Fragment>
                                        <IconButton size="small" aria-label="make-new-zone" value="save" disabled={saveButtonIsDisabled} onClick={() => { setCurrZone(initialZoneState); addZoneHandler() }}><SaveIcon /></IconButton>
                                        <IconButton size="small" aria-label="close-new-zone-row" value="close" onClick={() => setStatus('none')}><CloseIcon /></IconButton>
                                    </Fragment>
                                </TableCell>
                            </TableRow>
                        }
                        {sortedZones && sortedZones.map(zone => <TableRow key={`zone-${zone.name}`}>
                            <TableCell className={classes.table_cell} style={{ borderLeft: `25px solid ${zone.type === 'local' ? '#04d1c2' : '#808080'}` }}>{(status === 'edit-mode' || isLoadingZones) && currZone.name === zone.name ? <Input id="edit-zone-name-input" className={classes.fontInherit} defaultValue={currZone.name} onKeyDown={(e) => keyEventHandler(e)} onChange={(e) => setModifiedCurrZone({ ...modifiedCurrZone, name: e.target.value })} /> : zone.name}</TableCell>
                            <TableCell className={classes.table_cell}>{zone.type}</TableCell>
                            <TableCell className={classes.table_cell}>{zone.users}</TableCell>
                            <TableCell className={classes.table_cell}>{(status === 'edit-mode' || isLoadingZones) && currZone.name === zone.name ? <Input id="edit-zone-host-input" className={classes.fontInherit} defaultValue={currZone.hostname} onKeyDown={(e) => keyEventHandler(e)} onChange={(e) => setModifiedCurrZone({ ...modifiedCurrZone, hostname: e.target.value })} /> : zone.hostname}</TableCell>
                            <TableCell className={classes.table_cell}>{(status === 'edit-mode' || isLoadingZones) && currZone.name === zone.name ? <Input id="edit-zone-port-input" type="number" min="1" max="65535" className={classes.fontInherit} defaultValue={currZone.port} onKeyDown={(e) => keyEventHandler(e)} onChange={(e) => setModifiedCurrZone({ ...modifiedCurrZone, port: e.target.value })} /> : zone.port}</TableCell>
                            <TableCell className={classes.table_cell}>{(status === 'edit-mode' || isLoadingZones) && currZone.name === zone.name ? <Input id="edit-zone-comment-input" className={classes.fontInherit} defaultValue={currZone.comment} onKeyDown={(e) => keyEventHandler(e)} onChange={(e) => setModifiedCurrZone({ ...modifiedCurrZone, comment: e.target.value })} /> : zone.comment}</TableCell>
                            <TableCell>
                                <Fragment>
                                    {(status === 'edit-mode' || status === 'editing') && currZone.name === zone.name ?
                                        (<Fragment>
                                            <IconButton size="small" aria-label="zone-edit-confirm" disabled={saveButtonIsDisabled} onClick={() => setConfirmationDialog({ state: 'modify', visibility: true })}><SaveIcon /></IconButton>
                                            <IconButton size="small" aria-label="zone-edit-close" onClick={() => setStatus('none')}><CloseIcon /></IconButton>
                                        </Fragment>) :
                                        (<Fragment>
                                            <IconButton size="small" aria-label="zone-edit" disabled={zone.type === 'local' || zone.users > 0} onClick={() => editZoneModeHandler(zone)}><EditIcon /></IconButton>
                                            <IconButton size="small" aria-label="zone-remove" disabled={zone.type === 'local' || zone.users > 0} onClick={() => deleteZonePopupHandler(zone)}><DeleteIcon /></IconButton>
                                        </Fragment>)
                                    }
                                </Fragment>
                            </TableCell>
                        </TableRow>)}
                    </TableBody>
                </Table>
            </TableContainer>
            <Dialog open={confirmationDialog.visibility} onClose={() => setConfirmationDialog({ state: '', visibility: false })} aria-labelledby="form-dialog-title">
                <DialogTitle>Confirmation</DialogTitle>
                <DialogContent>
                    <Typography>{confirmationDialog.state === 'remove' ? 'Removing' : 'Modifying'} zone <b>{currZone.name}</b>?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { confirmationDialog.state === 'remove' ? deleteZoneHandler() : editZoneHandler() }} color="secondary">{confirmationDialog.state === 'remove' ? 'Remove' : 'Modify'}</Button>
                    <Button onClick={() => setConfirmationDialog({ state: '', visibility: false })} color="primary">Cancel</Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={status === 'edit-success'} autoHideDuration={5000} onClose={() => setStatus('none')}><MuiAlert elevation={6} variant="filled" severity="success">Success! Zone {currZone.name} is updated.</MuiAlert></Snackbar>
            <Snackbar open={status === 'edit-failed'} autoHideDuration={5000} onClose={() => setStatus('none')}><MuiAlert elevation={6} variant="filled" severity="error">Failed to modify zone {currZone.name}.</MuiAlert></Snackbar>
            <Snackbar open={status === 'remove-success'} autoHideDuration={5000} onClose={() => setStatus('none')}><MuiAlert elevation={6} variant="filled" severity="success">Success! Zone {currZone.name} is removed.</MuiAlert></Snackbar>
            <Snackbar open={status === 'remove-failed'} autoHideDuration={5000} onClose={() => setStatus('none')}><MuiAlert elevation={6} variant="filled" severity="error">Failed to remove zone {currZone.name}.</MuiAlert></Snackbar>
            <Snackbar open={status === 'add-success'} autoHideDuration={5000} onClose={() => setStatus('none')}><MuiAlert elevation={6} variant="filled" severity="success">Success! Zone {currZone.name} is created.</MuiAlert></Snackbar>
            <Snackbar open={status === 'add-failed'} autoHideDuration={5000} onClose={() => setStatus('none')}><MuiAlert elevation={6} variant="filled" severity="error">Failed to create zone {currZone.name}.</MuiAlert></Snackbar>
        </Fragment>
    )
}
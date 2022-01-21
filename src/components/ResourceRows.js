import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import Typography from '@material-ui/core/Typography';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import CancelIcon from '@material-ui/icons/Cancel';
import EditIcon from '@material-ui/icons/Edit';
import WarningIcon from '@material-ui/icons/Warning';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { useEnvironment, useServer } from '../contexts';
import { ModifyResourceController, RemoveResourceController } from '../controllers/ResourceController';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, Icon, IconButton, Table, TableBody, TableCell, TableRow, Tooltip, Snackbar, TextField } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  link_button: {
    textDecoration: 'none'
  },
  row: {
    paddingTop: 10
  },
  toggle_group: {
    marginLeft: 20
  },
  table_cell: {
    width: '50%',
    fontSize: 15,
    wordWrap: 'break-word',
    height: 40
  },
  remove_button: {
    float: 'right'
  },
  dialog_content: {
    paddingLeft: 20,
    fontSize: 20
  },
  remove_result: {
    textAlign: 'center',
    color: 'red'
  },
  dialog_contenttext: {
    padding: theme.spacing(3),
    fontSize: 15
  },
  cell: {
    fontSize: '1.1rem',
    wordWrap: 'break-word'
  },
  resource_container: {
    display: 'flex',
    flexDirection: 'column',
    padding: '10px 0'
  },
  resource_textfield: {
    width: '50%'
  }
}));

function ResourceRows({ row, validServerHosts }) {
  const classes = useStyles();
  const { restApiLocation } = useEnvironment();
  const { rescTypes, rescPanelStatus, updatingRescPanelStatus, isLoadingZoneContext } = useServer();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [open, setOpen] = useState(false);
  const [successNotification, setSuccessNotification] = useState(false);
  const [failNotification, setFailNotification] = useState(false);
  const [resc, setResc] = useState(row);
  const [currentResc, setCurrentResc] = useState(row);
  const [removeFormOpen, setRemoveForm] = useState(false);
  const [removeErrorMsg, setRemoveErrorMsg] = useState();

  useEffect(() => {
    if (rescPanelStatus === `editing-${resc[11]}`) setIsEditing(true);
    else {
      setCurrentResc(resc);
      setIsEditing(false);
    }
  }, [rescPanelStatus])

  const handleKeyDown = event => {
    if (event.keyCode === 13) {
      saveResource();
    }
  }

  const saveResource = async () => {
    setIsUpdating(true)
    let updatedResc = [...resc];
    try {
      if (currentResc[0] !== resc[0]) {
        await ModifyResourceController(resc[0], 'name', currentResc[0], restApiLocation)
        updatedResc[0] = currentResc[0];
      }
      if (currentResc[1] !== resc[1]) {
        await ModifyResourceController(currentResc[0], 'type', currentResc[1], restApiLocation)
        updatedResc[1] = currentResc[1];
      }
      if (currentResc[3] !== resc[3]) {
        await ModifyResourceController(currentResc[0], 'path', currentResc[3], restApiLocation)
        updatedResc[3] = currentResc[3];
      }
      if (currentResc[4] !== resc[4]) {
        await ModifyResourceController(currentResc[0], 'host', currentResc[4], restApiLocation)
        updatedResc[4] = currentResc[4];
      }
      if (currentResc[5] !== resc[5]) {
        await ModifyResourceController(currentResc[0], 'info', currentResc[5], restApiLocation)
        updatedResc[5] = currentResc[5];
      }
      if (currentResc[6] !== resc[6]) {
        await ModifyResourceController(currentResc[0], 'free_space', currentResc[6], restApiLocation)
        updatedResc[6] = currentResc[6];
      }
      if (currentResc[7] !== resc[7]) {
        await ModifyResourceController(currentResc[0], 'comment', currentResc[7], restApiLocation)
        updatedResc[7] = currentResc[7];
      }
      if (currentResc[9] !== resc[9]) {
        await ModifyResourceController(currentResc[0], 'context', currentResc[9], restApiLocation);
        updatedResc[9] = currentResc[9];
      }
      setIsUpdating(false);
      setResc(updatedResc);
      setSuccessNotification(true);
      closeEditFormHandler();
    }
    catch {
      setIsUpdating(false);
      setResc(updatedResc);
      setCurrentResc(updatedResc);
      setFailNotification(true);
    }
  }

  const checkIfChanged = () => {
    return currentResc[0] === resc[0] && currentResc[1] === resc[1] && currentResc[3] === resc[3] && currentResc[4] === resc[4] && currentResc[5] === resc[5] && currentResc[6] === resc[6] && currentResc[7] === resc[7] && currentResc[9] === resc[9];
  }

  const removeResource = async (name) => {
    try {
      await RemoveResourceController(name, restApiLocation);
      window.location.reload();
    } catch (e) {
      setRemoveErrorMsg("Error: " + e.message);
    }
  }

  const removeFormClose = () => {
    setRemoveForm(false);
    setRemoveErrorMsg();
  }

  const updateCurrentRescHandler = (index, value) => {
    let newCurrResc = [...currentResc];
    newCurrResc[index] = value;
    setCurrentResc(newCurrResc);
  }

  const closeEditFormHandler = () => {
    updatingRescPanelStatus('idle');
  }

  return (
    <React.Fragment >
      <TableRow hover={true} onClick={() => setOpen(!open)}>
        <TableCell className={classes.cell} align="left">{resc[0]}</TableCell>
        <TableCell className={classes.cell} align="left">{resc[1]}</TableCell>
        <TableCell className={classes.cell} align="left">{!isLoadingZoneContext && !validServerHosts.has(resc[4]) && <Tooltip title="Resource hostname does not match a known server."><Icon><WarningIcon style={{color: 'orange', fontSize: 22 }} /></Icon></Tooltip>}{resc[4]}</TableCell>
        <TableCell className={classes.cell} align="left">{resc[3]}</TableCell>
        <TableCell className={classes.cell} align="right"><IconButton>
          {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton></TableCell>
      </TableRow>
      <TableRow hover={true}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <div className={classes.resource_container}>
              <Typography className={classes.row} variant="h6" gutterBottom component="div">
                Resource Details<span className={classes.remove_button}>{isEditing && <Tooltip color="primary" title="Save"><span><IconButton disabled={checkIfChanged() || isUpdating} onClick={saveResource}>{isUpdating ? <CircularProgress size={20} /> : <SaveIcon style={{ fontSize: 20 }} />}</IconButton></span></Tooltip>}
                  {isEditing ? <Tooltip title="Cancel"><IconButton onClick={closeEditFormHandler}><CancelIcon style={{ fontSize: 20 }} /></IconButton></Tooltip> : <Tooltip color="primary" title="Edit"><IconButton onClick={() => updatingRescPanelStatus(`editing-${resc[11]}`)}><EditIcon style={{ fontSize: 20 }} /></IconButton></Tooltip>}<Tooltip color="secondary" title="Delete"><span><IconButton disabled={isEditing} onClick={() => setRemoveForm(true)}><DeleteIcon style={{ fontSize: 20 }} /></IconButton></span></Tooltip></span>
              </Typography>
              <Table style={{ width: '100%', tableLayout: 'fixed'}} size="small" aria-label="purchases">
                <TableBody>
                  <TableRow>
                    <TableCell className={classes.table_cell}>{isEditing ? <TextField className={classes.resource_textfield} label="Name" defaultValue={currentResc[0]} onKeyDown={handleKeyDown} onChange={(event) => { updateCurrentRescHandler(0, event.target.value) }} /> : <span>Name: {resc[0]}</span>}</TableCell>
                    <TableCell className={classes.table_cell}>{isEditing ? <TextField className={classes.resource_textfield} select label="Type" defaultValue={currentResc[1]} onKeyDown={handleKeyDown} onChange={(event) => { updateCurrentRescHandler(1, event.target.value) }} SelectProps={{ native: true }}>{rescTypes.map(type => <option key={`resource-type-${type}`} value={type}>{type}</option>)}</TextField> : <span>Type: {resc[1]}</span>}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.table_cell}>{isEditing ? <TextField className={classes.resource_textfield} label="Hostname" defaultValue={currentResc[4]} onKeyDown={handleKeyDown} onChange={(event) => { updateCurrentRescHandler(4, event.target.value === '' ? 'EMPTY_RESC_HOST' : event.target.value) }} /> : <span>Hostname: {resc[4]}</span>}</TableCell>
                    <TableCell className={classes.table_cell}>{isEditing ? <TextField className={classes.resource_textfield} label="Vault Path" defaultValue={currentResc[3]} onKeyDown={handleKeyDown} onChange={(event) => { updateCurrentRescHandler(3, event.target.value === '' ? 'EMPTY_RESC_PATH' : event.target.value) }} /> : <span>Vault Path: {resc[3]}</span>}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.table_cell}>{isEditing ? <TextField className={classes.resource_textfield} label="Information" defaultValue={currentResc[5]} onKeyDown={handleKeyDown} onChange={(event) => { updateCurrentRescHandler(5, event.target.value) }} /> : <span>Information: {resc[5]}</span>}</TableCell>
                    <TableCell className={classes.table_cell}>{isEditing ? <TextField className={classes.resource_textfield} label="Freespace" defaultValue={currentResc[6]} onKeyDown={handleKeyDown} onChange={(event) => { updateCurrentRescHandler(6, event.target.value) }} /> : <span>Freespace: {resc[6]}</span>}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.table_cell}>{isEditing ? <TextField className={classes.resource_textfield} label="Comment" defaultValue={currentResc[7]} onKeyDown={handleKeyDown} onChange={(event) => { updateCurrentRescHandler(7, event.target.value) }} /> : <span>Comment: {resc[7]}</span>}</TableCell>
                    <TableCell className={classes.table_cell}>{isEditing ? <TextField className={classes.resource_textfield} label="Context" defaultValue={currentResc[9]} onKeyDown={handleKeyDown} onChange={(event) => { updateCurrentRescHandler(9, event.target.value) }} /> : <span>Context: {resc[9]}</span>}</TableCell>
                  </TableRow>
                  {currentResc[10] !== '' && <TableRow>
                    <TableCell className={classes.table_cell}>Parent Context: {currentResc[12]}</TableCell>
                  </TableRow>}
                </TableBody>
              </Table>
            </div>
          </Collapse>
        </TableCell>
      </TableRow>
      <Dialog open={removeFormOpen} onClose={removeFormClose} aria-labelledby="form-dialog-title">
        <DialogContent className={classes.dialog_content}>Are you sure to remove resource <b>{row[0]}</b>? </DialogContent>
        <DialogContentText className={classes.remove_result}>{removeErrorMsg}</DialogContentText>
        <DialogActions><Button color="secondary" onClick={() => { removeResource(row[0]) }}>Remove</Button><Button onClick={removeFormClose}>Cancel</Button></DialogActions>
      </Dialog>
      <Snackbar open={successNotification} autoHideDuration={5000} onClose={() => setSuccessNotification(false)}><MuiAlert elevation={6} variant="filled" severity="success">Success! Resource {row[0]} updated.</MuiAlert></Snackbar>
      <Snackbar open={failNotification} autoHideDuration={5000} onClose={() => setFailNotification(false)}><MuiAlert elevation={6} variant="filled" severity="error">Failed to edit resource {row[0]}.</MuiAlert></Snackbar>
    </React.Fragment >
  );
}

export default ResourceRows;

ResourceRows.propTypes = {
  row: PropTypes.array,
  validServerHosts: PropTypes.object
}
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import TextField from '@material-ui/core/TextField';
import Input from '@material-ui/core/Input';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import EditIcon from '@material-ui/icons/Edit';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

import { ModifyResourceController, RemoveResourceController } from '../controllers/ResourceController';

import { makeStyles, Dialog, DialogActions, DialogContent, DialogContentText, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";

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
    fontSize: 15
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
  dialog_contenttext:{
    padding: theme.spacing(3),
    fontSize: 15
  }
}));

function Rows(props) {
  const { row } = props;
  const classes = useStyles();

  const [editFormOpen, setEditForm] = useState(false);
  const [editStatus, setEditStatus] = useState();
  const [editResult, setEditResult] = useState();

  const [isEditingVaultPath, setEditingVaultPath] = useState(false);
  const [isEditingInformation, setEditingInformation] = useState(false);
  const [isEditingFreespace, setEditingFreespace] = useState(false);
  const [isEditingComment, setEditingComment] = useState(false);
  const [isEditingContext, setEditingContext] = useState(false);

  const [open, setOpen] = useState(false);

  const [vaultPath, setVaultPath] = useState(row[3]);
  const [information, setInformation] = useState(row[5]);
  const [freespace, setFreespace] = useState(row[6]);
  const [comment, setComment] = useState(row[7]);
  const [context, setContext] = useState(row[9]);

  const [removeFormOpen, setRemoveForm] = useState(false);
  const [removeStatus, setRemoveStatus] = useState();

  const editResource = async (name, arg, value) => {
    setEditForm(true);
    setEditStatus(`Modifying Resource ${arg} to ${value}`);
    try {
      const result = await ModifyResourceController(name, arg, value);
      setEditResult("Success");
      setTimeout(() => {
        window.location.reload();
      }, 1000)
    } catch (e) {
      setEditResult("Failed");
    }
  }

  const removeResource = async (name) => {
    try {
      const result = await RemoveResourceController(name);
      window.location.reload();
    } catch (e) {
      setRemoveStatus(e.response.data);
    }
  }

  return (
    <React.Fragment >
      <TableRow hover={true} onClick={() => setOpen(!open)}>
        <TableCell align="left">{row[0]}</TableCell>
        <TableCell align="left">{row[1]}</TableCell>
        <TableCell align="left">{row[3]}</TableCell>
        <TableCell align="left">{row[2]}</TableCell>
        <TableCell align="right">{row[8]}</TableCell>
        {/* <TableCell align="right">
          <IconButton aria-label="expand row" size="small" >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell> */}
      </TableRow>
      <TableRow hover={true}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Typography className={classes.row} variant="h6" gutterBottom component="div">
              Resource Details<span className={classes.remove_button}><Button variant="outlined" color="secondary" onClick={() => setRemoveForm(true)}>Remove</Button></span>
            </Typography>
            <Table size="small" aria-label="purchases">
              <TableBody>
                <TableRow>
                  <TableCell className={classes.table_cell}>Resource Name: {row[0]}</TableCell>
                  <TableCell className={classes.table_cell}>Hostname: {row[4]}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={classes.table_cell}>{isEditingInformation ? <span>Information: <input style={{ fontSize: 15 }} defaultValue={row[5]} onChange={(event) => { setInformation(event.target.value) }}></input><ToggleButtonGroup size="small" className={classes.toggle_group}><ToggleButton onClick={() => { editResource(row[0], 'information', information) }}><SaveIcon style={{ fontSize: 15 }} /></ToggleButton><ToggleButton onClick={() => { setEditingInformation(false) }}><CancelIcon style={{ fontSize: 15 }} /></ToggleButton></ToggleButtonGroup></span> : <span>Information: {row[5]}<ToggleButtonGroup size="small" className={classes.toggle_group}><ToggleButton onClick={() => { setEditingInformation(true) }}><EditIcon style={{ fontSize: 15 }} /></ToggleButton></ToggleButtonGroup></span>}</TableCell>
                  <TableCell className={classes.table_cell}>{isEditingFreespace ? <span>Freespace: <input style={{ fontSize: 15 }} defaultValue={row[6]} onChange={(event) => { setFreespace(event.target.value) }}></input><ToggleButtonGroup size="small" className={classes.toggle_group}><ToggleButton onClick={() => { editResource(row[0], 'freespace', freespace) }}><SaveIcon style={{ fontSize: 15 }} /></ToggleButton><ToggleButton onClick={() => { setEditingFreespace(false) }}><CancelIcon style={{ fontSize: 15 }} /></ToggleButton></ToggleButtonGroup></span> : <span>Freespace: {row[6]}<ToggleButtonGroup size="small" className={classes.toggle_group}><ToggleButton onClick={() => { setEditingFreespace(true) }}><EditIcon style={{ fontSize: 15 }} /></ToggleButton></ToggleButtonGroup></span>}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={classes.table_cell}>{isEditingComment ? <span>Comment: <input style={{ fontSize: 15 }} defaultValue={row[7]} onChange={(event) => { setComment(event.target.value) }}></input><ToggleButtonGroup size="small" className={classes.toggle_group}><ToggleButton onClick={() => { editResource(row[0], 'comment', comment) }}><SaveIcon style={{ fontSize: 15 }} /></ToggleButton><ToggleButton onClick={() => { setEditingComment(false) }}><CancelIcon style={{ fontSize: 15 }} /></ToggleButton></ToggleButtonGroup></span> : <span>Comment: {row[7]}<ToggleButtonGroup size="small" className={classes.toggle_group}><ToggleButton onClick={() => { setEditingComment(true) }}><EditIcon style={{ fontSize: 15 }} /></ToggleButton></ToggleButtonGroup></span>}</TableCell>
                  <TableCell className={classes.table_cell}>{isEditingContext ? <span>Context: <input style={{ fontSize: 15 }} defaultValue={row[9]} onChange={(event) => { setContext(event.target.value) }}></input><ToggleButtonGroup size="small" className={classes.toggle_group}><ToggleButton onClick={() => { editResource(row[0], 'context', context) }}><SaveIcon style={{ fontSize: 15 }} /></ToggleButton><ToggleButton onClick={() => { setEditingContext(false) }}><CancelIcon style={{ fontSize: 15 }} /></ToggleButton></ToggleButtonGroup></span> : <span>Context: {row[9]}<ToggleButtonGroup size="small" className={classes.toggle_group}><ToggleButton onClick={() => { setEditingContext(true) }}><EditIcon style={{ fontSize: 15 }} /></ToggleButton></ToggleButtonGroup></span>}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
      <Dialog open={removeFormOpen} onClose={() => { setRemoveForm(false) }} aria-labelledby="form-dialog-title">
        <DialogContent className={classes.dialog_content}>Are you sure to remove resource <b>{row[0]}</b>? </DialogContent>
        {removeStatus !== undefined ? <DialogContentText className={classes.remove_result}>Error Code {removeStatus.error_code}: {removeStatus.error_message}</DialogContentText> : <span />}
        <DialogActions><Button color="secondary" onClick={() => { removeResource(row[0]) }}>Remove</Button><Button onClick={() => setRemoveForm(false)}>Cancel</Button></DialogActions>
      </Dialog>
      <Dialog open={editFormOpen} onClose={() => { setEditForm(false) }} aria-labelledby="form-dialog-title">
        <DialogContent className={classes.dialog_content}>Modify Resource Progress</DialogContent>
        <DialogContent className={classes.dialog_contenttext}>{editStatus}...{editResult}</DialogContent>
        <DialogActions><Button onClick={() => setEditForm(false)}>Close</Button></DialogActions>
      </Dialog>
    </React.Fragment >
  );
}

export default Rows;
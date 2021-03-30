import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import EditIcon from '@material-ui/icons/Edit';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { useEnvironment } from '../contexts/EnvironmentContext';

import { ModifyResourceController, RemoveResourceController } from '../controllers/ResourceController';

import { makeStyles, Dialog, DialogActions, DialogContent, DialogContentText, Table, TableBody, TableCell, TableRow } from "@material-ui/core";

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
  dialog_contenttext: {
    padding: theme.spacing(3),
    fontSize: 15
  },
  cell: {
    fontSize: '1rem'
  }
}));

function ResourceRows(props) {
  const { row } = props;
  const classes = useStyles();
  const { restApiLocation } = useEnvironment();

  const [editFormOpen, setEditForm] = useState(false);
  const [editResult, setEditResult] = useState();
  const [isEditingFreespace, setEditingFreespace] = useState(false);
  const [isEditingComment, setEditingComment] = useState(false);
  const [isEditingContext, setEditingContext] = useState(false);
  const [open, setOpen] = useState(false);
  const [freespace, setFreespace] = useState(row[6]);
  const [comment, setComment] = useState(row[7]);
  const [context, setContext] = useState(row[9]);

  const [removeFormOpen, setRemoveForm] = useState(false);
  const [removeErrorMsg, setRemoveErrorMsg] = useState();

  const editResource = async (name, arg, value) => {
    setEditForm(true);
    try {
      await ModifyResourceController(name, arg, value, restApiLocation);
      setEditResult("Success");
      setTimeout(() => {
        window.location.reload();
      }, 500)
    } catch (e) {
      setEditResult("Failed");
    }
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

  return (
    <React.Fragment >
      <TableRow hover={true} onClick={() => setOpen(!open)}>
        <TableCell className={classes.cell} align="left">{row[0]}</TableCell>
        <TableCell className={classes.cell} align="left">{row[1]}</TableCell>
        <TableCell className={classes.cell} align="left">{row[4]}</TableCell>
        <TableCell className={classes.cell} align="left">{decodeURIComponent(row[3])}</TableCell>
        <TableCell className={classes.cell} align="left">{row[2]}<IconButton>
          {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton></TableCell>
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
                  <TableCell className={classes.table_cell}>Status: {row[8]}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={classes.table_cell}><span>Information: {row[5]}</span></TableCell>
                  <TableCell className={classes.table_cell}>{isEditingFreespace ? <span>Freespace: <input style={{ fontSize: 15 }} defaultValue={row[6]} onChange={(event) => { setFreespace(event.target.value) }}></input><ToggleButtonGroup size="small" className={classes.toggle_group}><ToggleButton value="save" onClick={() => { editResource(row[0], 'freespace', freespace) }}><SaveIcon style={{ fontSize: 15 }} /></ToggleButton><ToggleButton value="close" onClick={() => { setEditingFreespace(false) }}><CancelIcon style={{ fontSize: 15 }} /></ToggleButton></ToggleButtonGroup></span> : <span>Freespace: {row[6]}<ToggleButtonGroup size="small" className={classes.toggle_group}><ToggleButton value="edit" onClick={() => { setEditingFreespace(true) }}><EditIcon style={{ fontSize: 15 }} /></ToggleButton></ToggleButtonGroup></span>}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={classes.table_cell}>{isEditingComment ? <span>Comment: <input style={{ fontSize: 15 }} defaultValue={row[7]} onChange={(event) => { setComment(event.target.value) }}></input><ToggleButtonGroup size="small" className={classes.toggle_group}><ToggleButton value="save" onClick={() => { editResource(row[0], 'comment', comment) }}><SaveIcon style={{ fontSize: 15 }} /></ToggleButton><ToggleButton value="close" onClick={() => { setEditingComment(false) }}><CancelIcon style={{ fontSize: 15 }} /></ToggleButton></ToggleButtonGroup></span> : <span>Comment: {row[7]}<ToggleButtonGroup size="small" className={classes.toggle_group}><ToggleButton value="edit" onClick={() => { setEditingComment(true) }}><EditIcon style={{ fontSize: 15 }} /></ToggleButton></ToggleButtonGroup></span>}</TableCell>
                  <TableCell className={classes.table_cell}>{isEditingContext ? <span>Context: <input style={{ fontSize: 15 }} defaultValue={row[9]} onChange={(event) => { setContext(event.target.value) }}></input><ToggleButtonGroup size="small" className={classes.toggle_group}><ToggleButton value="save" onClick={() => { editResource(row[0], 'context', context) }}><SaveIcon style={{ fontSize: 15 }} /></ToggleButton><ToggleButton value="close" onClick={() => { setEditingContext(false) }}><CancelIcon style={{ fontSize: 15 }} /></ToggleButton></ToggleButtonGroup></span> : <span>Context: {row[9]}<ToggleButtonGroup size="small" className={classes.toggle_group}><ToggleButton value="edit" onClick={() => { setEditingContext(true) }}><EditIcon style={{ fontSize: 15 }} /></ToggleButton></ToggleButtonGroup></span>}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
      <Dialog open={removeFormOpen} onClose={removeFormClose} aria-labelledby="form-dialog-title">
        <DialogContent className={classes.dialog_content}>Are you sure to remove resource <b>{row[0]}</b>? </DialogContent>
        <DialogContentText className={classes.remove_result}>{removeErrorMsg}</DialogContentText>
        <DialogActions><Button color="secondary" onClick={() => { removeResource(row[0]) }}>Remove</Button><Button onClick={removeFormClose}>Cancel</Button></DialogActions>
      </Dialog>
      <Dialog open={editFormOpen} onClose={() => { setEditForm(false) }} aria-labelledby="form-dialog-title">
        <DialogContent className={classes.dialog_content}>Modify Resource</DialogContent>
        <DialogContent className={classes.dialog_contenttext}>{editResult}</DialogContent>
      </Dialog>
    </React.Fragment >
  );
}

export default ResourceRows;
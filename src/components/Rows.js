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

import { ResourceController } from '../controllers/ResourceController';

import { makeStyles, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";

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
  }
}));

function Rows(props) {
  const { row } = props;
  const classes = useStyles();

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

  const editResource = async (name, arg, value) => {

    const result = await ResourceController(name, arg, value);
    console.log(result);
  }

  return (
    <React.Fragment >
      <TableRow onClick={() => setOpen(!open)}>
        <TableCell align="left">{row[0]}</TableCell>
        <TableCell align="left">{row[1]}</TableCell>
        <TableCell align="left">{row[2]}</TableCell>
        <TableCell align="right">{row[8]}</TableCell>
        {/* <TableCell align="right">
          <IconButton aria-label="expand row" size="small" >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell> */}
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Typography className={classes.row} variant="h6" gutterBottom component="div">
              Resource Details
                </Typography>
            <Table size="small" aria-label="purchases">
              <TableBody>
                <TableRow>
                  <TableCell>Vault Path: {decodeURIComponent(row[3])}</TableCell>
                  <TableCell>Hostname: {row[4]}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Information: {row[5]}</TableCell>
                  <TableCell>Freespace: {row[6]}</TableCell>
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
    </React.Fragment >
  );
}

export default Rows;
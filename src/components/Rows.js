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
    fontSize: 15
  }
}));

function Rows(props) {
  const { row } = props;
  const classes = useStyles();
  const [isEditing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);

  const [context, setContext] = useState(row[9]);

  const editResource = async (name, arg, value) => {

    const result = await ResourceController(name, arg, value);
    console.log(result);
  }

  return (
    <React.Fragment >
      <TableRow>
        <TableCell align="left">{row[0]}</TableCell>
        <TableCell align="right">{row[1]}</TableCell>
        <TableCell align="right">{row[2]}</TableCell>
        <TableCell align="right">{row[8]}</TableCell>
        <TableCell align="right">
          <Link className={classes.link_button} to={{ pathname: '/resource/edit', resourceInfo: row }}><Button color="primary">Edit</Button></Link>
          <Button color="secondary" onClick={() => { props.handleRemoveFormOpen(row) }}>Remove</Button>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
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
                  <TableCell style={{ width: '50%' }}>Vault Path: {decodeURIComponent(row[3])}</TableCell>
                  <TableCell>Hostname: {row[4]}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Information: {row[5]}</TableCell>
                  <TableCell>Freespace: {row[6]}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Comment: {row[7]}</TableCell>
                  <TableCell className={classes.table_cell}>{isEditing ? <span>Context: <input style={{ fontSize: 15 }} defaultValue={row[9]} onChange={(event) => { setContext(event.target.value) }}></input><ToggleButtonGroup size="small" className={classes.toggle_group}><ToggleButton onClick={() => { editResource(row[0], 'context', context) }}><SaveIcon style={{ fontSize: 15 }} /></ToggleButton><ToggleButton onClick={() => { setEditing(false) }}><CancelIcon style={{ fontSize: 15 }} /></ToggleButton></ToggleButtonGroup></span> : <span>Context: {row[9]}<ToggleButtonGroup size="small" className={classes.toggle_group}><ToggleButton onClick={() => { setEditing(true) }}><EditIcon style={{ fontSize: 15 }} /></ToggleButton></ToggleButtonGroup></span>}</TableCell>
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
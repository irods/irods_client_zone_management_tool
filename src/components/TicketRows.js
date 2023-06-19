import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Collapse from '@material-ui/core/Collapse';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { makeStyles, IconButton, Table, TableBody, TableCell, TableRow } from "@material-ui/core";

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
    wordWrap: 'break-word'
  },
  resource_container: {
    display: 'flex',
    flexDirection: 'column',
    padding: '10px 0'
  },
  resource_textfield: {
    width: '50%'
  },
  collapse: {
    backgroundColor: '#f5f5f5'
  }
}));

function TicketRows({ row }) {
  const classes = useStyles(); 
  // const [ticket, setTicket] = useState(row);
  const ticket = row; // the above line is there in case we need to change the state of the ticket (through ticket editing)
  const [open, setOpen] = useState(false);

//   useEffect(() => {
//     if (rescPanelStatus === `editing-${resc[11]}`) setIsEditing(true);
//     else {
//       setCurrentResc(resc);
//       setIsEditing(false);
//     }
//   }, [rescPanelStatus])


  let d1 = new Date(parseInt(ticket[13] * 1000, 10))
  let d2 = new Date(parseInt(ticket[14] * 1000, 10))
  let show1 = d1.toLocaleDateString() + ",  " + d1.toLocaleTimeString()
  let show2 = d2.toLocaleDateString() + ", " + d2.toLocaleTimeString()
  

  if (ticket[13] == ticket[14]) {
      show2 = "N/A"
  }   

  let temp = new Date(parseInt(ticket[6] * 1000, 10)) 
  let d3 = ticket[12] ? temp.toLocaleDateString() + ", " + temp.toLocaleTimeString() : "N/A"

  return (
    <React.Fragment>
        <TableRow hover={true} onClick={() => setOpen(!open)}>
            <TableCell className={classes.table_cell} style={{ width: '40%' }}>{ticket[17]}</TableCell>
            <TableCell className={classes.table_cell} style={{ width: '40%' }}>{ticket[2]}</TableCell>
            <TableCell className={classes.table_cell} style={{ width: '20%' }}>{ticket[0]}</TableCell>
            <TableCell className={classes.table_cell} style={{ width: '20%' }}>{show1}</TableCell>
            <TableCell className={classes.table_cell} style={{ width: '20%' }}>{show2}</TableCell>
            <TableCell className={classes.table_cell} style={{ width: '20%' }}>{d3}</TableCell>
            <TableCell>
                <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)} align='right'>
                    {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
            </TableCell>
        </TableRow>

        <TableRow hover={true} className={classes.collapse}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
            <Collapse in={open} timeout="auto" unmountOnExit>
            <Table
                style={{ width: "100%", tableLayout: "fixed" }}
                size="small"
                
              >
                <TableBody>
                    <TableRow>
                        <TableCell className={classes.table_cell} style={{ width: '40%' }}>TICKET_STRING: {ticket[1]}</TableCell>
                        <TableCell className={classes.table_cell} style={{ width: '40%' }}>TICKET_USER_ID: {ticket[3]}</TableCell>
                        <TableCell className={classes.table_cell} style={{ width: '40%' }}>TICKET_OBJECT_ID: {ticket[4]}</TableCell>
                        <TableCell className={classes.table_cell} style={{ width: '40%' }}>TICKET_OBJECT_TYPE: {ticket[5]}</TableCell>
                    </TableRow>
               
                    <TableRow>
                        <TableCell className={classes.table_cell} style={{ width: '40%' }}>TICKET_USES_LIMIT: {ticket[6]}</TableCell>
                        <TableCell className={classes.table_cell} style={{ width: '40%' }}>TICKET_USES_COUNT: {ticket[7]}</TableCell>
                        <TableCell className={classes.table_cell} style={{ width: '40%' }}>TICKET_WRITE_FILE_COUNT: {ticket[8]}</TableCell>
                        <TableCell className={classes.table_cell} style={{ width: '40%' }}>TICKET_WRITE_FILE_LIMIT: {ticket[9]}</TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell className={classes.table_cell} style={{ width: '40%' }}>TICKET_WRITE_BYTE_COUNT: {ticket[10]}</TableCell>
                        <TableCell className={classes.table_cell} style={{ width: '40%' }}>TICKET_WRITE_BYTE_LIMIT: {ticket[11]}</TableCell>
                        <TableCell className={classes.table_cell} style={{ width: '40%' }}>TICKET_DATA_NAME: {ticket[15]}</TableCell>
                        <TableCell className={classes.table_cell} style={{ width: '40%' }}>TICKET_DATA_COLL_NAME: {ticket[16]}</TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell className={classes.table_cell} style={{ width: '40%' }}>TICKET_OWNER_ZONE: {ticket[18]}</TableCell>
                    </TableRow>

                </TableBody>

            </Table>
            </Collapse>
        </TableCell>
      </TableRow>

    </React.Fragment>

  );
}

export default TicketRows;

TicketRows.propTypes = {
  row: PropTypes.array,
}
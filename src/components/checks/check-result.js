import React, { useState, Fragment } from 'react'
import { Collapse, IconButton, makeStyles, TableCell, TableRow, Tooltip } from '@material-ui/core'
import { useCheck } from '../../contexts'
import LoopIcon from '@material-ui/icons/Autorenew'
import CheckIcon from '@material-ui/icons/Check';
import ErrorIcon from '@material-ui/icons/Error';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import WarningIcon from '@material-ui/icons/Warning';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight'
import PropTypes from 'prop-types'
import TimeAgo from 'timeago-react'

const useRowStyles = makeStyles({
    root: {
        '& > *': {
            borderBottom: 'unset',
        },
    }
});

export const CheckResult = ({ status, check, result }) => {
    const [expanded, setExpanded] = useState(false)
    const { runOneCheck } = useCheck()
    const classes = useRowStyles()
    return (
        <Fragment>
            <TableRow hover={true} className={classes.root}>
                <TableCell><IconButton size="small" onClick={() => setExpanded(!expanded)}>{expanded ? <ExpandMoreIcon /> : <KeyboardArrowRightIcon />}</IconButton></TableCell>
                <TableCell style={{ cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>{result[0].name}</TableCell>
                <TableCell><i><TimeAgo datetime={result[1].timestamp} /></i></TableCell>
                <TableCell align="center"><input checked type="checkbox" /></TableCell>
                <TableCell align="center"><Tooltip title="Run this check again"><IconButton size="small" onClick={() => runOneCheck(check)}><LoopIcon /></IconButton></Tooltip></TableCell>
                <TableCell style={{ paddingLeft: '20px' }}>{status === 'healthy' ? <CheckIcon style={{ color: 'green' }} /> : (status === 'error' ? <ErrorIcon style={{ color: 'red' }} /> : <WarningIcon style={{ color: 'orange' }} />)}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <div style={{ padding: '10px 0' }}>
                            <div>Description: {result[0].description}</div>
                            <div>Result: {result[1].message}</div>
                        </div>
                    </Collapse>
                </TableCell>
            </TableRow>
        </Fragment>
    )
}

CheckResult.propTypes = {
    status: PropTypes.string.isRequired,
    check: PropTypes.object.isRequired,
    result: PropTypes.any.isRequired
}
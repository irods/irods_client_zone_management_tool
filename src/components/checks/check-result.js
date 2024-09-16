import React, { useState, Fragment } from 'react';
import { Collapse, IconButton, Input, makeStyles, TableCell, TableRow, Tooltip } from '@mui/material';
import { useCheck } from '../../contexts';
import { Loop as LoopIcon, Check as CheckIcon, Error as ErrorIcon, ExpandMore as ExpandMoreIcon, Block as BlockIcon, BugReport as WarningIcon,
    ArrowRight as KeyboardArrowRightIcon, Highlight as HighlightOffIcon, Edit as EditIcon, Close as CloseIcon, Cancel as CancelIcon } from '@mui/icons-material';

import PropTypes from 'prop-types';
import TimeAgo from 'react-timeago';

const useRowStyles = makeStyles({
    root: {
        '& > *': {
            borderBottom: 'unset',
        },
    }
});

export const CheckResult = ({ status, check, result }) => {
    const { runOneCheck, checkIntervals, inactiveChecks, modifyCheckActivity, modifyCheckInterval } = useCheck();
    const [expanded, setExpanded] = useState(false);
    const [interval, setInterval] = useState(checkIntervals[check.id]);
    const [isEditingInterval, setIsEditingInterval] = useState(false);
    const classes = useRowStyles();

    const intervalHandler = () => {
        setIsEditingInterval(false);
        modifyCheckInterval(check.id, interval);
    };

    const handleKeyDown = (e) => {
        if (e.keyCode === 13) intervalHandler();
    };

    return (
        <Fragment>
            <TableRow hover={true} className={classes.root}>
                <TableCell><IconButton size="small" onClick={() => setExpanded(!expanded)}>{expanded ? <ExpandMoreIcon /> : <KeyboardArrowRightIcon />}</IconButton></TableCell>
                <TableCell style={{ cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>{result[0].name}</TableCell>
                <TableCell><i>{result[1].timestamp === 'N/A' ? 'N/A' : <TimeAgo date={result[1].timestamp} />}</i></TableCell>
                <TableCell align="center"><input defaultChecked={!inactiveChecks.has(result[0].id)} disabled={!check.isValid} type="checkbox" onClick={() => modifyCheckActivity(result[0].id)} /></TableCell>
                <TableCell align="center">{checkIntervals[check.id]} {checkIntervals[check.id] !== 'N/A' && 'seconds'}</TableCell>
                <TableCell align="center"><Tooltip title={inactiveChecks.has(result[0].id) ? "This check is inactive" : "Run this check again"}><span><IconButton size="small" disabled={inactiveChecks.has(result[0].id) || !check.isValid} onClick={() => runOneCheck(check)}><LoopIcon /></IconButton></span></Tooltip></TableCell>
                <TableCell style={{ paddingLeft: '20px' }}>{status === 'healthy' ? <CheckIcon style={{ color: 'green' }} /> : (status === 'error' ? <ErrorIcon style={{ color: 'red' }} /> : (status === 'warning' ? <WarningIcon style={{ color: 'orange' }} /> : (status === 'unavailable' ? <HighlightOffIcon /> : (status === 'invalid' ? <CancelIcon style={{ color: 'red' }} /> : <BlockIcon />))))}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <div style={{ padding: '10px 0' }}>
                            <div><b>Interval:</b> {isEditingInterval ? <Fragment><Input type="number" inputProps={{ "step": 0.01, "min": 1 }} onKeyDown={(event) => handleKeyDown(event)} style={{ width: '50px' }} onChange={(e) => setInterval(e.target.value)} /> seconds<IconButton size="small" onClick={() => intervalHandler()}><CheckIcon /></IconButton><IconButton size="small" onClick={() => setIsEditingInterval(false)}><CloseIcon /></IconButton></Fragment> : <span>{interval} seconds <IconButton size="small" disabled={!check.active || !check.isValid} onClick={() => setIsEditingInterval(true)}><EditIcon /></IconButton></span>}</div>
                            <div><b>Description:</b> {result[0].description}</div>
                            <div><b>Result:</b> {result[1].message}</div>
                        </div>
                    </Collapse>
                </TableCell>
            </TableRow>
        </Fragment>
    );
};

CheckResult.propTypes = {
    status: PropTypes.string.isRequired,
    check: PropTypes.object.isRequired,
    result: PropTypes.any.isRequired
};
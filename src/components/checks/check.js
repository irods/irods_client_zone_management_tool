import React, { Fragment, useEffect, useState } from 'react'
import { useCheck } from '../../contexts'
import { CircularProgress, Chip, Paper, Table, TableHead, TableBody, TableCell, TableRow, TableSortLabel, TextField, TableContainer } from '@material-ui/core';
import { CheckResult } from '.';
import CheckIcon from '@material-ui/icons/Check'
import ErrorIcon from '@material-ui/icons/Error'
import WarningIcon from '@material-ui/icons/Warning'
import BlockIcon from '@material-ui/icons/Block'
import HighlightOffIcon from '@material-ui/icons/HighlightOff'
import CancelIcon from '@material-ui/icons/Cancel'

export const Check = () => {
    const { isChecking, checks, runAllCheck, checkObject, checkResults, statusResult, timeStamp } = useCheck()
    const [statusFilter, setStatusFilter] = useState('All')
    const [titleFilter, setTitleFilter] = useState('')
    const [filteredResults, setFilteredResults] = useState([])
    const [order, setOrder] = useState('asc')
    const [orderBy, setOrderBy] = useState('CHECK_NAME')

    const handleSort = (props) => {
        const isAsc = orderBy === props && order === 'desc';
        setOrder(isAsc ? 'asc' : 'desc');
        setOrderBy(props);
    }

    useEffect(() => {
        if (Object.keys(checkResults).length > 0) {
            let newFilteredResults = []
            if (statusFilter == 'All' && titleFilter === '') newFilteredResults = Object.entries(checkResults)
            else {
                // case-insensitive filtering
                for (const [id, details] of Object.entries(checkResults)) {
                    if ((details[1]['status'] === statusFilter || statusFilter === 'All') && details[0]['name'].toLowerCase().includes(titleFilter.toLowerCase())) newFilteredResults.push([id, details])
                }
            }
            // sorting by column name
            newFilteredResults.sort((a, b) => {
                return (order === 'asc' ? 1 : -1) * (orderBy === 'CHECK_NAME' ? a[1][0].name.localeCompare(b[1][0].name) : (orderBy === 'LAST_CHECKED' ? a[1][1]['timestamp'] - b[1][1]['timestamp'] : a[1][1]['status'].localeCompare(b[1][1]['status'])))
            })
            setFilteredResults(newFilteredResults)
        }
    }, [timeStamp, checkResults, statusFilter, titleFilter, order, orderBy])

    return (
        <Fragment>
            <div style={{ display: 'flex', alignContent: 'center', justifyContent: 'space-between' }}>
                <span>
                    <Chip style={{ margin: '5px' }} variant={statusFilter === 'All' ? 'default' : 'outlined'} label={`All ${checks.length}`} color='default' clickable={true} onClick={() => setStatusFilter('All')} />
                    {Object.keys(statusResult).length > 0 && [...Object.keys(statusResult)].filter(status => statusResult[status] !== 0).map(status => <Chip style={{ margin: '5px', padding: '2px' }} key={status} variant={statusFilter === status ? 'default' : 'outlined'} color='default' label={`${status} ${statusResult[status]}`} icon={status === 'healthy' ? <CheckIcon style={{ color: 'green' }} /> : (status === 'error' ? <ErrorIcon style={{ color: 'red' }} /> : (status === 'warning' ? <WarningIcon style={{ color: 'orange' }} /> : (status === 'unavailable' ? <HighlightOffIcon /> : (status === 'invalid' ? <CancelIcon style={{ color: 'red'}} /> : <BlockIcon />))))} clickable={true} onClick={() => setStatusFilter(status)} />)}
                </span>
                <TextField style={{ width: '200px' }} value={titleFilter} placeholder="Filter by title..." onChange={(e) => setTitleFilter(e.target.value)} />
            </div>
            <br />
            <Paper variant="outlined">
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ width: '5%' }}></TableCell>
                                <TableCell style={{ width: '40%' }}><TableSortLabel active={orderBy === 'CHECK_NAME'} direction={orderBy === 'CHECK_NAME' ? order : 'asc'} onClick={() => handleSort('CHECK_NAME')} ><b>Health Check</b></TableSortLabel></TableCell>
                                <TableCell style={{ width: '15%' }}><TableSortLabel active={orderBy === 'LAST_CHECKED'} direction={orderBy === 'LAST_CHECKED' ? order : 'asc'} onClick={() => handleSort('LAST_CHECKED')} ><b>Last Checked</b></TableSortLabel></TableCell>
                                <TableCell style={{ width: '5%' }}><b>Active</b></TableCell>
                                <TableCell align="center" style={{ width: '10%' }}><b>Interval</b></TableCell>
                                <TableCell align="center" style={{ width: '10%' }}><button onClick={() => runAllCheck()}>Check All</button></TableCell>
                                <TableCell style={{ width: '5%' }}><TableSortLabel active={orderBy === 'CHECK_STATUS'} direction={orderBy === 'CHECK_STATUS' ? order : 'asc'} onClick={() => handleSort('CHECK_STATUS')} ><b>Status</b></TableSortLabel></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isChecking ? <TableRow><TableCell colSpan={4}><CircularProgress /></TableCell></TableRow> : (Object.keys(checkResults).length === 0 ? <TableRow><TableCell colSpan={4}>No results.</TableCell></TableRow> : (filteredResults.map(result => <CheckResult key={result[0]} status={result[1][1]['status']} check={checkObject[result[0]]} result={result[1]} />)))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Fragment>
    )
}
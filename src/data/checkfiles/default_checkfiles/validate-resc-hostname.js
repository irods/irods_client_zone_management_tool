import { Link } from '@reach/router'
import React from 'react'

export const validateRescHostname = {
    "name": "Each resource has a valid hostname",
    "description": "Checks if each resource hostname matches a known server",
    "min_server_version": "4.2.0",
    "max_server_version": "4.2.10",
    "checker": function () {
        let validHostSet = new Set()
        validHostSet.add('EMPTY_RESC_HOST')
        let result = {
            status: '',
            message: '',
            success: 0,
            failed: []
        }
        this.zoneContext.forEach(server => validHostSet.add(server['host_system_information']['hostname']))
        this.rescAll._embedded.forEach(resc => validHostSet.has(resc[4]) ? result.success++ : result.failed.push(resc))
        result.status = result.failed.length === 0 ? 'healthy' : 'warning'
        result.message = result.status === 'warning' ? <span><span>Failed on: </span>{result.failed.map((failedResc, index) => <span key={`rescCheckFailed-${failedResc[10]}`}>{index !== 0 && ', '}<Link className="check_result_link" to={`/resources?filter=${encodeURIComponent(failedResc[0])}`}>{`${failedResc[0]}:${failedResc[1]}`}</Link> ({failedResc[4]})</span>)}</span> : 'All resources have a valid hostname.'
        return result
    }
}
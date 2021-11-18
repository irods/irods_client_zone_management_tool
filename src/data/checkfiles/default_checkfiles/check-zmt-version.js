import axios from 'axios'
import { version } from '../../../../package.json'

export const checkZMTVersion = {
    "name": "ZMT is running the latest version",
    "description": "Checks if ZMT is running the latest version",
    "min_server_version": "4.2.0",
    "max_server_version": "4.2.10",
    "interval_in_seconds": 300,
    "active": true,
    "checker": async function () {
        const latestTag = await axios.get('https://api.github.com/repos/irods/irods_client_zone_management_tool/releases/latest')
        let result = {
            status: latestTag.data.tag_name === version ? 'healthy' : 'warning',
            message: latestTag.data.tag_name === version ? `ZMT is running the latest version ${latestTag.data.tag_name}.` : `Latest ZMT version is ${latestTag.data.tag_name}, yours is ${version}`,
        }
        return result
    }
}
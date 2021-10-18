import axios from 'axios'

export const restApiQueryEndpoint = {
    "name": "iRODS Client REST API - /query endpoint",
    "description": "/query endpoint should return a status code rather than 5xx.",
    "min_server_version": "4.2.0",
    "max_server_version": "4.2.10",
    "checker": async function () {
        let result = {
            status: '',
            message: ''
        }
        await axios({
            url: `${this.restApiLocation}/query`,
            method: 'POST',
            timeout: this.restApiTimeout * 1000
        }).catch(e => {
            if (!e.response || e.response.status >= 500) {
                result.status = 'error'
                result.message = '/query endpoint is down.'
            } else {
                result.status = 'healthy'
                result.message = '/query endpoint is running normally.'
            }
        })
        return result
    }
}
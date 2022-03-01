import axios from 'axios'

export const restApiAdminEndpoint = {
    name: "iRODS Client REST API - /admin endpoint",
    description: `Checks ${process.env.REACT_APP_REST_API_URL}/admin for non-5xx.`,
    min_server_version: "4.2.0",
    max_server_version: "",
    interval_in_seconds: 300,
    active: true,
    checker: async function () {
        let result = {
            status: '',
            message: ''
        }
        await axios({
            url: `${this.restApiLocation}/admin`,
            method: 'POST',
            timeout: this.restApiTimeout * 1000
        }).catch(e => {
            if (!e.response || e.response.status >= 500) {
                result.status = 'error'
                result.message = '/admin endpoint is down.'
            } else {
                result.status = 'healthy'
                result.message = '/admin endpoint is running normally.'
            }
        })
        return result
    }
}
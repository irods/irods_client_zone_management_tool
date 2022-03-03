import axios from 'axios'

export default {
    name: "iRODS Client REST API - /auth endpoint",
    description: `Checks ${process.env.REACT_APP_REST_API_URL}/auth for non-5xx.`,
    minimum_server_version: "4.2.0",
    maximum_server_version: "",
    interval_in_seconds: 300,
    active: true,
    checker: async function () {
        let result = {
            status: '',
            message: ''
        }
        await axios({
            url: `${this.restApiLocation}/auth`,
            method: 'POST',
            timeout: this.restApiTimeout * 1000
        }).catch(e => {
            if (!e.response || e.response.status >= 500) {
                result.status = 'error'
                result.message = '/auth endpoint is down.'
            } else {
                result.status = 'healthy'
                result.message = '/auth endpoint is running normally.'
            }
        })
        return result
    }
}
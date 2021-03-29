import axios from 'axios';

export const ModifyResourceController = (name, arg, value, restApiLocation) => {
    return axios({
        method: 'POST',
        url: `${restApiLocation}/admin`,
        headers: {
            'Accept': 'application/json',
            'Authorization': localStorage.getItem('zmt-token')
        },
        params: {
            action: 'modify',
            target: 'resource',
            arg2: name,
            arg3: arg,
            arg4: value
        }
    })
}


export const RemoveResourceController = async (name, restApiLocation) => {
    return axios({
        method: 'POST',
        url: `${restApiLocation}/admin`,
        headers: {
            'Authorization': localStorage.getItem('zmt-token')
        },
        params: {
            action: 'rm',
            target: 'resource',
            arg2: name,
            arg3: ''
        }
    })
}

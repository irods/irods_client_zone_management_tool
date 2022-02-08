import axios from 'axios'

export const AddZoneController = (name, type, location, comment, restApiLocation) => {
    return axios({
        method: 'POST',
        url: `${restApiLocation}/admin`,
        headers: {
            'Accept': 'application/json',
            'Authorization': localStorage.getItem('zmt-token')
        },
        params: {
            action: 'add',
            target: 'zone',
            arg2: name,
            arg3: type,
            arg4: location,
            arg5: comment
        }
    })
}

export const DeleteZoneController = (name, restApiLocation) => {
    return axios({
        method: 'POST',
        url: `${restApiLocation}/admin`,
        headers: {
            'Accept': 'application/json',
            'Authorization': localStorage.getItem('zmt-token')
        },
        params: {
            action: 'remove',
            target: 'zone',
            arg2: name
        }
    })
}

export const ModifyZoneController = (name, target, value, restApiLocation) => {
    return axios({
        method: 'POST',
        url: `${restApiLocation}/admin`,
        headers: {
            'Accept': 'application/json',
            'Authorization': localStorage.getItem('zmt-token')
        },
        params: {
            action: 'modify',
            target: 'zone',
            arg2: name,
            arg3: target,
            arg4: value
        }
    })
}

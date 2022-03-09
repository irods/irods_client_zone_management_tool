import axios from 'axios'

export const AddSpecificQueryController = (alias, sqlStr, restApiLocation) => {
    return axios({
        method: 'POST',
        url: `${restApiLocation}/admin`,
        headers: {
            'Accept': 'application/json',
            'Authorization': localStorage.getItem('zmt-token')
        },
        params: {
            action: 'add',
            target: 'specificQuery',
            arg2: sqlStr,
            arg3: alias 
        }
    })
}

export const DeleteSpecificQueryController = (alias, restApiLocation) => {
    return axios({
        method: 'POST',
        url: `${restApiLocation}/admin`,
        headers: {
            'Accept': 'application/json',
            'Authorization': localStorage.getItem('zmt-token')
        },
        params: {
            action: 'remove',
            target: 'specificQuery',
            arg2: alias 
        }
    })
}
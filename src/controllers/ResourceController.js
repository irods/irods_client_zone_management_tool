import axios from 'axios';
import Cookies from 'js-cookie';

const token = Cookies.get('token');

export const ModifyResourceController = async (name, arg, value, Url) => {
    const result = await axios({
        method: 'POST',
        url: `${Url}/irods-rest/1.0.0/admin`,
        headers: {
            'Accept': 'application/json',
            'Authorization': token
        },
        params: {
            action: 'modify',
            target: 'resource',
            arg2: name,
            arg3: arg,
            arg4: value
        }
    })
    return result;
}


export const RemoveResourceController = async (name,Url) => {
    const result = await axios({
        method: 'POST',
        url: `${Url}/irods-rest/1.0.0/admin`,
        headers: {
            'Authorization': token
        },
        params: {
            action: 'rm',
            target: 'resource',
            arg2: name,
            arg3: ''
        }
    })
    return result;
}

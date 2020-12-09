import axios from 'axios';
import Cookies from 'js-cookie';


const token = Cookies.get("token");

export const ResourceController = async (name, arg, value) => {
    const result = await axios({
        method: 'POST',
        url: 'http://54.210.60.122:80/irods-rest/1.0.0/admin',
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


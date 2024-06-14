import axios from 'axios';

export const AddUserController = (name, zone, userType, restApiLocation) => {
    return axios({
        method: 'POST',
        url: `${restApiLocation}/users-groups`,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`
        },
        params: {
            op: 'create_user',
            name: name,
            zone: zone,
            "user-type": userType,
        }
    })
}

export const ModifyUserPasswordController = (name, zone, newPassword, restApiLocation) => {
    return axios({
        method: 'POST',
        url: `${restApiLocation}/users-groups`,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`
        },
        params: {
            op: "set_password",
            name: name,
            zone: zone,
            "new-password": newPassword
        }
    })
}

export const ModifyUserTypeController = (name, zone, newUserType, restApiLocation) => {
    return axios({
        method: 'POST',
        url: `${restApiLocation}/users-groups`,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`
        },
        params: {
            op: "set_user_type",
            name: name,
            zone: zone,
            "new-user-type": newUserType
        }
    })
}


export const RemoveUserController = async (name, zone, restApiLocation) => {
    return axios({
        method: 'POST',
        url: `${restApiLocation}/users-groups`,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`
        },
        params: {
            op: "remove_user",
            name: name,
            zone: zone
        }
    })
}
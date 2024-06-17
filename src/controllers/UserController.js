import axios from 'axios';

export const AddUserController = (name, zone, userType, restApiLocation) => {
    const params = new URLSearchParams({
        op: "create_user",
        name: name,
        zone: zone,
        "user-type": userType
    });

    return axios.post(
        `${restApiLocation}/users-groups`,
        params,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`,
            }
        } 
    )
}

export const ModifyUserPasswordController = (name, zone, newPassword, restApiLocation) => {
    const params = new URLSearchParams({
        op: "set_password",
        name: name,
        zone: zone,
        "new-password": newPassword
    })
    return axios.post(
        `${restApiLocation}/users-groups`,
        params,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`
            }
        }
    )
}

export const ModifyUserTypeController = (name, zone, newUserType, restApiLocation) => {
    const params = new URLSearchParams({
        op: "set_user_type",
        name: name,
        zone: zone,
        "new-user-type": newUserType
    })
    return axios.post(
        `${restApiLocation}/users-groups`,
        params,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`
            }
        }
    )
}


export const RemoveUserController = async (name, zone, restApiLocation) => {
    const params = new URLSearchParams({
        op: "remove_user",
        name: name,
        zone: zone
    })
    return axios.post(
        `${restApiLocation}/users-groups`,
        params,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`
            }
        }
    )
}
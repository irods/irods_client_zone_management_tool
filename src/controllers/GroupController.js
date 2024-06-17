import axios from 'axios';

export const AddGroupController = (name, restApiLocation) => {
    const params = new URLSearchParams({
        op: "create_group",
        name: name,
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

export const RemoveGroupController = async (name, restApiLocation) => {
    const params = new URLSearchParams({
        op: "remove_group",
        name: name,
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

export const AddUserToGroupController = (user, zone, group, restApiLocation) => {
    const params = new URLSearchParams({
        op: 'add_to_group',
        user: user,
        zone: zone,
        group: group,
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

export const RemoveUserFromGroupController = (user, zone, group, restApiLocation) => {
    const params = new URLSearchParams({
        op: 'remove_from_group',
        user: user,
        zone: zone,
        group: group,
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


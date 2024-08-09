import axios from 'axios';

export const AddGroupController = (name, httpApiLocation) => {
    const params = new URLSearchParams({
        op: "create_group",
        name: name,
    });

    return axios.post(
        `${httpApiLocation}/users-groups`,
        params,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`,
            }
        } 
    )
}

export const RemoveGroupController = async (name, httpApiLocation) => {
    const params = new URLSearchParams({
        op: "remove_group",
        name: name,
    });

    return axios.post(
        `${httpApiLocation}/users-groups`,
        params,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`,
            }
        } 
    )
}

export const AddUserToGroupController = (user, zone, group, httpApiLocation) => {
    const params = new URLSearchParams({
        op: 'add_to_group',
        user: user,
        zone: zone,
        group: group,
    });

    return axios.post(
        `${httpApiLocation}/users-groups`,
        params,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`,
            }
        } 
    )
}

export const RemoveUserFromGroupController = (user, zone, group, httpApiLocation) => {
    const params = new URLSearchParams({
        op: 'remove_from_group',
        user: user,
        zone: zone,
        group: group,
    });

    return axios.post(
        `${httpApiLocation}/users-groups`,
        params,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`,
            }
        } 
    )
}


import axios from 'axios';

export const AddGroupController = (name, restApiLocation) => {
    return axios({
        method: 'POST',
        url: `${restApiLocation}/users-groups`,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`
        },
        params: {
            op: 'create_group',
            name: name,
        }
    })
}

export const RemoveGroupController = async (name, restApiLocation) => {
    return axios({
        method: 'POST',
        url: `${restApiLocation}/users-groups`,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`
        },
        params: {
            op: "remove_group",
            name: name,
        }
    })
}

export const AddUserToGroupController = (user, zone, group, restApiLocation) => {
    return axios({
        method: 'POST',
        url: `${restApiLocation}/users-groups`,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`
        },
        params: {
            op: 'add_to_group',
            user: user,
            zone: zone,
            group: group,
        }
    })
}

export const RemoveUserFromGroupController = (user, zone, group, restApiLocation) => {
    return axios({
        method: 'POST',
        url: `${restApiLocation}/users-groups`,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`
        },
        params: {
            op: 'remove_from_group',
            user: user,
            zone: zone,
            group: group,
        }
    })
}


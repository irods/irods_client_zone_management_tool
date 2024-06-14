import axios from 'axios';

export const AddResourceController = (name, type, host, vaultPath, restApiLocation) => {
    return axios({
        method: 'POST',
        url: `${restApiLocation}/resources`,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`
        },
        params: {
            op: 'create',
            name: name,
            type: type,
            host: host,
            "vault-path": vaultPath,
        }
    })
}

//Not seeing anything for modifying resources in the docs, not implemented yet probably
export const ModifyResourceController = (name, arg, value, restApiLocation) => {
    return null;
}


export const RemoveResourceController = async (name, restApiLocation) => {
    return axios({
        method: 'POST',
        url: `${restApiLocation}/resources`,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`
        },
        params: {
            op: "remove",
            name: name
        }
    })
}

export const AddChildResourceController = async (parent, child, restApiLocation, parent_context_string) => {
    return axios({
        method: 'POST',
        url: `${restApiLocation}/resources`,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`
        },
        params: {
            action: 'add_child',
            "parent-name": parent,
            "child-name": child,
            context: parent_context_string
        }
    })
}

export const RemoveChildResourceController = async (parent, child, restApiLocation) => {
    return axios({
        method: 'POST',
        url: `${restApiLocation}/resources`,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`
        },
        params: {
            action: 'remove_child',
            "parent-name": parent,
            "child-name": child,
        }
    })
}

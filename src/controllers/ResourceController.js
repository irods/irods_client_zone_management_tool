import axios from 'axios';

export const AddResourceController = (name, type, host, vaultPath, restApiLocation) => {
    const params = new URLSearchParams({
        op: 'create',
        name: name,
        type: type,
        host: host,
        "vault-path": vaultPath,
    });

    return axios.post(
        `${restApiLocation}/resources`,
        params,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`,
            }
        } 
    )
}

//Not seeing anything for modifying resources in the docs, not implemented yet probably
export const ModifyResourceController = (name, arg, value, restApiLocation) => {
    return null;
}


export const RemoveResourceController = async (name, restApiLocation) => {
    const params = new URLSearchParams({
        op: "remove",
        name: name
    });

    return axios.post(
        `${restApiLocation}/resources`,
        params,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`,
            }
        } 
    )
}

export const AddChildResourceController = async (parent, child, restApiLocation, parent_context_string) => {
    const params = new URLSearchParams({
        action: 'add_child',
        "parent-name": parent,
        "child-name": child,
        context: parent_context_string
    });

    return axios.post(
        `${restApiLocation}/resources`,
        params,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`,
            }
        } 
    )
}

export const RemoveChildResourceController = async (parent, child, restApiLocation) => {
    const params = new URLSearchParams({
        action: 'remove_child',
        "parent-name": parent,
        "child-name": child,
    });

    return axios.post(
        `${restApiLocation}/resources`,
        params,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`,
            }
        } 
    )
}

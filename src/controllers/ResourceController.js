import axios from 'axios';

export const AddResourceController = (name, type, host, vaultPath, httpApiLocation) => {
    const params = new URLSearchParams({
        op: 'create',
        name: name,
        type: type,
        host: host,
        "vault-path": vaultPath,
    });

    return axios.post(
        `${httpApiLocation}/resources`,
        params,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`,
            }
        } 
    );
};

//Not seeing anything for modifying resources in the docs, not implemented yet probably
export const ModifyResourceController = (name, arg, value, httpApiLocation) => {
    const params = new URLSearchParams({
        op: "modify",
        name: name,
        property: arg,
        value: value
    });

    return axios.post(
        `${httpApiLocation}/resources`,
        params,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`,
            }
        } 
    );
};


export const RemoveResourceController = async (name, httpApiLocation) => {
    const params = new URLSearchParams({
        op: "remove",
        name: name
    });

    return axios.post(
        `${httpApiLocation}/resources`,
        params,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`,
            }
        } 
    );
};

export const AddChildResourceController = async (parent, child, httpApiLocation, parent_context_string) => {
    const params = new URLSearchParams({
        action: 'add_child',
        "parent-name": parent,
        "child-name": child,
        context: parent_context_string
    });

    return axios.post(
        `${httpApiLocation}/resources`,
        params,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`,
            }
        } 
    );
};

export const RemoveChildResourceController = async (parent, child, httpApiLocation) => {
    const params = new URLSearchParams({
        action: 'remove_child',
        "parent-name": parent,
        "child-name": child,
    });

    return axios.post(
        `${httpApiLocation}/resources`,
        params,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`,
            }
        } 
    );
};

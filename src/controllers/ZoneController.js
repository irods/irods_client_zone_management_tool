import axios from 'axios'

export const AddZoneController = (name, type, location, comment, restApiLocation) => {
	const params = new URLSearchParams({
		op: "add",
		name: name,
		"connection-info": location,
		comment: comment
	});
	return axios.post(`${restApiLocation}/zones`, params, {
		headers: {
			Authorization: `Bearer ${localStorage.getItem("zmt-token")}`,
		},
	});
};

export const DeleteZoneController = (name, restApiLocation) => {
	const params = new URLSearchParams({
		op: "remove",
		name: name,
	});
	return axios.post(`${restApiLocation}/zones`, params, {
		headers: {
			Authorization: `Bearer ${localStorage.getItem("zmt-token")}`,
		},
	});
};

export const ModifyZoneController = (name, target, value, restApiLocation) => {
    const params = new URLSearchParams({
		op: "modify",
		name: name,
        property: target,
        value: value
	});
	return axios.post(`${restApiLocation}/zones`, params, {
		headers: {
			Authorization: `Bearer ${localStorage.getItem("zmt-token")}`,
		},
	});
}

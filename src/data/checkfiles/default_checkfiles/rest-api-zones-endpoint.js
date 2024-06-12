import axios from "axios";

export default {
	name: "iRODS Client REST API - /zones endpoint",
	description: `Checks ${process.env.REACT_APP_REST_API_URL}/zones for non-5xx.`,
	minimum_server_version: "4.2.0",
	maximum_server_version: "",
	interval_in_seconds: 300,
	active: true,
	checker: async function () {
		let result = {
			status: "",
			message: "",
		};
		await axios({
			url: `${this.restApiLocation}/zones`,
			method: "GET",
			headers: {
				Authorization: `Bearer ${localStorage.getItem("zmt-token")}`,
			},
			params: {
				op: "report",
			},
		}).then((res) => {
			if (!res.data || !res.data.zone_report || res.status >= 500) {
				result.status = "error";
				result.message = "/zones endpoint is down.";
			} else {
				result.status = "healthy";
				result.message = "/zones endpoint is running normally.";
			}
		});
		// console.log(result);
		return result;
	},
};

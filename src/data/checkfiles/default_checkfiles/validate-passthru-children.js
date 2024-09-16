import React from "react";
import { Link } from "react-router-dom";

export default {
	name: "Each passthru resource has exactly one child",
	description: "Checks if each passthru resource has exactly one child.",
	minimum_server_version: "4.2.0",
	maximum_server_version: "",
	interval_in_seconds: 86400,
	active: true,
	checker: function () {
		const result = {
			status: "",
			message: "",
			success: 0,
			failed: [],
		};

		// get the ids of all passthru resources, along with some other information: [name, zone, id, numChildren]
		const passThruRescIds = this.rescAll.rows
			.filter((resc) => resc[1] === "passthru")
			.map((resc) => [resc[0], resc[2], resc[11], 0]);

		this.rescAll.rows.forEach((resc) => {
			const parentId = resc[10];

			if (parentId) {
				const parentResc = passThruRescIds.find(
					(resc) => resc[2] === parentId
				); // find the parent resource in the list of passthru resources
				if (parentResc) {
					parentResc[3] += 1; // increment the number of children on the parent passthru resource
				}
			}
		});

		// find all passthru resources that do not have exactly one child
		passThruRescIds.forEach((resc) => {
			if (resc[3] !== 1) {
				result.failed.push(resc);
			}
		});

		result.status = result.failed.length > 0 ? "error" : "healthy";

		if (result.failed.length > 0) {
			result.message = (
				<span>
					The following passthru resources have either 0 or more than
					1 children:{" "}
					{result.failed.map((resc, index) => (
						<span key={index}>
							{index !== 0 && ", "}
							<Link to={`/resources?filter=${resc[0]}`}>
								{resc[0]}:{resc[1]}
							</Link>{" "}
							({resc[3]} children)
						</span>
					))}
				</span>
			);
		} else {
			result.message = "All passthru resources have exactly one child.";
		}

		return result;
	},
};

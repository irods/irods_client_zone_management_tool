import React from "react";
import { Link } from "react-router-dom";

export default {
	name: "Storage resources have no children",
	description: `Checks if all storage resources (unixfilesystem, univmss, s3) have no children`,
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

		const storageResources = ["unixfilesystem", "univmss", "s3"];
		const parentResourceIds = new Set(); // resources with children

		this.rescAll.rows.forEach((resc) => {
			const parent = resc[10];

			if (parent) {
				parentResourceIds.add(parent);
			}
		});

		// loop through parentResourceIds and check if any are storage resources. if they are, add them to the failed result
		parentResourceIds.forEach((id) => {
			const resc = this.rescAll.rows.find((resc) => resc[11] === id);
			const name = resc[0];
			const type = resc[1];
			const zone = resc[2];

			if (storageResources.includes(type)) {
				result.failed.push([name, type, zone]);
			}
		});

		result.status = result.failed.length > 0 ? "error" : "healthy";
		result.message =
			result.failed.length > 0 ? (
				<span>
					<span>Failed on: </span>
					{result.failed.map((failedResc, index) => (
						<span key={`rescNameCheckFailed-${index}`}>
							{index !== 0 && ", "}
							<Link
								className="check_result_link"
								to={`/resources?filter=${encodeURIComponent(
									failedResc[0]
								)}`}
							>
								{failedResc[0]}:{failedResc[2]} ({failedResc[1]}
								)
							</Link>
						</span>
					))}
				</span>
			) : (
				"All storage resources have no children."
			);

		return result;
	},
};

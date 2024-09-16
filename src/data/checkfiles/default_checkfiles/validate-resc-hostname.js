import { Link } from "react-router-dom";
import React from "react";

export default {
	name: "Each resource has a valid hostname",
	description: "Checks if each resource hostname matches a known server",
	minimum_server_version: "4.2.0",
	maximum_server_version: "",
	interval_in_seconds: 3600,
	active: true,
	checker: function () {
		const result = {
			status: "",
			message: "",
			success: 0,
			failed: [],
		};
		this.rescAll.rows.forEach((resc) =>
			this.validServerHosts.has(resc[4])
				? result.success++
				: result.failed.push(resc)
		);
		result.status = result.failed.length === 0 ? "healthy" : "warning";
		result.message =
			result.status === "warning" ? (
				<span>
					<span>Failed on: </span>
					{result.failed.map((failedResc, index) => (
						<span key={`rescCheckFailed-${index}`}>
							{index !== 0 && ", "}
							<Link
								className="check_result_link"
								to={`/resources?filter=${encodeURIComponent(
									failedResc[0]
								)}`}
							>{`${failedResc[0]}:${failedResc[1]}`}</Link>{" "}
							({failedResc[4]})
						</span>
					))}
				</span>
			) : (
				"All resources have a valid hostname."
			);
		return result;
	},
};

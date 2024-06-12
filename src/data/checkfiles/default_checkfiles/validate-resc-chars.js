import React from "react";
import { Link } from "@reach/router";

export default {
	name: "Resources have valid names",
	description: `Checks if the length of each resource is between 1 and 63 characters, starts and ends with a word character, and does not contain consecutive dashes.`,
	minimum_server_version: "4.2.0",
	maximum_server_version: "",
	interval_in_seconds: 3600,
	active: true,
	checker: function () {
		let result = {
			status: "",
			message: "",
			success: 0,
			failed: [],
		};

		// regex taken from `irods/plugins/database/src/db_plugin.cpp`: https://github.com/irods/irods/blob/1c360003aea23c9bb80025c3c62dc7a0cef29524/plugins/database/src/db_plugin.cpp#LL684C23-L684C49

		const regex = /^(?=.{1,63}$)\w+(-\w+)*$/;

		this.rescAll.rows.forEach((resc) => {
			if (regex.test(resc[0])) {
				result.success += 1;
			} else {
				result.failed.push(resc[0]);
			}
		});
		result.status = result.failed.length > 0 ? "warning" : "healthy";
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
									failedResc
								)}`}
							>
								{failedResc}
							</Link>
						</span>
					))}
				</span>
			) : (
				"All resource names have a valid name."
			);
		return result;
	},
};

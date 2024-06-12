import { Link } from "@reach/router";
import React from "react";
import { Tooltip } from "@material-ui/core";

const minimum_size_in_gb = 10;

export default {
	name: `unixfilesystem resources have at least ${minimum_size_in_gb} GB of free space`,
	description: `Checks if all unixfilesystem resources have at least ${minimum_size_in_gb} GB of free space`,
	minimum_server_version: "4.2.0",
	maximum_server_version: "",
	interval_in_seconds: 86400,
	active: true,
	checker: function () {
		let result = {
			status: "",
			message: "",
			success: 0,
			failed: [],
		};

		const digitRegex = /^\d+$/;
		let invalidSpaceRescs = [];
		let notEnoughSpaceRescs = [];

		this.rescAll.rows.forEach((resc) => {
			const type = resc[1];

			if (type !== "unixfilesystem") {
				return;
			}

			const name = resc[0];
			const zone = resc[2];
			const freeSpaceInBytes = resc[6];

			const parsedFreeSpaceInBytes = parseInt(freeSpaceInBytes, 10);

			console.log(
				`freeSpaceInBytes: ${freeSpaceInBytes}`,
				`parsedFreeSpaceInBytes: ${parsedFreeSpaceInBytes}`
			);
			if (
				!digitRegex.test(freeSpaceInBytes) ||
				isNaN(parsedFreeSpaceInBytes)
			) {
				invalidSpaceRescs.push([name, zone, freeSpaceInBytes]);
				return;
			}

			const freeSpaceInGB = freeSpaceInBytes / 1024 / 1024 / 1024;

			console.log(`freeSpaceInGB: ${freeSpaceInGB}`);

			if (freeSpaceInGB < minimum_size_in_gb) {
				notEnoughSpaceRescs.push([
					name,
					zone,
					freeSpaceInBytes,
					freeSpaceInGB.toFixed(1),
				]);
				return;
			}
		});

		result.status =
			invalidSpaceRescs.length > 0 || notEnoughSpaceRescs.length > 0
				? "warning"
				: "healthy";
		result.message = [];

		if (invalidSpaceRescs.length > 0) {
			result.message.push(
				<span key="invalidSpaceRescs">
					<span>
						These resources have invalid free space values:{" "}
					</span>
					{invalidSpaceRescs.map((failedResc, index) => (
						<span key={`invalidSpaceRescs-${index}`}>
							{index !== 0 && ", "}
							<Link
								className="check_result_link"
								to={`/resources?filter=${encodeURIComponent(
									failedResc[0]
								)}`}
							>
								{failedResc[0]}:{failedResc[1]}
							</Link>{" "}
							(&ldquo;{failedResc[2]}&ldquo;)
						</span>
					))}
				</span>
			);
		}

		if (notEnoughSpaceRescs.length > 0) {
			result.message.push(
				<span key="notEnoughSpaceRescs">
					<span>
						{result.message.length != 0 && ". "}These resources have
						less than {minimum_size_in_gb} GB of free space:{" "}
					</span>
					{notEnoughSpaceRescs.map((failedResc, index) => (
						<span key={`notEnoughSpaceRescs-${index}`}>
							{index !== 0 && ", "}
							<Link
								className="check_result_link"
								to={`/resources?filter=${encodeURIComponent(
									failedResc[0]
								)}`}
							>
								{failedResc[0]}:{failedResc[1]}
							</Link>{" "}
							<Tooltip
								title={`${failedResc[2]} bytes`}
								placement="top"
								arrow
							>
								<span>({failedResc[3]} GB)</span>
							</Tooltip>
						</span>
					))}
				</span>
			);
		}

		if (result.message.length === 0) {
			result.message = `All unixfilesystem resources have at least ${minimum_size_in_gb} GB of free space.`;
		}

		return result;
	},
};

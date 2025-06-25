import React from "react";
import { Link } from "react-router";

const check = {
  name: "Each resource has a valid name length",
  description: `Checks if the length of each resource is within 63 characters.`,
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
    this.rescAll.rows.forEach((resc) => {
      resc[0].length < 1 || resc[0].length > 63
        ? result.failed.push(resc[0])
        : (result.success += 1);
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
                to={`/resources?filter=${encodeURIComponent(failedResc)}`}
              >
                {failedResc}
              </Link>
            </span>
          ))}
        </span>
      ) : (
        "All resource names have a valid length."
      );
    return result;
  },
};

export default check;

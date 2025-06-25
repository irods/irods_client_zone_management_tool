import React from "react";
import { Link } from "react-router";

const check = {
  name: "Coordinating resources have at least one child",
  description: `Checks if all coordinating resources (deferred, random, passthru, load_balanced, replication, compound) have at least one child`,
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

    const coordResources = [
      "deferred",
      "random",
      "passthru",
      "load_balanced",
      "replication",
      "compound",
    ];
    const parentResourceIds = new Set(); // resources with children
    const coordResourceIds = []; // coordinating resource IDs

    this.rescAll.rows.forEach((resc) => {
      const name = resc[0];
      const type = resc[1];
      const zone = resc[2];
      const parent = resc[10];
      const id = resc[11];

      if (parent) {
        parentResourceIds.add(parent);
      } else if (coordResources.includes(type)) {
        coordResourceIds.push([id, name, type, zone]);
      }
    });

    // if any ids in coordResourceIds are not in parentResourceIds (they have no children), add them to the failed result
    coordResourceIds.forEach((coordResc) => {
      if (!parentResourceIds.has(coordResc[0])) {
        result.failed.push(coordResc);
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
                to={`/resources?filter=${encodeURIComponent(failedResc[1])}`}
              >
                {failedResc[1]}:{failedResc[3]} ({failedResc[2]})
              </Link>
            </span>
          ))}
        </span>
      ) : (
        "All coordinating resources have at least one child."
      );

    return result;
  },
};

export default check;

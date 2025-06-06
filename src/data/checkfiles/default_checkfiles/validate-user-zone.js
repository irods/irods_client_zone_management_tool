import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const check = {
  name: "Each user is in a valid zone",
  description: `Checks if any users belong to invalid zones.`,
  minimum_server_version: "4.2.0",
  maximum_server_version: "",
  interval_in_seconds: 86400,
  active: true,
  checker: async function () {
    const result = {
      status: "",
      message: [],
      success: 0,
      failed: [],
    };

    const authToken = localStorage.getItem("zmt-token");
    let warningAboutSpecificQuery = false;
    const specificQuery =
      "SELECT user_name, zone_name FROM R_USER_MAIN WHERE zone_name NOT IN (SELECT zone_name FROM R_ZONE_MAIN)";
    let resultsArr = [];

    const resp = await axios({
      url: `${this.httpApiLocation}/query`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      params: {
        op: "execute_specific_query",
        name: specificQuery,
        count: 0, // 0 = return all results
        offset: 0,
      },
    }).catch((e) => {
      if (!e.response || e.response.status === 400) {
        warningAboutSpecificQuery = true;
      }
    });

    if (resp)
      if (
        resp &&
        resp.data &&
        resp.data.irods_response &&
        resp.data.irods_response.status_code === 0 &&
        resp.data.rows
      ) {
        resultsArr = resp.data.rows;
        if (resultsArr.length > 0) {
          resultsArr.map((user) => {
            result.failed.push([user[0], user[1]]);
          });
        }
      } else {
        warningAboutSpecificQuery = true;

        const generalQuery1 =
          "SELECT USER_NAME, USER_ZONE WHERE USER_TYPE != 'rodsgroup'";

        const resp1 = await axios({
          url: `${this.httpApiLocation}/query`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          params: {
            op: "execute_genquery",
            query: generalQuery1,
            count: 0, // 0 = return all results
            offset: 0,
          },
        });

        const generalQuery2 = "SELECT ZONE_NAME";

        const resp2 = await axios({
          url: `${this.httpApiLocation}/query`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          params: {
            op: "execute_genquery",
            query: generalQuery2,
            count: 0, // 0 = return all results
            offset: 0,
          },
        });

        if (resp1 && resp1.data && resp2 && resp2.data) {
          resp1.data.rows.map((user) => {
            for (let i = 0; i < resp2.data.rows.length; i++) {
              if (user[1] === resp2.data.rows[i][0]) {
                return;
              }
            }
            result.failed.push([user[0], user[1]]);
          });
        }
      }

    result.status = result.failed.length > 0 ? "error" : "healthy";

    if (result.failed.length > 0) {
      const pushed = (
        <span key="push1">
          <span>Failed on: </span>
          {result.failed.map((failedUser, index) => (
            <span key={`userNameCheckFailed-${index}`}>
              {index !== 0 && ", "}
              <Link
                className="check_result_link"
                key={`userNameCheckFailed-${index}`}
                to={`/users?filter=${encodeURIComponent(failedUser[0])}`}
              >
                {failedUser[0]}
              </Link>{" "}
              ({failedUser[1]})
            </span>
          ))}
        </span>
      );

      result.message.push(pushed);
    } else {
      result.message.push(
        <span key="push0">All users are in valid zones</span>,
      );
    }

    if (warningAboutSpecificQuery) {
      result.message.push(
        <span key="push2">
          . Additionally, please define the specific query:"{specificQuery}"
          <div label={specificQuery} /> manually, or by using this{" "}
          <a
            rel="noreferrer"
            target="_blank"
            href={`/specific-query?sqlStr=${encodeURIComponent(
              specificQuery,
            )}&alias=usersInvalidZone`}
          >
            dynamically generated link
          </a>{" "}
          to get faster results.
        </span>,
      );

      if (result.status === "healthy") {
        result.status = "warning";
      }
    }

    return result;
  },
};

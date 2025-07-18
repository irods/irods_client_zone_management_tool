import React from "react";
import axios from "axios";

const AVUThresholdBeforeWarningForNoSpecificQuery = 100000;

const check = {
  name: "All metadata is used",
  description: `Checks if every piece of metadata is associated with a user, resource, data object, or collection. If there are more than ${AVUThresholdBeforeWarningForNoSpecificQuery} metadata entries, this check will require you to add a specific query.`,
  minimum_server_version: "4.2.0",
  maximum_server_version: "",
  interval_in_seconds: 604800,
  active: true,
  checker: async function () {
    const result = {
      status: "",
      message: "",
      success: 0,
      failed: [],
    };

    let totalMeta = 0; // represents all metadata in the system (not just the ones that are used)
    let numUnusedMeta = 0; // represents the number of metadata that is not used (not associated with a user, resource, data object, or collection)

    const specificQuery =
      "SELECT count(unused.*) FROM (select meta_id from R_META_MAIN except select meta_id from R_OBJT_METAMAP) unused";
    let specificWarning = false;

    const authToken = localStorage.getItem("zmt-token");

    const specificResp = await axios({
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
    }).catch(() => {
      specificWarning = true;
    });

    if (specificResp && specificResp.data && specificResp.data.rows) {
      // specific query succeeded, so we can use the result
      numUnusedMeta = specificResp.data.rows[0][0];
    } else {
      specificWarning = true;
      // specific query failed; first perform a check to see how many total metadata entries there are
      const totalMetaQuery = "SELECT COUNT(META_DATA_ATTR_ID)";

      const totalMetaResp = await axios({
        url: `${this.httpApiLocation}/query`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        params: {
          op: "execute_genquery",
          query: totalMetaQuery,
          count: 0, // 0 = return all results
          offset: 0,
          "case-sensitive": 0,
        },
      }).catch(() => {});

      if (
        totalMetaResp &&
        totalMetaResp.data &&
        totalMetaResp.data.irods_response &&
        totalMetaResp.data.irods_response.status_code === 0 &&
        totalMetaResp.data.rows
      ) {
        totalMeta = parseInt(totalMetaResp.data.rows[0][0]);
      }

      if (totalMeta > AVUThresholdBeforeWarningForNoSpecificQuery) {
        // if there are more than `AVUThresholdBeforeWarningForNoSpecificQuery` metadata entries, the genqueries below will take too long to run,
        // so we just return a warning
        result.message = [
          <span key="unusedMeta1">
            There are {totalMeta} total metadata entries in the system. This
            check did not fully run because there are many metadata entries. For
            this check to run, please add the specific query: "{specificQuery}"
            either manually, or by using this{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href={`/specific-query?sqlStr=${encodeURIComponent(
                specificQuery,
              )}&alias=unusedMetadata`}
            >
              dynamically generated link
            </a>
            .
          </span>,
        ];
        result.status = "warning";
        return result;
      }

      const getMeta = async (query) => {
        // returns a set of metadata
        const resp = await axios({
          url: `${this.httpApiLocation}/query`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          params: {
            op: "execute_genquery",
            query: query,
            count: 0, // 0 = return all results
            offset: 0,
            "case-sensitive": 0,
          },
        }).catch(() => {});

        const useSet = new Set();
        if (resp && resp.data && resp.data.rows) {
          // console.log(resp.data.rows);
          // turn the ids of the metadata into a set
          resp.data.rows.forEach((row) => {
            useSet.add(row[0]);
          });
        }
        // console.log(useSet);
        return useSet;
      };

      // in iRODS, all metadata is associated with either a user, resource, data object, or collection
      // thus, we use 4 queries to get all metadata associated with each of these 4 entities (USER, RESC, DATA, COLL)

      const userMetaQuery = "SELECT META_USER_ATTR_ID, USER_ID";
      const userMetaSet = await getMeta(userMetaQuery);

      const dataObjMetaQuery = "SELECT META_DATA_ATTR_ID, DATA_ID";
      const dataObjMetaSet = await getMeta(dataObjMetaQuery);

      const rescMetaQuery = "SELECT META_RESC_ATTR_ID, RESC_ID";
      const rescMetaSet = await getMeta(rescMetaQuery);

      const collMetaQuery = "SELECT META_COLL_ATTR_ID, COLL_ID";
      const collMetaSet = await getMeta(collMetaQuery);

      numUnusedMeta =
        totalMeta -
        userMetaSet.size -
        dataObjMetaSet.size -
        rescMetaSet.size -
        collMetaSet.size;
    }

    result.message = [];

    if (numUnusedMeta > 0) {
      result.message.push(
        <span key="unusedMeta1">
          There {numUnusedMeta === 1 ? "is" : "are"} {numUnusedMeta} unused
          metadata.
        </span>,
      );
    } else {
      result.message.push(<span key="unusedMeta2">All metadata is used.</span>);
    }

    result.status =
      numUnusedMeta > 0 || specificWarning ? "warning" : "healthy";

    if (specificWarning) {
      result.message.push(
        <span key="unusedMeta3">
          {" "}
          Additionally, to make this check faster, please add this specific
          query: "{specificQuery}" either manually, or by using this{" "}
          <a
            rel="noreferrer"
            target="_blank"
            href={`/specific-query?sqlStr=${encodeURIComponent(
              specificQuery,
            )}&alias=unusedMetadata`}
          >
            dynamically generated link
          </a>
          .
        </span>,
      );
    }

    return result;
  },
};

export default check;

import axios from "axios";

export const AddSpecificQueryController = (alias, sqlStr, httpApiLocation) => {
  const params = new URLSearchParams({
    op: "add_specific_query",
    name: alias,
    sql: sqlStr,
  });

  return axios.post(`${httpApiLocation}/query`, params, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("zmt-token")}`,
    },
  });
};

export const DeleteSpecificQueryController = (alias, httpApiLocation) => {
  const params = new URLSearchParams({
    op: "remove_specific_query",
    name: alias,
  });

  return axios.post(`${httpApiLocation}/query`, params, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("zmt-token")}`,
    },
  });
};


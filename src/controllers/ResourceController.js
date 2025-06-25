import axios from "axios";

export const AddResourceController = (
  name,
  type,
  host,
  vaultPath,
  httpApiLocation,
) => {
  const params = new URLSearchParams({
    op: "create",
    name,
    type,
    host,
    "vault-path": vaultPath,
  });

  return axios.post(`${httpApiLocation}/resources`, params, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("zmt-token")}`,
    },
  });
};

//Not seeing anything for modifying resources in the docs, not implemented yet probably
export const ModifyResourceController = (name, arg, value, httpApiLocation) => {
  const params = new URLSearchParams({
    op: "modify",
    name,
    property: arg,
    value,
  });

  return axios.post(`${httpApiLocation}/resources`, params, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("zmt-token")}`,
    },
  });
};

export const RemoveResourceController = async (name, httpApiLocation) => {
  const params = new URLSearchParams({
    op: "remove",
    name,
  });

  return axios.post(`${httpApiLocation}/resources`, params, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("zmt-token")}`,
    },
  });
};

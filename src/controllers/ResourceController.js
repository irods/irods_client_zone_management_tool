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
    name: name,
    type: type,
    host: host,
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
    name: name,
    property: arg,
    value: value,
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
    name: name,
  });

  return axios.post(`${httpApiLocation}/resources`, params, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("zmt-token")}`,
    },
  });
};

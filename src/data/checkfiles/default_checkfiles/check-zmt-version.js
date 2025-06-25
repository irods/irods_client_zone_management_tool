import axios from "axios";

const check = {
  name: "ZMT is running the latest version",
  description: "Checks if ZMT is running the latest version",
  minimum_server_version: "4.2.0",
  maximum_server_version: "",
  interval_in_seconds: 3600,
  active: true,
  checker: async () => {
    const latestTag = await axios.get(
      "https://api.github.com/repos/irods/irods_client_zone_management_tool/releases/latest",
    );
    return {
      status:
        latestTag.data.tag_name === process.env.REACT_APP_VERSION
          ? "healthy"
          : "warning",
      message:
        latestTag.data.tag_name === process.env.REACT_APP_VERSION
          ? `ZMT is running the latest version ${latestTag.data.tag_name}.`
          : `Latest ZMT version is ${latestTag.data.tag_name}, yours is ${process.env.REACT_APP_VERSION}`,
    };
  },
};

export default check;

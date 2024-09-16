export default {
    name: "template",
    description: "template",
    minimum_server_version: "", // optional
    maximum_server_version: "", // optional
    interval_in_seconds: 1,
    active: true,
    checker: function () {
        // default result object
        return {
            status: 'healthy', // <healthy, warning, error>
            message: '',
            success: 0, // optional
            failed: [] // optional
        };
    }
};
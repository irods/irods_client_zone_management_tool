export const checkfile_template = {
    name: "",
    description: "",
    minimum_server_version: "", // optional
    maximum_server_version: "", // optional
    interval_in_seconds: "",
    active: true,
    checker: function() {
        // @returns{object} {
        //   status: '<ok,unexpected,warning,bad>',
        //   message: 'message that will be displayed on homepage'
        // }
    
        // your code here
    }
}
/
 - / -> forwards either to /login or /dashboard
 - /logout -> logs out user -> /
 - /login -> / or whatever URL they had attempted while logged out

/dashboard
 - shows overview / totals / stats / health / latency maps / etc
 - can be pretty bare for now, we'll learn more

/servers
 - start with table view?
   - hostname
   - role
   - number of resources
 - control plane operations
   - /server/pause
   - /server/resume
   - /server/stop
 - configuration management
   - /server/configuration
   - /server/configuration/add
   - /server/configuration/update

/resources
 - maybe two views (because showing them together is hard/impossible?)...
 - logical tree view
   - https://docs.irods.org/4.2.8/plugins/composable_resources/
   - ability to edit the tree
     - add to parent, remove from parent
 - physical - just a table view - grouped by server?
 - /resource/create
 - /resource/remove
 - /resource/update
   - name, type, host, path, status, comment, info, free_space, context_string
 - /resource/rebalance

/users
 - similar to metalnx
 - listing of users
 - create, manage password, add/remove from groups, delete

/groups
 - similar to metalnx
 - listing of groups
 - /group/create
 - /group/delete
 - /group/add_user
 - /group/remove_user
 - cannot rename a group

/tickets
 - listing
 - /ticket/delete

/delay_queue
 - listing
 - /delay_queue/delete
 - /delay_queue/delete_all

/policy
 - eventually will show and edit policy/policies
 - rule execution, pool, can run a single one, with inputs...
 - rule engine plugins
 - perhaps with versioning
 - perhaps in a pool... to be deployed to particular servers
 - but this can all come later, we don't know yet


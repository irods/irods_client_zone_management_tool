import { validateRescHostname } from './validate-resc-hostname'
import { checkZMTVersion } from './check-zmt-version'
import { restApiAdminEndpoint } from './rest-api-admin-endpoint'
import { restApiAuthEndpoint } from './rest-api-auth-endpoint'
import { restApiQueryEndpoint } from './rest-api-query-endpoint'
import { restApiZoneReportEndpoint } from './rest-api-zone_report-endpoint'

// TODO
// 1. see if we can only import file in the context provider and not using index.js

export const defaultChecks = [
    checkZMTVersion,
    restApiAdminEndpoint,
    restApiAuthEndpoint,
    restApiQueryEndpoint,
    restApiZoneReportEndpoint,
    validateRescHostname
]
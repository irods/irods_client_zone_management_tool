import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useEnvironment, useServer } from '.';
import { defaultChecks } from '../data/checkfiles/default_checkfiles';
import { customChecks } from '../data/checkfiles/custom_checkfiles';
import { irodsVersionComparator } from '../utils';

// zmt, before running any check, will validate all health checks following these rules:
// 1. check's name is a non-empty string
// 2. description is a non-empty string
// 3. interval_in_seconds is a positive value
// 4. checker function is defined
// 5. minimum_server_version is smaller than maximum_server_version (if minimum_server_version and maximum_server_version are specified)
// 6. active is a boolean

const validateChecks = (checks) => {
    return checks.reduce((acc, curr) => {
        const state = {
            isValid: true,
        };
 
        const assert_checkfile_precondition = (state, precondition) => {
            if (!precondition) {
               state.isValid = false;
            }
        };

        // `name` exists and is a string
        assert_checkfile_precondition(state, curr.name && typeof curr.name === 'string');
        // `description` exists and is a string
        assert_checkfile_precondition(state, curr.description && typeof curr.description === 'string');
        // `interval_in_seconds` exists and is a positive number
        assert_checkfile_precondition(state, curr.interval_in_seconds && typeof curr.interval_in_seconds === 'number' && curr.interval_in_seconds > 0);
        // `checker` function exists and is a function
        assert_checkfile_precondition(state, curr.checker && typeof curr.checker === 'function');
        // either a `minimum_server_version` doesn't exist, or it is a string
        assert_checkfile_precondition(state, !(curr.minimum_server_version) || typeof curr.minimum_server_version === 'string'); 
        // either a `maximum_server_version` doesn't exist, or it is a string
        assert_checkfile_precondition(state, !(curr.maximum_server_version) || typeof curr.maximum_server_version === 'string');
        // if both a min and max version are in the file, then a max version must be greater than or equal to a min version
        assert_checkfile_precondition(state, !(curr.minimum_server_version) || !(curr.maximum_server_version) || irodsVersionComparator(curr.maximum_server_version,curr.minimum_server_version) >= 0);
        // `active` exists and is a boolean
        assert_checkfile_precondition(state, !('active' in curr) || typeof curr.active === 'boolean');

        curr.isValid = state.isValid;
        acc.push(curr);
        return acc;
    }, []);
};

export const CheckContext = createContext({});

export const CheckProvider = ({ children }) => {
    const [isChecking, setIsChecking] = useState(false);
    const checks = validateChecks([...defaultChecks, ...customChecks]);
    const [checkObject, setCheckObject] = useState({});
    const [checkResults, setCheckResults] = useState({});
    const [checkIntervals, setCheckIntervals] = useState(localStorage.getItem('zmt-checkIntervals') ? JSON.parse(localStorage.getItem('zmt-checkIntervals')) : {});
    const [checkTimers, setCheckTimers] = useState({});
    const [statusResult, setStatusResult] = useState({});
    const { zoneContext, rescAll, serverVersions, isLoadingZoneContext, validServerHosts } = useServer();
    const { httpApiLocation, httpApiTimeout } = useEnvironment();
    const [timeStamp, setTimeStamp] = useState();
    const [inactiveChecks, setInactiveChecks] = useState(localStorage.getItem('zmt-inactiveChecks') ? new Set(JSON.parse(localStorage.getItem('zmt-inactiveChecks'))) : new Set(checks.reduce((prev, check, index) => {
        if (!check.active) {
            prev.push(`zmt-${index}`);
        }
        return prev;
    }, [])));

    // zmt context that can be accessed in a check file e.g., this.zoneContext
    const context = { rescAll, httpApiLocation, httpApiTimeout, validServerHosts, zoneContext };
    const callBackFn = useRef(null);

    useEffect(() => {
        const keys = Object.keys(statusResult);
        if (localStorage.getItem('zmt-token') && keys.length === 0 && zoneContext && zoneContext.length > 0 && !isChecking && !isLoadingZoneContext) {
            // run checks only when data loading is complete
            runAllCheck();
        }
    }, [zoneContext, rescAll, isLoadingZoneContext, isChecking, statusResult]);

    const checkServerVersion = (check) => {
        if ('minimum_server_version' in check && 'maximum_server_version' in check) {
            // compare min and max server version if specified in checkfile
            if (check['minimum_server_version'] !== '' && irodsVersionComparator(check['minimum_server_version'], serverVersions[0]) > 0) return serverVersions[0];
            if (check['maximum_server_version'] !== '' && irodsVersionComparator(check['maximum_server_version'], serverVersions[serverVersions.length - 1]) < 0) return serverVersions[serverVersions.length - 1];
            return true;
        }
    };

    const removePrevStatus = (check) => {
        const prevStatus = checkResults[check['id']][1]['status'];
        setStatusResult(prev => {
            prev[prevStatus] -= 1;
            prev['inactive'] += 1;
            return prev;
        });
        setCheckResults(prev => {
            prev[check['id']] = [check, { status: 'inactive', message: 'N/A', timestamp: 'N/A' }];
            return prev;
        });
        setTimeStamp(new Date());
    };

    const runOneCheck = async (check) => {
        const prevStatus = checkResults[check.id][1]['status'];
        let result = {};

        try {
            if (checkTimers[check.id]) {
                // reset timer if needed
                clearTimeout(checkTimers[check.id]);
            }
            // run check if server requirements are met
            if (checkServerVersion(check) === true) {
                result = await check.checker.apply(context);
                result.timestamp = new Date();
                if (!result.status || (result.status !== 'healthy' && result.status !== 'warning' && result.status !== 'error')) {
                    result = { status: 'error', message: `Error - this check returned an invalid result object.`, timestamp: new Date() };
                }
            } else {
                result = { status: 'unavailable', message: `This check is unavailable because the iRODS Server version (${checkServerVersion(check)}) is out of range (${check.minimum_server_version} - ${check.maximum_server_version}).`, timestamp: new Date() };
            }
        }
        catch (e) {
            console.error(e, e.stack);
            result = { status: 'error', message: 'Error when running the check.', timestamp: new Date() };
        }
        finally {
            setCheckResults((prev) => {
                prev[check.id] = [check, result];
                return prev;
            });
            setStatusResult((prev) => {
                prev[prevStatus] -= 1;
                prev[result.status] += 1;
                return prev;
            });

            const timerID = setTimeout(() => runOneCheck(check), 1000 * checkIntervals[check['id']]);

            setCheckTimers((prev) => {
                prev[check.id] = timerID;
                return prev;
            });
            setTimeStamp(new Date());
        }
    };

    const runAllCheck = () => {
        // before running all checks, reset all timers
        for (const key in checkTimers) {
            clearTimeout(checkTimers[key]);
        }
        setIsChecking(true);
        const newCheckResults = {};
        const newStatusResult = { 'error': 0, 'invalid': 0, 'warning': 0, 'healthy': 0, 'inactive': 0, 'unavailable': 0 };
        const newCheckObject = {};
        const newCheckTimers = {};
        const newCheckIntervals = {};
        // iterate through all checks
        checks.forEach((check, index) => {
            (async function () {
                check.id = `zmt-${index}`;
                newCheckObject[check['id']] = check;
                newCheckIntervals[check['id']] = check.id in checkIntervals ? checkIntervals[check.id] : ('interval_in_seconds' in check ? check['interval_in_seconds'] : 'N/A');
                // if the check is invalid
                if (!check.isValid) {
                    newStatusResult['invalid']++;
                    newCheckResults[check['id']] = [check, { status: 'invalid', message: `Checkfile is invalid.`, timestamp: new Date() }];
                }
                // if active, run the check
                else if (!inactiveChecks.has(`zmt-${index}`) && check.active) {
                    try {
                        // enforce minimum/maximum server version
                        if (checkServerVersion(check) === true) {
                            const value = await check.checker.apply(context);
                            if (!value.status || (value.status !== 'healthy' && value.status !== 'warning' && value.status !== 'error')) {
                                newStatusResult['error']++;
                                newCheckResults[check['id']] = [check, { status: 'error', message: `Error - this check returned an invalid result object.`, timestamp: new Date() }];
                            }
                            else {
                                value.timestamp = new Date();

                                newCheckTimers[check['id']] = setTimeout(() => callBackFn.current(check), 1000 * newCheckIntervals[check['id']]);
                                newCheckResults[check['id']] = [check, value];
                                newStatusResult[value.status]++;
                            }
                        } else {
                            newStatusResult['unavailable']++;
                            newCheckResults[check['id']] = [check, { status: 'unavailable', message: `This check is unavailable because the iRODS Server version (${checkServerVersion(check)}) is out of range (${check.minimum_server_version} - ${check.maximum_server_version}).`, timestamp: new Date() }];
                        }
                        // catch error if check function is not working correctly
                    } catch (e) {
                        newStatusResult['error']++;
                        newCheckResults[check['id']] = [check, { status: 'error', message: `Error - ${e.message}`, timestamp: new Date() }];
                    }
                } 
                // if the check is valid but inactive
                else {
                    newCheckResults[check['id']] = [check, { status: 'inactive', timestamp: 'N/A' }];
                    newStatusResult['inactive']++;
                }
                if (Object.keys(newCheckResults).length === checks.length) {
                    setCheckResults(newCheckResults);
                    setStatusResult(newStatusResult);
                    setCheckObject(newCheckObject);
                    setCheckTimers(newCheckTimers);
                    setCheckIntervals(newCheckIntervals);
                    setIsChecking(false);
                    setTimeStamp(new Date());
                }
            })();
        });
    };

    const modifyCheckInterval = (id, newInterval) => {
        // update intervals, run check again and reset timer
        setCheckIntervals((prev) => {
            prev[id] = Number(newInterval);
            localStorage.setItem('zmt-checkIntervals', JSON.stringify(prev));
            return prev;
        });
        runOneCheck(checkObject[id]);
    };

    const modifyCheckActivity = (id) => {
        const newSet = new Set(inactiveChecks);
        if (inactiveChecks.has(id)) {
            newSet.delete(id);
            runOneCheck(checkObject[id]);
        }
        else {
            // update check's status to 'inactive' and clear timeout
            clearTimeout(checkTimers[id]);
            const newCheckTimers = Object.assign({}, checkTimers);
            newCheckTimers[id] = null;
            setCheckTimers(newCheckTimers);
            newSet.add(id);
            removePrevStatus(checkObject[id]);
        }
        setInactiveChecks(newSet);
        localStorage.setItem('zmt-inactiveChecks', JSON.stringify([...newSet]));
    };

    useEffect(() => {
        // make the callback function gets access to the latest state
        callBackFn.current = runOneCheck;
    }, [timeStamp, runOneCheck]);

    return (
        <CheckContext.Provider value={{
            isChecking, checks, checkResults, checkIntervals, statusResult, checkObject, timeStamp,
            inactiveChecks, modifyCheckActivity, modifyCheckInterval,
            runOneCheck, runAllCheck
        }}>
            {children}
        </CheckContext.Provider>
    );
};

CheckProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export const useCheck = () => useContext(CheckContext);
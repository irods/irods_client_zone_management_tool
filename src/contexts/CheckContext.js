import React, { createContext, useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useEnvironment, useServer } from '.'
import { defaultChecks } from '../data/checkfiles/default_checkfiles'
import { customChecks } from '../data/checkfiles/custom_checkfiles'
// import { replacer } from '../utils'

export const CheckContext = createContext({})

export const CheckProvider = ({ children }) => {
    const [isChecking, setIsChecking] = useState(false)
    const [nextRunTimer, setNextRunTimer] = useState()
    const checks = [...defaultChecks, ...customChecks]
    const [checkObject, setCheckObject] = useState({})
    const [checkResult, setCheckResult] = useState(new Map())
    const [statusResult, setStatusResult] = useState({})
    const { zoneContext, rescAll } = useServer()
    const { restApiLocation, restApiTimeout } = useEnvironment()
    let context = { zoneContext, rescAll, restApiLocation, restApiTimeout }

    useEffect(() => {
        if (localStorage.getItem('zmt-token') && zoneContext.length !== 0 && !isChecking && checkResult.size === 0) {
            runAllCheck()
        }
    }, [context])

    const runOneCheck = async (check) => {
        let updatedMap = new Map(checkResult)
        let value = await check.checker.apply(context)
        value.timestamp = new Date()
        updatedMap.set(check.id, [check, value])
        setCheckResult(updatedMap)
    }

    const runAllCheck = () => {
        setIsChecking(true)
        let newMap = new Map()
        let newStatusResult = {}
        let newCheckObject = {}
        defaultChecks.forEach((check, index) => {
            (async function () {
                // catch error if check function is not working correctly
                try {
                    console.log('running check' + check.name)
                    check.id = `zmt-${index}`
                    let value = await check.checker.apply(context)
                    value.timestamp = new Date()
                    if (!newStatusResult[value.status]) newStatusResult[value.status] = 0
                    newMap.set(check['id'], [check, value])
                    newCheckObject[check['id']] = check
                    newStatusResult[value.status]++
                } catch (e) {
                    console.log(e)
                    newStatusResult['error']++
                    newMap.set(check['id'], [check, { status: 'error', timestamp: new Date() }])
                }
                if (newMap.size === checks.length) {

                    setCheckResult(newMap)
                    setStatusResult(newStatusResult)
                    setCheckObject(newCheckObject)
                    setIsChecking(false)
                }
            })()
        })

        // checks will run every 5 minutes by default
        setTimeout(() => runAllCheck(), 1000 * 60 * 5) // unit in milliseconds
        setNextRunTimer(new Date(Date.now() + 1000 * 60 * 5).toUTCString())
    }


    return (
        <CheckContext.Provider value={{
            isChecking, checks, checkResult, nextRunTimer, statusResult, checkObject,
            runOneCheck, runAllCheck
        }}>
            {children}
        </CheckContext.Provider>
    )
}

CheckProvider.propTypes = {
    children: PropTypes.node.isRequired
}

export const useCheck = () => useContext(CheckContext)
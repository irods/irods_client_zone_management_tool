import { importAll } from "../../../utils"

export const defaultChecks = importAll(require.context('./', false, /\.js$/)).reduce((checks, currCheck) => {
    if (Object.keys(currCheck).length === 1 && Object.keys(currCheck)[0] !== 'defaultChecks') {
        checks.push(currCheck[Object.keys(currCheck)[0]])
    }
    return checks
}, [])
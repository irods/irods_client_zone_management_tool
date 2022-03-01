import { importAll } from "../../../utils"

export const customChecks = importAll(require.context('./', false, /\.js$/)).reduce((checks, currCheck) => {
    if (Object.keys(currCheck).length === 1 && Object.keys(currCheck)[0] !== 'customChecks') {
        checks.push(currCheck[Object.keys(currCheck)[0]])
    }
    return checks
}, [])
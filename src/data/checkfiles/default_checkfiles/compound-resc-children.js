export const compoundRescChildren = {
    "name": "Each compound resource has two valid children",
    "description": `Checks if each compound resource has exactly one cache and one archive as children.`,
    "min_server_version": "4.2.0",
    "max_server_version": "4.2.10",
    "interval_in_seconds": 300,
    "active": true,
    "checker": function () {
        let result = {
            status: '',
            message: '',
            success: 0,
            failed: []
        }
        let compoundRescObj = this.rescAll._embedded.reduce((prev, curr) => {
            if(curr[1] === 'compound') prev[curr[11]] = { name: curr[0], children: { 'archive': 0, 'cache': 0}}
            return prev
        }, {})
        this.rescAll._embedded.forEach(resc => {
            if(resc[10] in compoundRescObj && (resc[12] === 'archive' || resc[12] === 'cache')){
                compoundRescObj[resc[10]].children[resc[12]] += 1
            }
        })
        for(let compoundRescID in compoundRescObj) {
            if(compoundRescObj[compoundRescID].children['archive'] === 1 && compoundRescObj[compoundRescID].children['cache'] === 1) result.success +=1
            else result.failed.push(compoundRescObj[compoundRescID].name)
        }
        result.status = result.failed.length > 0 ? 'warning' : 'healthy'
        result.message = result.failed.length > 0 ? `Failed on ${result.failed.join(', ')}.` : 'All compound resources have valid children.'
        return result
    }
}
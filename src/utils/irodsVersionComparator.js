// designed to compare different irods version (e.g. 4.2.10 > 4.2.8)
export const irodsVersionComparator = (a, b) => {
    let aa = a.split('.').map(Number);
    let bb = b.split('.').map(Number);
    let r = 0;
    let l = Math.max(aa.length, bb.length)
    for (let i = 0; !r && i < l; i++) {
        r = (aa[i] || 0) - (bb[i] || 0)
    }
    return r;
}
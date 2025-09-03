 function toPrimitive(value: any) {
    return value === null ? null : typeof value === "object" ? "" + value : value
}
export default toPrimitive
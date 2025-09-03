/**
 * 判断是否为普通对象
 * @param obj 要检查的对象
 * @returns 是否为普通对象
 */
function isPlainObject(obj: any): boolean {
  return obj !== null && typeof obj === "object" && obj.constructor === Object;
}
export default isPlainObject;

/**
 * 立即执行一个函数，并将其包装在action中
 * 用于临时的一次性状态修改
 * @param name 动作名称（可选）
 * @param fn 包含状态修改的函数
 * @returns 函数执行结果
 */
declare function runInAction<T>(name: string, fn: () => T): T;
declare function runInAction<T>(fn: () => T): T;
export default runInAction;

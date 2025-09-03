import action from "./action";

/**
 * 立即执行一个函数，并将其包装在action中
 * 用于临时的一次性状态修改
 * @param name 动作名称（可选）
 * @param fn 包含状态修改的函数
 * @returns 函数执行结果
 */
function runInAction<T>(name: string, fn: () => T): T;
function runInAction<T>(fn: () => T): T;
function runInAction<T>(nameOrFn: string | (() => T), fn?: () => T): T {
  let name: string | undefined;
  let actionFn: () => T;

  // 处理参数重载
  if (typeof nameOrFn === "string") {
    name = nameOrFn;
    actionFn = fn!;
  } else {
    actionFn = nameOrFn;
    name = "runInAction";
  }

  // 创建临时action并立即执行
  const tempAction = action(name, actionFn);
  return tempAction();
}

export default runInAction;

import { collectDependency, notifyDependency } from "../core/dependency";

const observableKey = Symbol.for("isObservable");


/**
 * 创建可观察对象
 * @param obj 要创建可观察对象的对象
 * @returns 可观察对象
 */
export function observable<T extends object>(target: T): T {
  if (typeof target !== "object" || target == null) {
    return target;
  }

  if (isObservable(target)) {
    return target;
  }

  if (Array.isArray(target)) {
    // TODO: 数组的响应式处理
    return target;
  }

  if (isMap(target)) {
    return target;
  }

  if(isSet(target)){
    return target
  }

  return new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);
      // 如果是对象，递归创建可观察对象（懒处理）
      if (
        typeof result === "object" &&
        result !== null &&
        !isObservable(result)
      ) {
        return observable(result);
      }

      collectDependency(target, key);
      return result;
    },

    set(target, key, value, receiver) {
      const oldValue = Reflect.get(target, key, receiver);
      if (oldValue === value) return true;
      const result = Reflect.set(target, key, value, receiver);
      notifyDependency(target, key);
      return result;
    },

    deleteProperty(target, key) {
      const hadKey = Reflect.has(target, key);
      const result = Reflect.deleteProperty(target, key);

      if (hadKey && result) {
        notifyDependency(target, key);
      }

      return result;
    },
  });
}

/**
 * 检查一个对象是否是可观察对象
 * @param value 要检查的值
 * @returns 是否是可观察对象
 */
function isObservable(value: any): boolean {
  return (
    typeof value === "object" && value !== null && value[observableKey] === true
  );
}

/**
 * 检查一个对象是否是Map
 * @param value 要检查的值
 * @returns 是否是Map
 */
function isMap(value: any): boolean {
  return value instanceof Map;
}

function isSet(value: any): boolean {
  return value instanceof Set;
}

observable[observableKey] = true;

export default observable;

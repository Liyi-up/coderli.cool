import { globalState } from "./globalState";

export interface Observer {
  (): void;
  dirty?: () => void;
}

export function collectDependency(target: object, key: string | symbol): void {
  const { observers, activeEffect } = globalState;
  if (!activeEffect) {
    return;
  }

  let targetObservers = observers.get(target);
  if (!targetObservers) {
    targetObservers = new Map();
    observers.set(target, targetObservers);
  }
  let keyObservers = targetObservers.get(key);
  if (!keyObservers) {
    keyObservers = new Set();
    targetObservers.set(key, keyObservers);
  }
  // 将当前活跃的观察者添加到依赖集合
  keyObservers.add(activeEffect);
}

export function notifyDependency(target: object, key: string | symbol): void {
  const { isBatching, observers, pendingNotifications } = globalState;
  const targetObservers = observers.get(target);
  if (!targetObservers) {
    return;
  }
  const observersSet = targetObservers.get(key);
  if (observersSet) {
    if (isBatching) {
      // 如果在action中，暂时存储需要触发的观察者
      observersSet.forEach((observer) => {
        pendingNotifications.add(observer);
      });
    } else {
      observersSet.forEach((observer) => observer());
    }
  }
}

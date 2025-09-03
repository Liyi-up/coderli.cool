import { globalState } from "./globalState";

export interface Observer {
  (): void;
  dirty?: () => void;
}

export function track(target: object, key: string | symbol): void {
  const { observers, activeReaction } = globalState;
  if (!activeReaction) {
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
  keyObservers.add(activeReaction);
}

export function trigger(target: object, key: string | symbol): void {
  const { isBatching, observers, pendingReactions } = globalState;
  const targetObservers = observers.get(target);
  if (!targetObservers) {
    return;
  }
  const observersSet = targetObservers.get(key);
  if (observersSet) {
    if (isBatching) {
      // 如果在action中，暂时存储需要触发的观察者
      observersSet.forEach((observer) => {
        pendingReactions.add(observer);
      });
    } else {
      observersSet.forEach((observer) => observer());
    }
  }
}

import { getGlobal } from "../global";
import { Observer } from "./dependency";

export const currentObserver = Symbol("currentObserver");
const mobxGlobalState = Symbol("mobxGlobalState");
class MobxGlobalState {
  isBatching = false;
  activeEffect: (() => void) | null = null;
  observers = new WeakMap<object, Map<string | symbol, Set<Observer>>>();
  pendingNotifications = new Set();
}

export let globalState: MobxGlobalState = (function () {
  const global = getGlobal();
  if (!global[mobxGlobalState]) {
    global[mobxGlobalState] = new MobxGlobalState();
  }
  return global[mobxGlobalState];
})();

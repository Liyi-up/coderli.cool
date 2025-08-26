import { getGlobal } from "../global";
import { Derivation, GlobalState } from "../types";


import { Observer } from "./dependency";

export const currentObserver = Symbol("currentObserver");
const mobxGlobalState = Symbol("mobxGlobalState");

class MobxGlobalState implements GlobalState {
  isBatching = false;
  activeReaction: (() => void) | null = null;
  observers = new WeakMap<object, Map<string | symbol, Set<Observer>>>();
  pendingReactions = new Set();
  trackingDerivation: Derivation | null = null;
  inBatch = 0;
  runId = 0;
}

export let globalState: MobxGlobalState = (function () {
  const global = getGlobal();
  if (!global[mobxGlobalState]) {
    global[mobxGlobalState] = new MobxGlobalState();
  }
  return global[mobxGlobalState];
})();

import { getGlobal } from "../global";
import { Derivation, GlobalState } from "../types";




export const currentObserver = Symbol("currentObserver");
const mobxGlobalState = Symbol("mobxGlobalState");

class MobxGlobalState implements GlobalState {
  isBatching = false;
  activeReaction: (() => void) | null = null;
  observers = new WeakMap<object, Map<string | symbol, Set<()=>void>>>();
  pendingReactions = new Set<()=>void>();
  trackingDerivation: Derivation | null = null;
  inBatch = 0;
  runId = 0;
  isRunningReactions: boolean = false;
  allowStateChanges: boolean = true;
}

export let globalState: MobxGlobalState = (function () {
  const global = getGlobal();
  if (!global[mobxGlobalState]) {
    global[mobxGlobalState] = new MobxGlobalState();
  }
  return global[mobxGlobalState];
})();

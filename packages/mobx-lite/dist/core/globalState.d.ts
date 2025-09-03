import { Derivation, GlobalState } from "../types";
import Reaction from "./reaction";
export declare const currentObserver: unique symbol;
declare class MobxGlobalState implements GlobalState {
    activeReaction: (() => void) | null;
    observers: WeakMap<object, Map<string | symbol, Set<() => void>>>;
    pendingReactions: Set<Reaction>;
    trackingDerivation: Derivation | null;
    inBatch: number;
    runId: number;
    isRunningReactions: boolean;
    allowStateChanges: boolean;
}
export declare let globalState: MobxGlobalState;
export {};

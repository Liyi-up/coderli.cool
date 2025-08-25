import { Observer } from "./dependency";
export declare const currentObserver: unique symbol;
declare class MobxGlobalState {
    isBatching: boolean;
    activeEffect: (() => void) | null;
    observers: WeakMap<object, Map<string | symbol, Set<Observer>>>;
    pendingNotifications: Set<unknown>;
}
export declare let globalState: MobxGlobalState;
export {};

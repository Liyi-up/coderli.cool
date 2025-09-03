import { DerivationState, IObservable } from "../types";
import { Derivation } from "../types";
export declare const $mobx: unique symbol;
/**
 * Atom 类 - 最小可观察单元，提供依赖追踪的核心逻辑
 */
declare class Atom implements IObservable {
    /** 调试属性 */
    name: string;
    /** 依赖此可观察对象的所有派生实例集合 */
    observers: Set<Derivation>;
    /** 上次被访问的派生实例的运行ID */
    lastAccessedBy: number;
    /** 此可观察对象当前依赖的所有派生实例中最低的状态 */
    lowestObserverState: DerivationState;
    constructor(name?: string);
    /**
     * 报告当前可观察对象被某个派生实例访问
     * @returns 是否有依赖此可观察对象的派生实例
     */
    reportObserved(): boolean;
    /**
     * 通知所有依赖当前Atom实例的派生发生变化，
     */
    reportChanged(): void;
}
export default Atom;

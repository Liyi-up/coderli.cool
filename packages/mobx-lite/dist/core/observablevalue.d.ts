import { Derivation, DerivationState, IObservable } from "../types";
declare class ObservableValue<T> implements IObservable {
    /** 内部 Atom 实例，管理依赖追踪 */
    private atom;
    /** 存储实际值 */
    private _value;
    /** 调试属性 */
    name: string;
    /** 依赖此可观察值的所有派生实例集合 */
    observers: Set<Derivation>;
    /** 上次被访问的派生实例的运行ID */
    lastAccessedBy: number;
    /** 此可观察值当前依赖的所有派生实例中最低的状态 */
    lowestObserverState: DerivationState;
    constructor(value: T, name?: string);
    /**
     * 获取当前值,并建立依赖关系
     * @returns 当前值
     */
    get value(): T;
    /**
     * 设置新值,并触发依赖更新
     * @param newValue 新值
     */
    set value(newValue: T);
    /**
     * 通知所有依赖当前Atom实例的派生Atom发生变化，
     * 触发它们的重新计算和更新
     */
    reportChanged(): void;
    /**
     * 报告当前可观察对象被某个派生实例访问
     * @returns 是否有依赖此可观察对象的派生实例
     */
    reportObserved(): boolean;
}
export default ObservableValue;

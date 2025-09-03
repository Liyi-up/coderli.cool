import Reaction from "./core/reaction";
export interface GlobalState {
    /** 当前正在追踪的派生 */
    trackingDerivation: Derivation | null;
    /** 当前批处理嵌套深度 */
    inBatch: number;
    /** 当前运行ID 用于优化依赖追踪 */
    runId: number;
    /** 是否正在运行反应队列 */
    isRunningReactions: boolean;
    /** 待处理的反应队列 */
    pendingReactions: Set<Reaction>;
    /** 是否允许状态修改 */
    allowStateChanges: boolean;
}
/**
 * 派生接口，所有派生类型基础接口，例如、(Reaction、ComputedValue)
 */
export interface Derivation {
    /** 派生的当前状态 */
    dependenciesState: DerivationState;
    /** 此派生当前依赖的所有可观察对象 */
    observing: IObservable[];
    /** 新的依赖集合，用于依赖更新时临时存储 */
    newObserving: IObservable[] | null;
    /** 未绑定的依赖计数 */
    unboundDepsCount: number;
    /** 派生的运行ID */
    runId: number;
    /** 当派生变为过时状态时执行的回调 */
    onBecomeStale(): void;
    /** 添加一个可观察对象作为依赖
     * @param observable 要添加的可观察对象
     */
    addDependency(observable: IObservable): void;
}
export declare enum DerivationState {
    /**
     * - 含义 ：表示派生（如 autorun、computed 等）当前没有在追踪任何可观察值
     * - 应用场景 ：
     *   - 派生刚刚被创建但尚未运行
     *   - 派生已经被清理/销毁（调用了 dispose 方法）
     *   - 派生暂时不参与依赖追踪（例如在某些特殊操作期间）
     * - 特点 ：此状态下派生不会收到任何可观察值变化的通知
     */
    NOT_TRACKING = -1,
    /**
     * - 含义 ：表示派生当前是最新的，不需要重新计算
     * - 应用场景 ：
     *   - 派生刚刚执行过，且它依赖的所有可观察值都没有变化
     *   - 派生依赖的可观察值发生了变化，但变化的值不影响派生的最终结果
     * - 特点 ：此状态是性能优化的关键，确保只有真正需要更新的派生才会被重新执行
     */
    UP_TO_DATE = 0,
    /**
     * - 含义 ：表示派生可能已经过时，但尚未确认
     * - 应用场景 ：
     *   - 当某个可观察值发生变化时，它会将所有依赖它的派生标记为 POSSIBLY_STALE
     *   - 这是一个中间状态，用于延迟确定派生是否真的需要重新计算
     * - 特点 ：在批处理更新期间很常见，允许 MobX 收集多个变更后再决定哪些派生需要更新
     */
    POSSIBLY_STALE = 1,
    /**
     * - 含义 ：表示派生肯定已经过时，需要重新计算
     * - 应用场景 ：
     *   - 当 MobX 确认派生确实需要更新时（例如在批处理结束时）
     *   - 当派生依赖的某个已经标记为 STALE 的其他派生时
     * - 特点 ：处于此状态的派生会被优先调度执行，以确保响应式系统的一致性
     */
    STALE = 2
}
export interface IObservable {
    /** 可观察值的名称，调试使用 */
    name: string;
    /** 依赖此可观察对象的派生实例集合 */
    observers: Set<Derivation>;
    /** 通知此可观察对象被访问，建立依赖关系 @@returns 是否有观察者依赖此可观察对象 */
    reportObserved(): boolean;
    /** 通知可观察对象发生变化，通知所有依赖的观察者 */
    reportChanged(): void;
    /** 最后一次访问此可观察对象的派生实例运行ID */
    lastAccessedBy: number;
    /** 此可观察对象当前依赖的所有派生实例中，最低的状态 */
    lowestObserverState: DerivationState;
}
export interface IObservableObject<T extends object> {
    toJS(): T;
    addObservableProp<K extends string, V>(key: K, value: V): void;
    deleteProp(key: string | number | symbol): boolean;
}

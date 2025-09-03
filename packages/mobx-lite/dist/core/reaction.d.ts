import { Derivation, DerivationState, IObservable } from "../types";
/**
 * Reaction 类 - 响应式副作用，用于实现 autorun 等功能
 */
declare class Reaction implements Derivation {
    /**调试属性 */
    name: string;
    /** 反应触发时需要执行的函数 */
    fn: () => void;
    /** 反应的当前状态 */
    dependenciesState: DerivationState;
    /** 反应当前依赖的可观察对象列表 */
    observing: IObservable[];
    /** 新依赖集合，用于更新依赖时的临时存储 */
    newObserving: IObservable[] | null;
    /** 未绑定的依赖数量，用于跟踪新依赖的数量 */
    unboundDepsCount: number;
    /** 运行ID，用于标识当前运行的上下文 */
    runId: number;
    /** 是否已被 dispose */
    isDisposed: boolean;
    constructor(name: string, fn: () => void);
    /**
     * 当前反应的状态过时时，将当前反应添加到调度队列
     * 触发反应的重新运行
     */
    onBecomeStale(): void;
    /**
     * 调度反应，
     * 如果不在批处理上下文中，直接运行，否则加入待处理队列，等待合并处理
     */
    schedule(): void;
    /**
     * 添加可观察对象作为依赖
     * @param observable 可观察对象
     */
    addDependency(observable: IObservable): void;
    /**
     * 运行反应函数，收集依赖，并更新依赖
     */
    runReaction(): void;
    /**
     * 绑定新的依赖关系并清理旧的
     */
    private bindDependencies;
    /**
     *  销毁，用于清理所有依赖关系
     */
    dispose(): void;
}
export default Reaction;

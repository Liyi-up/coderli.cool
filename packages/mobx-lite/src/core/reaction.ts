import { Derivation, DerivationState, IObservable } from "../types";
import { globalState } from "./globalState";

/**
 * Reaction 类 - 响应式副作用，用于实现 autorun 等功能
 */
class Reaction implements Derivation {
  /**调试属性 */
  public name: string;
  /** 反应触发时需要执行的函数 */
  public fn: () => void;
  /** 反应的当前状态 */
  public dependenciesState: DerivationState = DerivationState.NOT_TRACKING;
  /** 反应当前依赖的可观察对象列表 */
  public observing: IObservable[] = [];
  /** 新依赖集合，用于更新依赖时的临时存储 */
  public newObserving: IObservable[] | null = null;
  /** 未绑定的依赖数量，用于跟踪新依赖的数量 */
  public unboundDepsCount: number = 0;
  /** 运行ID，用于标识当前运行的上下文 */
  public runId: number = 0;
  /** 是否已被 dispose */
  public isDisposed: boolean = false;

  constructor(name: string, fn: () => void) {
    this.name = name;
    this.fn = fn;
  }

  /**
   * 当前反应的状态过时时，将当前反应添加到调度队列
   * 触发反应的重新运行
   */
  public onBecomeStale(): void {
    this.schedule();
  }

  /**
   * 调度反应，
   * 如果不在批处理上下文中，直接运行，否则加入待处理队列，等待合并处理
   */
  public schedule(): void {
    if (this.isDisposed) {
      return;
    }

    if (globalState.inBatch === 0 && !globalState.isRunningReactions) {
      this.runReaction();
    } else {
      // 批处理中，加入待处理队列
      globalState.pendingReactions.add(this);
    }
  }

  /**
   * 添加可观察对象作为依赖
   * @param observable 可观察对象
   */
  public addDependency(observable: IObservable): void {
    // 将可观察对象添加到新的依赖列表中
    this.newObserving![this.unboundDepsCount++] = observable;
    // 将当前派生添加为可观察对象的观察者
    observable.observers.add(this);
  }

  /**
   * 运行反应函数，收集依赖，并更新依赖
   */
  public runReaction(): void {
    if (this.isDisposed) return;

    // 重置依赖状态
    this.dependenciesState = DerivationState.UP_TO_DATE;

    // 准备新的依赖列表
    this.newObserving = new Array(this.observing.length);
    this.unboundDepsCount = 0;
    this.runId = ++globalState.runId;

    // 保存之前的 trackingDerivation，并设置当前派生为 active
    const previousDerivation = globalState.trackingDerivation;
    globalState.trackingDerivation = this;

    try {
      // 执行派生函数，这会触发依赖收集
      this.fn();
      // 绑定新的依赖关系并清理旧的
      this.bindDependencies();
    } catch (error) {
      console.error(`Error in reaction "${this.name}":`, error);
    } finally {
      // 恢复之前的 trackingDerivation
      globalState.trackingDerivation = previousDerivation;
    }
  }

  /**
   * 绑定新的依赖关系并清理旧的
   */
  private bindDependencies(): void {
    // 处理 newObserving 可能为 null 的情况
    if (!this.newObserving) return;

    const prevObserving = this.observing;
    const newObserving = this.newObserving;
    const newObservingLength = this.unboundDepsCount;

    // 优化：检查新依赖集合是否为空
    if (newObservingLength === 0) {
      // 如果新依赖集合为空，清理所有旧依赖
      for (let i = 0; i < prevObserving.length; i++) {
        prevObserving[i].observers.delete(this);
      }
      this.observing = [];
      this.newObserving = null;
      return;
    }

    // 优化：使用 Set 来跟踪需要保留的依赖
    const keepObserving = new Set<IObservable>();
    for (let i = 0; i < newObservingLength; i++) {
      keepObserving.add(newObserving[i]);
    }

    // 只清理不再需要的依赖
    for (let i = 0; i < prevObserving.length; i++) {
      const obs = prevObserving[i];
      if (!keepObserving.has(obs)) {
        obs.observers.delete(this);
      }
    }

    // 设置新依赖 - 只保留本次执行过程中实际访问的可观察对象
    this.observing = newObserving.slice(0, newObservingLength);
    this.newObserving = null;
  }

  /**
   *  销毁，用于清理所有依赖关系
   */
  public dispose(): void {
    if (this.isDisposed) return;

    this.isDisposed = true;

    // 清理所有依赖关系
    for (let i = 0; i < this.observing.length; i++) {
      this.observing[i].observers.delete(this);
    }

    this.observing = [];
    this.dependenciesState = DerivationState.NOT_TRACKING;
    // 从待处理列表中移除
    globalState.pendingReactions.delete(this);
  }
}

export default Reaction;

import { DerivationState, IObservable } from "../types";
import { Derivation } from "../types";
import { globalState } from "./globalState";

export const $mobx = Symbol("@coderli/mobx-lite");

/**
 * Atom 类 - 最小可观察单元，提供依赖追踪的核心逻辑
 */
class Atom implements IObservable {
  /** 调试属性 */
  public name: string;
  /** 依赖此可观察对象的所有派生实例集合 */
  public observers = new Set<Derivation>();
  /** 上次被访问的派生实例的运行ID */
  public lastAccessedBy: number = 0;
  /** 此可观察对象当前依赖的所有派生实例中最低的状态 */
  public lowestObserverState: DerivationState = DerivationState.NOT_TRACKING;

  constructor(name: string = "Atom") {
    this.name = name;
  }
  /**
   * 报告当前可观察对象被某个派生实例访问
   * @returns 是否有依赖此可观察对象的派生实例
   */
  public reportObserved() {
    const derivation = globalState.trackingDerivation;
    if (derivation !== null) {
      // 优化，只有当本次访问的runId与上次不同时才建立以来
      if (derivation.runId !== this.lastAccessedBy) {
        this.lastAccessedBy = derivation.runId;
        // 将当前Atom添加到派生依赖列表
        derivation.addDependency(this);
      }
      return this.observers.size > 0;
    }
    return false;
  }

  /**
   * 通知所有依赖当前Atom实例的派生Atom发生变化，
   */
  public reportChanged(): void {
    // 通知所有观察者
    this.observers.forEach((observer) => {
      if (observer.dependenciesState === DerivationState.UP_TO_DATE) {
        observer.dependenciesState = DerivationState.STALE;
        observer.onBecomeStale();
      }
      this.lowestObserverState = Math.min(
        this.lowestObserverState,
        observer.dependenciesState
      );
    });
  }
}

export default Atom;

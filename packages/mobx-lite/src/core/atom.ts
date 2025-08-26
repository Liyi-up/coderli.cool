import { DerivationState, IObservable } from "../types";
import { Derivation } from "../types";
import { globalState } from "./globalState";

class Atom implements IObservable {
  public name: string;
  public observers = new Set<Derivation>();
  public lastAccessedBy: number = 0;
  public lowestObserverState: DerivationState = DerivationState.NOT_TRACKING;

  constructor(name: string = "Atom") {
    this.name = name;
  }

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

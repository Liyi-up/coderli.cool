import { Derivation, DerivationState, IObservable } from "../types";
import Atom from "./atom";

class ObservableValue<T> implements IObservable {
  /** 内部 Atom 实例，管理依赖追踪 */
  private atom: Atom;
  /** 存储实际值 */
  private _value: T;
  /** 调试属性 */
  public name: string;
  /** 依赖此可观察值的所有派生实例集合 */
  public observers: Set<Derivation>;
  /** 上次被访问的派生实例的运行ID */
  public lastAccessedBy: number;
  /** 此可观察值当前依赖的所有派生实例中最低的状态 */
  public lowestObserverState: DerivationState;

  constructor(value: T, name = "ObservableValue") {
    this.name = name;
    this._value = value;
    this.atom = new Atom(name);
    this.observers = this.atom.observers;
    this.lastAccessedBy = this.atom.lastAccessedBy;
    this.lowestObserverState = this.atom.lowestObserverState;
  }

  /**
   * 获取当前值,并建立依赖关系
   * @returns 当前值
   */
  public get value(): T {
    this.reportObserved(); // 收集依赖
    return this._value;
  }

  /**
   * 设置新值,并触发依赖更新
   * @param newValue 新值
   */
  public set value(newValue: T) {
    if (newValue !== this._value) {
      this._value = newValue;
      this.reportChanged();
    }
  }

  /**
   * 通知所有依赖当前Atom实例的派生Atom发生变化，
   * 触发它们的重新计算和更新
   */
  public reportChanged(): void {
    this.atom.reportChanged();
  }

  /**
   * 报告当前可观察对象被某个派生实例访问
   * @returns 是否有依赖此可观察对象的派生实例
   */
  public reportObserved(): boolean {
    return this.atom.reportObserved();
  }
}

export default ObservableValue;

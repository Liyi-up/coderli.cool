import { IObservableObject } from "../types";
import checkIfStateModificationsAreAllowed from "../utils/checkIfStateModificationsAreAllowed";
import Atom, { $mobx } from "./atom";
import ObservableValue from "./observablevalue";

class ObservableObject<T extends object> implements IObservableObject<T> {
  /** 原始对象 */
  private _target: T;
  private atom: Atom;
  /** 存储每个属性的ObservableValue  */
  private values: Map<string | number | symbol, ObservableValue<any>> =
    new Map();
  constructor(target: T, name = "ObservableObject") {
    this._target = target;
    this.atom = new Atom(name);

    for (const key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        const value = target[key];
        this.makePropertyObservable(key, value);
      }
    }
    const proxy = new Proxy(this, {
      get: (target, prop, receiver) => {
        if (
          prop === $mobx ||
          prop === "toJS" ||
          prop === "addObservableProp" ||
          prop === "deleteProp"
        ) {
          return Reflect.get(target, prop, receiver);
        }
        // 对于其他属性，获取对应的ObservableValue
        const observableValue = this.values.get(prop);
        if (observableValue) {
          return observableValue.value;
        }
        // 如果没有ObservableValue,但目标对象存在该属性，则创建
        const value = Reflect.get(target, prop, receiver);
        if (prop in this._target) {
          this.makePropertyObservable(prop, value);
          return this.values.get(prop)?.value;
        }

        return value;
      },

      set: (target, prop, value, receiver) => {
        if (prop === $mobx) {
          return Reflect.set(target, prop, value, receiver);
        }
        checkIfStateModificationsAreAllowed();
        // 检查是否已经有对象的ObservableValue
        const observableValue = this.values.get(prop);
        if (observableValue) {
          observableValue.value = value;
        } else {
          this.makePropertyObservable(prop, value);
        }

        return true;
      },
      deleteProperty: (target, prop) => {
        checkIfStateModificationsAreAllowed();
        if (this.values.has(prop)) {
          this.values.delete(prop);
          // 如果目标对象也有该属性，也从目标对象中删除
          if (prop in this._target) {
            delete this._target[prop];
          }
        }
        this.atom.reportChanged();
        return true;
      },
    });
    return proxy;
  }
  /**
   * 获取原始对象的副本
   * @returns 对象的副本
   */
  toJS(): T {
    const result = {} as T;
    for (const key in this._target) {
      if (Object.prototype.hasOwnProperty.call(this._target, key)) {
        const value = this.values.get(key)?.value;
        result[key as keyof T] =
          value !== undefined ? value : this._target[key];
      }
    }
    return result;
  }
  /**
   * 添加新的可观察属性
   * @param key 属性名
   * @param value 属性值
   */
  addObservableProp<K extends string, V>(key: K, value: V): void {
    throw new Error("Method not implemented.");
  }
  /**
   * 删除属性
   * @param key 要删除的属性名
   * @returns 是否成功删除
   */
  deleteProp(key: string | number | symbol): boolean {
    throw new Error("Method not implemented.");
  }

  /**
   * 将单个属性转换为可观察到
   * @param prop 属性名
   * @param value 属性值
   */
  private makePropertyObservable(prop: string | number | symbol, value: any) {
    if (typeof value === "object" && value !== null) {
      if (Array.isArray(value)) {
        // TODO: 数组的响应式处理
      } else if (
        typeof value === "object" &&
        !(value instanceof ObservableObject)
      ) {
        value = new ObservableObject(value);
      }
    }
    const observableValue = new ObservableValue(
      value,
      `${this.atom.name}.${String(prop)}`
    );
    this.values.set(prop, observableValue);
  }

  /**
   * 报告此对象被访问，建立依赖关系
   * @returns 是否有观察者依赖此对象
   */
  public reportObserved(): boolean {
    return this.atom.reportObserved();
  }

  /**
   * 报告此对象发生变化，通知所有依赖的派生
   */
  public reportChanged(): void {
    this.atom.reportChanged();
  }
}

export default ObservableObject;

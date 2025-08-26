import { globalState } from "../core/globalState";
import { toPrimitive } from "../utils";

class ComputedRef<T> {
  private readonly computedFn: () => T;
  private _value: T | undefined;
  private _dirty = true; // 是否需要重新计算
  private effect: () => void;
  // 依赖此属性的所有观察者
  private dependencies = new Set<() => void>();
  constructor(computedFn: () => T) {
    this.computedFn = computedFn;
    this.effect = () => {
      this._dirty = true;
      this.dependencies.forEach((effect) => effect());
    };
  }

  [Symbol.toPrimitive]() {
    return this.valueOf();
  }
  
  valueOf(): T {
    return toPrimitive(this.value);
  }
  /**
   * 获取计算属
   */
  get value(): T | undefined {
    const { activeReaction } = globalState;
    // 收集观察者
    if (activeReaction) {
      this.dependencies.add(activeReaction);
    }
    if (this._dirty) {
      // 保存当前活跃的副作用
      const prevEffect = activeReaction;
      // 将当前的计算属性effect 设为活跃副作用
      globalState.activeReaction = this.effect;
      // 执行计算函数
      this._value = this.computedFn();
      // 计算完成后，将活跃副作用设为之前的副作用
      globalState.activeReaction = prevEffect;
      this._dirty = false;
    }
    return this._value;
  }

  refresh(): void {
    this._dirty = true;
    this.value; // 触发重新计算
  }
}

function computed<T>(computeFn: () => T): ComputedRef<T> {
  return new ComputedRef(computeFn);
}

export default computed;

declare class ComputedRef<T> {
    private readonly computedFn;
    private _value;
    private _dirty;
    private effect;
    private dependencies;
    constructor(computedFn: () => T);
    [Symbol.toPrimitive](): T;
    valueOf(): T;
    /**
     * 获取计算属
     */
    get value(): T | undefined;
    refresh(): void;
}
declare function computed<T>(computeFn: () => T): ComputedRef<T>;
export default computed;

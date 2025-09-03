import { IObservableObject } from "../types";
declare class ObservableObject<T extends object> implements IObservableObject<T> {
    /** 原始对象 */
    private _target;
    private atom;
    /** 存储每个属性的ObservableValue  */
    private values;
    constructor(target: T, name?: string);
    /**
     * 获取原始对象的副本
     * @returns 对象的副本
     */
    toJS(): T;
    /**
     * 添加新的可观察属性
     * @param key 属性名
     * @param value 属性值
     */
    addObservableProp<K extends string, V>(key: K, value: V): void;
    /**
     * 删除属性
     * @param key 要删除的属性名
     * @returns 是否成功删除
     */
    deleteProp(key: string | number | symbol): boolean;
    /**
     * 将单个属性转换为可观察到
     * @param prop 属性名
     * @param value 属性值
     */
    private makePropertyObservable;
    /**
     * 报告此对象被访问，建立依赖关系
     * @returns 是否有观察者依赖此对象
     */
    reportObserved(): boolean;
    /**
     * 报告此对象发生变化，通知所有依赖的派生
     */
    reportChanged(): void;
}
export default ObservableObject;

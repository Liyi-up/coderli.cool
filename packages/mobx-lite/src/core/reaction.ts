import { Derivation, DerivationState, IObservable } from "../types";
import { globalState } from "./globalState";

class Reaction implements Derivation {
    public name: string;
    public fn: () => void;
    public dependenciesState: DerivationState = DerivationState.NOT_TRACKING;
    public observing: IObservable[] = [];
    public newObserving: IObservable[] | null = null;
    public unboundDepsCount: number = 0;
    public runId: number = 0;
    public isDisposed: boolean = false;
    
    constructor(name: string, fn: () => void) {
        this.name = name;
        this.fn = fn;
    }
    
    public onBecomeStale(): void {
        this.schedule();
    }
    
    public schedule(): void {
        if (!this.isDisposed) {
            this.runReaction();
        }
    }
    
    public addDependency(observable: IObservable): void {
        // 将可观察对象添加到新的依赖列表中
        this.newObserving![this.unboundDepsCount++] = observable;
        // 将当前派生添加为可观察对象的观察者
        observable.observers.add(this);
    }
    
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
    
    private bindDependencies(): void {
        // 处理新的依赖
        const prevObserving = this.observing;
        const newObserving = this.newObserving!;
        
        // 从旧依赖中移除当前派生
        for (let i = 0; i < prevObserving.length; i++) {
            prevObserving[i].observers.delete(this);
        }
        
        // 设置新的依赖列表
        this.observing = newObserving.slice(0, this.unboundDepsCount);
        this.newObserving = null;
        
        // 更新可观察对象的状态
        for (let i = 0; i < this.observing.length; i++) {
            const observable = this.observing[i];
            observable.lowestObserverState = Math.min(
                observable.lowestObserverState,
                this.dependenciesState
            );
        }
    }
    
    public dispose(): void {
        if (this.isDisposed) return;
        
        this.isDisposed = true;
        
        // 清理所有依赖关系
        for (let i = 0; i < this.observing.length; i++) {
            this.observing[i].observers.delete(this);
        }
        
        this.observing = [];
        this.dependenciesState = DerivationState.NOT_TRACKING;
    }
}

export default Reaction;

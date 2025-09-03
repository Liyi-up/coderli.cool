'use strict';

var DerivationState;
(function (DerivationState) {
    /**
     * - 含义 ：表示派生（如 autorun、computed 等）当前没有在追踪任何可观察值
     * - 应用场景 ：
     *   - 派生刚刚被创建但尚未运行
     *   - 派生已经被清理/销毁（调用了 dispose 方法）
     *   - 派生暂时不参与依赖追踪（例如在某些特殊操作期间）
     * - 特点 ：此状态下派生不会收到任何可观察值变化的通知
     */
    DerivationState[DerivationState["NOT_TRACKING"] = -1] = "NOT_TRACKING";
    /**
     * - 含义 ：表示派生当前是最新的，不需要重新计算
     * - 应用场景 ：
     *   - 派生刚刚执行过，且它依赖的所有可观察值都没有变化
     *   - 派生依赖的可观察值发生了变化，但变化的值不影响派生的最终结果
     * - 特点 ：此状态是性能优化的关键，确保只有真正需要更新的派生才会被重新执行
     */
    DerivationState[DerivationState["UP_TO_DATE"] = 0] = "UP_TO_DATE";
    /**
     * - 含义 ：表示派生可能已经过时，但尚未确认
     * - 应用场景 ：
     *   - 当某个可观察值发生变化时，它会将所有依赖它的派生标记为 POSSIBLY_STALE
     *   - 这是一个中间状态，用于延迟确定派生是否真的需要重新计算
     * - 特点 ：在批处理更新期间很常见，允许 MobX 收集多个变更后再决定哪些派生需要更新
     */
    DerivationState[DerivationState["POSSIBLY_STALE"] = 1] = "POSSIBLY_STALE";
    /**
     * - 含义 ：表示派生肯定已经过时，需要重新计算
     * - 应用场景 ：
     *   - 当 MobX 确认派生确实需要更新时（例如在批处理结束时）
     *   - 当派生依赖的某个已经标记为 STALE 的其他派生时
     * - 特点 ：处于此状态的派生会被优先调度执行，以确保响应式系统的一致性
     */
    DerivationState[DerivationState["STALE"] = 2] = "STALE";
})(DerivationState || (DerivationState = {}));

var mockGlobal = {};
function getGlobal() {
    if (typeof globalThis !== "undefined") {
        return globalThis;
    }
    if (typeof window !== "undefined") {
        return window;
    }
    // @ts-ignore
    if (typeof global !== "undefined") {
        // @ts-ignore
        return global;
    }
    if (typeof self !== "undefined") {
        return self;
    }
    return mockGlobal;
}

var mobxGlobalState = Symbol("mobxGlobalState");
var MobxGlobalState = /** @class */ (function () {
    function MobxGlobalState() {
        this.activeReaction = null;
        this.observers = new WeakMap();
        this.pendingReactions = new Set();
        this.trackingDerivation = null;
        this.inBatch = 0;
        this.runId = 0;
        this.isRunningReactions = false;
        this.allowStateChanges = true;
    }
    return MobxGlobalState;
}());
var globalState = (function () {
    var global = getGlobal();
    if (!global[mobxGlobalState]) {
        global[mobxGlobalState] = new MobxGlobalState();
    }
    return global[mobxGlobalState];
})();

/**
 * Reaction 类 - 响应式副作用，用于实现 autorun 等功能
 */
var Reaction = /** @class */ (function () {
    function Reaction(name, fn) {
        /** 反应的当前状态 */
        this.dependenciesState = DerivationState.NOT_TRACKING;
        /** 反应当前依赖的可观察对象列表 */
        this.observing = [];
        /** 新依赖集合，用于更新依赖时的临时存储 */
        this.newObserving = null;
        /** 未绑定的依赖数量，用于跟踪新依赖的数量 */
        this.unboundDepsCount = 0;
        /** 运行ID，用于标识当前运行的上下文 */
        this.runId = 0;
        /** 是否已被 dispose */
        this.isDisposed = false;
        this.name = name;
        this.fn = fn;
    }
    /**
     * 当前反应的状态过时时，将当前反应添加到调度队列
     * 触发反应的重新运行
     */
    Reaction.prototype.onBecomeStale = function () {
        this.schedule();
    };
    /**
     * 调度反应，
     * 如果不在批处理上下文中，直接运行，否则加入待处理队列，等待合并处理
     */
    Reaction.prototype.schedule = function () {
        if (this.isDisposed) {
            return;
        }
        if (globalState.inBatch === 0 && !globalState.isRunningReactions) {
            this.runReaction();
        }
        else {
            // 批处理中，加入待处理队列
            globalState.pendingReactions.add(this);
        }
    };
    /**
     * 添加可观察对象作为依赖
     * @param observable 可观察对象
     */
    Reaction.prototype.addDependency = function (observable) {
        // 将可观察对象添加到新的依赖列表中
        this.newObserving[this.unboundDepsCount++] = observable;
        // 将当前派生添加为可观察对象的观察者
        observable.observers.add(this);
    };
    /**
     * 运行反应函数，收集依赖，并更新依赖
     */
    Reaction.prototype.runReaction = function () {
        if (this.isDisposed)
            return;
        // 重置依赖状态
        this.dependenciesState = DerivationState.UP_TO_DATE;
        // 准备新的依赖列表
        this.newObserving = new Array(this.observing.length);
        this.unboundDepsCount = 0;
        this.runId = ++globalState.runId;
        // 保存之前的 trackingDerivation，并设置当前派生为 active
        var previousDerivation = globalState.trackingDerivation;
        globalState.trackingDerivation = this;
        try {
            // 执行派生函数，这会触发依赖收集
            this.fn();
            // 绑定新的依赖关系并清理旧的
            this.bindDependencies();
        }
        catch (error) {
            console.error("Error in reaction \"".concat(this.name, "\":"), error);
        }
        finally {
            // 恢复之前的 trackingDerivation
            globalState.trackingDerivation = previousDerivation;
        }
    };
    /**
     * 绑定新的依赖关系并清理旧的
     */
    Reaction.prototype.bindDependencies = function () {
        // 处理 newObserving 可能为 null 的情况
        if (!this.newObserving)
            return;
        var prevObserving = this.observing;
        var newObserving = this.newObserving;
        var newObservingLength = this.unboundDepsCount;
        // 优化：检查新依赖集合是否为空
        if (newObservingLength === 0) {
            // 如果新依赖集合为空，清理所有旧依赖
            for (var i = 0; i < prevObserving.length; i++) {
                prevObserving[i].observers.delete(this);
            }
            this.observing = [];
            this.newObserving = null;
            return;
        }
        // 优化：使用 Set 来跟踪需要保留的依赖
        var keepObserving = new Set();
        for (var i = 0; i < newObservingLength; i++) {
            keepObserving.add(newObserving[i]);
        }
        // 只清理不再需要的依赖
        for (var i = 0; i < prevObserving.length; i++) {
            var obs = prevObserving[i];
            if (!keepObserving.has(obs)) {
                obs.observers.delete(this);
            }
        }
        // 设置新依赖 - 只保留本次执行过程中实际访问的可观察对象
        this.observing = newObserving.slice(0, newObservingLength);
        this.newObserving = null;
    };
    /**
     *  销毁，用于清理所有依赖关系
     */
    Reaction.prototype.dispose = function () {
        if (this.isDisposed)
            return;
        this.isDisposed = true;
        // 清理所有依赖关系
        for (var i = 0; i < this.observing.length; i++) {
            this.observing[i].observers.delete(this);
        }
        this.observing = [];
        this.dependenciesState = DerivationState.NOT_TRACKING;
        // 从待处理列表中移除
        globalState.pendingReactions.delete(this);
    };
    return Reaction;
}());

/**
 * 创建一个自动运行的反应
 * 当依赖的可观察数据变化时，自动重新执行提供的函数
 * @param fn 要自动运行的函数
 * @returns 清理函数，调用后停止自动运行
 */
function autorun(fn) {
    var reaction = new Reaction("Autorun", fn);
    reaction.runReaction();
    return function dispose() {
        reaction.dispose();
    };
}

/**
 * 检查是否允许修改状态
 */
function checkIfStateModificationsAreAllowed() {
    if (!globalState.allowStateChanges) {
        console.error('State changes are not allowed at this point.');
    }
}

var $mobx = Symbol("@coderli/mobx-lite");
/**
 * Atom 类 - 最小可观察单元，提供依赖追踪的核心逻辑
 */
var Atom = /** @class */ (function () {
    function Atom(name) {
        if (name === void 0) { name = "Atom"; }
        /** 依赖此可观察对象的所有派生实例集合 */
        this.observers = new Set();
        /** 上次被访问的派生实例的运行ID */
        this.lastAccessedBy = 0;
        /** 此可观察对象当前依赖的所有派生实例中最低的状态 */
        this.lowestObserverState = DerivationState.NOT_TRACKING;
        this.name = name;
    }
    /**
     * 报告当前可观察对象被某个派生实例访问
     * @returns 是否有依赖此可观察对象的派生实例
     */
    Atom.prototype.reportObserved = function () {
        var derivation = globalState.trackingDerivation;
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
    };
    /**
     * 通知所有依赖当前Atom实例的派生发生变化，
     */
    Atom.prototype.reportChanged = function () {
        var _this = this;
        // 通知所有观察者
        this.observers.forEach(function (observer) {
            if (observer.dependenciesState === DerivationState.UP_TO_DATE) {
                observer.dependenciesState = DerivationState.STALE;
                observer.onBecomeStale();
            }
            _this.lowestObserverState = Math.min(_this.lowestObserverState, observer.dependenciesState);
        });
    };
    return Atom;
}());

var ObservableValue = /** @class */ (function () {
    function ObservableValue(value, name) {
        if (name === void 0) { name = "ObservableValue"; }
        this.name = name;
        this._value = value;
        this.atom = new Atom(name);
        this.observers = this.atom.observers;
        this.lastAccessedBy = this.atom.lastAccessedBy;
        this.lowestObserverState = this.atom.lowestObserverState;
    }
    Object.defineProperty(ObservableValue.prototype, "value", {
        /**
         * 获取当前值,并建立依赖关系
         * @returns 当前值
         */
        get: function () {
            this.reportObserved(); // 收集依赖
            return this._value;
        },
        /**
         * 设置新值,并触发依赖更新
         * @param newValue 新值
         */
        set: function (newValue) {
            if (newValue !== this._value) {
                this._value = newValue;
                this.reportChanged();
            }
        },
        enumerable: false,
        configurable: true
    });
    /**
     * 通知所有依赖当前Atom实例的派生Atom发生变化，
     * 触发它们的重新计算和更新
     */
    ObservableValue.prototype.reportChanged = function () {
        this.atom.reportChanged();
    };
    /**
     * 报告当前可观察对象被某个派生实例访问
     * @returns 是否有依赖此可观察对象的派生实例
     */
    ObservableValue.prototype.reportObserved = function () {
        return this.atom.reportObserved();
    };
    return ObservableValue;
}());

var ObservableObject = /** @class */ (function () {
    function ObservableObject(target, name) {
        if (name === void 0) { name = "ObservableObject"; }
        var _this = this;
        /** 存储每个属性的ObservableValue  */
        this.values = new Map();
        this._target = target;
        this.atom = new Atom(name);
        for (var key in target) {
            if (Object.prototype.hasOwnProperty.call(target, key)) {
                var value = target[key];
                this.makePropertyObservable(key, value);
            }
        }
        var proxy = new Proxy(this, {
            get: function (target, prop, receiver) {
                var _a;
                if (prop === $mobx ||
                    prop === "toJS" ||
                    prop === "addObservableProp" ||
                    prop === "deleteProp") {
                    return Reflect.get(target, prop, receiver);
                }
                // 对于其他属性，获取对应的ObservableValue
                var observableValue = _this.values.get(prop);
                if (observableValue) {
                    return observableValue.value;
                }
                // 如果没有ObservableValue,但目标对象存在该属性，则创建
                var value = Reflect.get(target, prop, receiver);
                if (prop in _this._target) {
                    _this.makePropertyObservable(prop, value);
                    return (_a = _this.values.get(prop)) === null || _a === void 0 ? void 0 : _a.value;
                }
                return value;
            },
            set: function (target, prop, value, receiver) {
                if (prop === $mobx) {
                    return Reflect.set(target, prop, value, receiver);
                }
                checkIfStateModificationsAreAllowed();
                // 检查是否已经有对象的ObservableValue
                var observableValue = _this.values.get(prop);
                if (observableValue) {
                    observableValue.value = value;
                }
                else {
                    _this.makePropertyObservable(prop, value);
                }
                return true;
            },
            deleteProperty: function (target, prop) {
                checkIfStateModificationsAreAllowed();
                if (_this.values.has(prop)) {
                    _this.values.delete(prop);
                    // 如果目标对象也有该属性，也从目标对象中删除
                    if (prop in _this._target) {
                        delete _this._target[prop];
                    }
                }
                _this.atom.reportChanged();
                return true;
            },
        });
        return proxy;
    }
    /**
     * 获取原始对象的副本
     * @returns 对象的副本
     */
    ObservableObject.prototype.toJS = function () {
        var _a;
        var result = {};
        for (var key in this._target) {
            if (Object.prototype.hasOwnProperty.call(this._target, key)) {
                var value = (_a = this.values.get(key)) === null || _a === void 0 ? void 0 : _a.value;
                result[key] =
                    value !== undefined ? value : this._target[key];
            }
        }
        return result;
    };
    /**
     * 添加新的可观察属性
     * @param key 属性名
     * @param value 属性值
     */
    ObservableObject.prototype.addObservableProp = function (key, value) {
        throw new Error("Method not implemented.");
    };
    /**
     * 删除属性
     * @param key 要删除的属性名
     * @returns 是否成功删除
     */
    ObservableObject.prototype.deleteProp = function (key) {
        throw new Error("Method not implemented.");
    };
    /**
     * 将单个属性转换为可观察到
     * @param prop 属性名
     * @param value 属性值
     */
    ObservableObject.prototype.makePropertyObservable = function (prop, value) {
        if (typeof value === "object" && value !== null) {
            if (Array.isArray(value)) ;
            else if (typeof value === "object" &&
                !(value instanceof ObservableObject)) {
                value = new ObservableObject(value);
            }
        }
        var observableValue = new ObservableValue(value, "".concat(this.atom.name, ".").concat(String(prop)));
        this.values.set(prop, observableValue);
    };
    /**
     * 报告此对象被访问，建立依赖关系
     * @returns 是否有观察者依赖此对象
     */
    ObservableObject.prototype.reportObserved = function () {
        return this.atom.reportObserved();
    };
    /**
     * 报告此对象发生变化，通知所有依赖的派生
     */
    ObservableObject.prototype.reportChanged = function () {
        this.atom.reportChanged();
    };
    return ObservableObject;
}());

/**
 * 判断是否为普通对象
 * @param obj 要检查的对象
 * @returns 是否为普通对象
 */
function isPlainObject(obj) {
    return obj !== null && typeof obj === "object" && obj.constructor === Object;
}

function observable(value) {
    if (Array.isArray(value)) {
        return value;
    }
    if (value !== null && typeof value === "object") {
        if (isPlainObject(value)) {
            return new ObservableObject(value);
        }
        return value;
    }
    return new ObservableValue(value);
}

exports.autorun = autorun;
exports.observable = observable;
//# sourceMappingURL=index.js.map

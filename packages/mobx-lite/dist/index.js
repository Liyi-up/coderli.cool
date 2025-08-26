'use strict';

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
        this.isBatching = false;
        this.activeReaction = null;
        this.observers = new WeakMap();
        this.pendingReactions = new Set();
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

function action(nameOrFn, fn) {
    var actionFn;
    // 处理参数重载
    if (typeof nameOrFn === 'string') {
        actionFn = fn;
    }
    else {
        actionFn = nameOrFn;
    }
    var isBatching = globalState.isBatching;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (isBatching) {
            return actionFn.apply(void 0, args);
        }
        globalState.isBatching = true;
        try {
            return fn === null || fn === void 0 ? void 0 : fn.apply(void 0, args);
        }
        finally {
            globalState.isBatching = false;
            globalState.pendingReactions.forEach(function (notification) {
                notification();
            });
            globalState.pendingReactions.clear();
        }
    };
}

function autorun(effect) {
    var run = function () {
        var prev = globalState.activeReaction;
        globalState.activeReaction = run;
        try {
            effect();
        }
        finally {
            globalState.activeReaction = prev;
        }
    };
    // 初始化执行收集依赖
    run();
}

function track(target, key) {
    var observers = globalState.observers, activeReaction = globalState.activeReaction;
    if (!activeReaction) {
        return;
    }
    var targetObservers = observers.get(target);
    if (!targetObservers) {
        targetObservers = new Map();
        observers.set(target, targetObservers);
    }
    var keyObservers = targetObservers.get(key);
    if (!keyObservers) {
        keyObservers = new Set();
        targetObservers.set(key, keyObservers);
    }
    // 将当前活跃的观察者添加到依赖集合
    keyObservers.add(activeReaction);
}
function trigger(target, key) {
    var isBatching = globalState.isBatching, observers = globalState.observers, pendingReactions = globalState.pendingReactions;
    var targetObservers = observers.get(target);
    if (!targetObservers) {
        return;
    }
    var observersSet = targetObservers.get(key);
    if (observersSet) {
        if (isBatching) {
            // 如果在action中，暂时存储需要触发的观察者
            observersSet.forEach(function (observer) {
                pendingReactions.add(observer);
            });
        }
        else {
            observersSet.forEach(function (observer) { return observer(); });
        }
    }
}

var observableKey = Symbol.for("isObservable");
/**
 * 创建可观察对象
 * @param obj 要创建可观察对象的对象
 * @returns 可观察对象
 */
function observable(target) {
    if (typeof target !== "object" || target == null) {
        return target;
    }
    if (isObservable(target)) {
        return target;
    }
    if (Array.isArray(target)) {
        // TODO: 数组的响应式处理
        return target;
    }
    if (isMap(target)) {
        return target;
    }
    if (isSet(target)) {
        return target;
    }
    return new Proxy(target, {
        get: function (target, key, receiver) {
            var result = Reflect.get(target, key, receiver);
            // 如果是对象，递归创建可观察对象（懒处理）
            if (typeof result === "object" &&
                result !== null &&
                !isObservable(result)) {
                return observable(result);
            }
            track(target, key);
            return result;
        },
        set: function (target, key, value, receiver) {
            var oldValue = Reflect.get(target, key, receiver);
            if (oldValue === value)
                return true;
            var result = Reflect.set(target, key, value, receiver);
            trigger(target, key);
            return result;
        },
        deleteProperty: function (target, key) {
            var hadKey = Reflect.has(target, key);
            var result = Reflect.deleteProperty(target, key);
            if (hadKey && result) {
                trigger(target, key);
            }
            return result;
        },
    });
}
/**
 * 检查一个对象是否是可观察对象
 * @param value 要检查的值
 * @returns 是否是可观察对象
 */
function isObservable(value) {
    return (typeof value === "object" && value !== null && value[observableKey] === true);
}
/**
 * 检查一个对象是否是Map
 * @param value 要检查的值
 * @returns 是否是Map
 */
function isMap(value) {
    return value instanceof Map;
}
function isSet(value) {
    return value instanceof Set;
}
observable[observableKey] = true;

function toPrimitive(value) {
    return value === null ? null : typeof value === "object" ? "" + value : value;
}

var ComputedRef = /** @class */ (function () {
    function ComputedRef(computedFn) {
        var _this = this;
        this._dirty = true; // 是否需要重新计算
        // 依赖此属性的所有观察者
        this.dependencies = new Set();
        this.computedFn = computedFn;
        this.effect = function () {
            _this._dirty = true;
            _this.dependencies.forEach(function (effect) { return effect(); });
        };
    }
    ComputedRef.prototype[Symbol.toPrimitive] = function () {
        return this.valueOf();
    };
    ComputedRef.prototype.valueOf = function () {
        return toPrimitive(this.value);
    };
    Object.defineProperty(ComputedRef.prototype, "value", {
        /**
         * 获取计算属
         */
        get: function () {
            var activeReaction = globalState.activeReaction;
            // 收集观察者
            if (activeReaction) {
                this.dependencies.add(activeReaction);
            }
            if (this._dirty) {
                // 保存当前活跃的副作用
                var prevEffect = activeReaction;
                // 将当前的计算属性effect 设为活跃副作用
                globalState.activeReaction = this.effect;
                // 执行计算函数
                this._value = this.computedFn();
                // 计算完成后，将活跃副作用设为之前的副作用
                globalState.activeReaction = prevEffect;
                this._dirty = false;
            }
            return this._value;
        },
        enumerable: false,
        configurable: true
    });
    ComputedRef.prototype.refresh = function () {
        this._dirty = true;
        this.value; // 触发重新计算
    };
    return ComputedRef;
}());
function computed(computeFn) {
    return new ComputedRef(computeFn);
}

function runInAction(nameOrFn, fn) {
    var name;
    var actionFn;
    // 处理参数重载
    if (typeof nameOrFn === "string") {
        name = nameOrFn;
        actionFn = fn;
    }
    else {
        actionFn = nameOrFn;
        name = "runInAction";
    }
    // 创建临时action并立即执行
    var tempAction = action(name, actionFn);
    return tempAction();
}

exports.action = action;
exports.autorun = autorun;
exports.computed = computed;
exports.observable = observable;
exports.runInAction = runInAction;
//# sourceMappingURL=index.js.map

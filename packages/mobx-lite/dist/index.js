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
        this.activeEffect = null;
        this.observers = new WeakMap();
        this.pendingNotifications = new Set();
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

function action(fn) {
    var isBatching = globalState.isBatching;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (isBatching) {
            return fn.apply(void 0, args);
        }
        globalState.isBatching = true;
        try {
            return fn.apply(void 0, args);
        }
        finally {
            globalState.isBatching = false;
            globalState.pendingNotifications.forEach(function (notification) {
                notification();
            });
            globalState.pendingNotifications.clear();
        }
    };
}

function autorun(effect) {
    var run = function () {
        var prev = globalState.activeEffect;
        globalState.activeEffect = run;
        try {
            effect();
        }
        finally {
            globalState.activeEffect = prev;
        }
    };
    // 初始化执行收集依赖
    run();
}

function collectDependency(target, key) {
    var observers = globalState.observers, activeEffect = globalState.activeEffect;
    if (!activeEffect) {
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
    keyObservers.add(activeEffect);
}
function notifyDependency(target, key) {
    var isBatching = globalState.isBatching, observers = globalState.observers, pendingNotifications = globalState.pendingNotifications;
    var targetObservers = observers.get(target);
    if (!targetObservers) {
        return;
    }
    var observersSet = targetObservers.get(key);
    if (observersSet) {
        if (isBatching) {
            // 如果在action中，暂时存储需要触发的观察者
            observersSet.forEach(function (observer) {
                pendingNotifications.add(observer);
            });
        }
        else {
            observersSet.forEach(function (observer) { return observer(); });
        }
    }
}

var observableKey = Symbol.for("isObservable");
var observableValueKey = Symbol.for("observableValue");
var rawValueKey = Symbol.for("rawValue");
/**
 * 创建可观察对象
 * @param obj 要创建可观察对象的对象
 * @returns 可观察对象
 */
function observable(target) {
    if (typeof target !== "object" || target == null) {
        return createObservablePrimitive(target);
    }
    if (Array.isArray(target)) {
        // TODO: 数组的响应式处理
        return target;
    }
    if (isObservable(target)) {
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
            collectDependency(target, key);
            return result;
        },
        set: function (target, key, value, receiver) {
            var oldValue = Reflect.get(target, key, receiver);
            if (oldValue === value)
                return true;
            var result = Reflect.set(target, key, value, receiver);
            notifyDependency(target, key);
            return result;
        },
        deleteProperty: function (target, key) {
            var hadKey = Reflect.has(target, key);
            var result = Reflect.deleteProperty(target, key);
            if (hadKey && result) {
                notifyDependency(target, key);
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
function createObservablePrimitive(value) {
    var _a;
    // 对于null和undefined，直接返回
    if (value === null || value === undefined) {
        return value;
    }
    var wrapper = (_a = {},
        _a[observableKey] = true,
        _a[observableValueKey] = true,
        _a[rawValueKey] = value,
        Object.defineProperty(_a, "value", {
            get: function () {
                collectDependency(this, "value");
                return value;
            },
            set: function (newValue) {
                if (value !== newValue) {
                    value = newValue;
                    notifyDependency(this, "value");
                }
            },
            enumerable: false,
            configurable: true
        }),
        // 提供valueOf和toString方法，以便在需要时自动转换为原始值
        _a.valueOf = function () {
            return value;
        },
        _a.toString = function () {
            return String(value);
        },
        _a[Symbol.toPrimitive] = function (hint) {
            if (hint === "number" && typeof value === "boolean") {
                return value ? 1 : 0;
            }
            return value;
        },
        _a);
    // 使用Proxy确保属性访问被正确拦截
    return new Proxy(wrapper, {
        get: function (target, key, receiver) {
            // 直接访问包装器对象的属性
            var result = Reflect.get(target, key, receiver);
            return result;
        },
        // 拦截二元运算符等操作
        apply: function (target, thisArg, args) {
            return value;
        },
        set: function (target, key, value, receiver) {
            if (key === "value") {
                target.value = value;
                return true;
            }
            return Reflect.set(target, key, value, receiver);
        },
        has: function (target, key) {
            if (key === "value")
                return true;
            // @ts-ignore
            return key in value;
        },
    });
}
observable[observableKey] = true;

exports.action = action;
exports.autorun = autorun;
exports.observable = observable;
//# sourceMappingURL=index.js.map

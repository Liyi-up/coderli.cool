"use client";

import React, { useState } from "react";
import { observable, autorun, action } from "@coderli/mobx-lite";

//
const state = observable({
  count: 0,
  message: "Hello MobX-Lite",
  total: 0,
});



const arr = observable([1, 2, 3]);

// 定义日志条目类型
interface LogEntry {
  id: string;
  timestamp: Date;
  action: string;
  message: string;
}

// 计数器组件
const CounterComponent: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // 当前操作标识
  const [currentAction, setCurrentAction] = useState<string>("初始化");

  // 记录日志的函数，添加操作标识
  const logMessage = (message: string, actionType?: string) => {
    const entry: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      action: actionType || currentAction,
      message: message,
    };

    setLogs((prev) => [...prev, entry]);
    console.log(`[${entry.action}] ${entry.message}`);
  };

  // 设置autorun观察器 - 使用useEffect确保只在组件挂载时设置一次
  React.useEffect(() => {
    autorun(() => {
      logMessage(`count变化: ${count}`);
    });

    arr[0] = 100;

    // 组件卸载时清理观察器
    return () => {
      //   countDisposer();
      //   messageDisposer();
      //   combinedDisposer();
    };
  }, []);

  // 创建action函数，并添加操作标识
  const increment = action(() => {
    setCurrentAction("增加计数");
    state.count++;
    state.total = state.count * 10;
   
  });

  const updateMessage = action(() => {
    setCurrentAction("更新消息");
    state.message = `Updated at ${new Date().toLocaleTimeString()}`;
  });

  const resetAll = action(() => {
    setCurrentAction("重置");
    state.count = 0;
    state.message = "Hello MobX-Lite";
    state.total = 0;
    arr.push(111);
  });

  const batchUpdate = action(() => {
    setCurrentAction("批量更新");
    // 多个状态更新只会触发一次批处理
    state.count += 5;
    state.count += 11;
    state.count += 22;
    state.count += 21;
    count += 1;
    state.message = "Batch update completed";
    // state.total = state.count * 10;
  });

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        MobX-Lite 测试页面
      </h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">当前状态</h2>
        <div className="bg-gray-50 p-4 rounded-md">
          <p>
            <strong>计数:</strong> {state.count}
          </p>
          <p>
            <strong>消息:</strong> {state.message}
          </p>
          <p>
            <strong>总计:</strong> {state.total}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={increment}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          增加计数
        </button>
        <button
          onClick={updateMessage}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          更新消息
        </button>
        <button
          onClick={batchUpdate}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          批量更新
        </button>
        <button
          onClick={resetAll}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          重置
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">更新日志</h2>
        <div className="bg-gray-50 p-4 rounded-md max-h-60 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500">暂无日志</p>
          ) : (
            <div>
              {/* 先将Map转换为数组并保存 */}
              {(() => {
                // 按操作类型对日志进行分组
                const groupsMap = logs.reduce((groups, log) => {
                  const key = log.action;
                  const group = groups.get(key) || [];
                  group.push(log);
                  groups.set(key, group);
                  return groups;
                }, new Map<string, LogEntry[]>());

                // 转换为数组以便渲染
                const groupsArray = Array.from(groupsMap);

                return groupsArray.map(([actionName, actionLogs], index) => (
                  <div key={actionName + index} className="mb-4 last:mb-0">
                    {/* 操作标题行，使用不同颜色区分不同操作 */}
                    <div
                      className={`
                      px-3 py-1 rounded-md mb-2 font-medium text-white
                      ${actionName === "初始化" ? "bg-gray-600" : ""}
                      ${actionName === "增加计数" ? "bg-blue-600" : ""}
                      ${actionName === "更新消息" ? "bg-green-600" : ""}
                      ${actionName === "批量更新" ? "bg-purple-600" : ""}
                      ${actionName === "重置" ? "bg-red-600" : ""}
                    `}
                    >
                      {actionName} -{" "}
                      {new Date(actionLogs[0].timestamp).toLocaleTimeString()}
                    </div>
                    {/* 该操作产生的所有日志 */}
                    <ul className="pl-5 space-y-1 mt-1.5">
                      {actionLogs.map((log) => (
                        <li key={log.id} className="text-sm text-gray-700">
                          {log.message}
                        </li>
                      ))}
                    </ul>
                    {/* 操作分隔线 - 使用数组长度来判断 */}
                    {index < groupsArray.length - 1 && (
                      <div className="mt-3 border-b border-dashed border-gray-300"></div>
                    )}
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CounterComponent;

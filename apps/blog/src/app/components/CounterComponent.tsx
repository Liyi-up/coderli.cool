"use client";

import React, { useState, useEffect } from "react";
import { observable, autorun } from "@coderli/mobx-lite";
import { motion, AnimatePresence } from "motion/react";

// 定义可观察状态
const state = observable({
  count: 0,
  message: "Hello MobX-Lite",
  total: 0,
});

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
  const [currentAction, setCurrentAction] = useState<string>("初始化");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // 记录日志的函数
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

  // 设置autorun观察器
  useEffect(() => {
    const messageDisposer = autorun(() => {
      logMessage(
        `count: ${state.count}, message: ${state.message}, total: ${state.total}`
      );
    });

    return () => {
      messageDisposer();
    };
  }, []);

  // 创建action函数
  const increment = () => {
    setCurrentAction("增加计数");
    state.count++;
    state.total = state.count * 10;
  };

  const updateMessage = () => {
    setCurrentAction("更新消息");
    state.message = `Updated at ${new Date().toLocaleTimeString()}`;
  };

  const resetAll = () => {
    setCurrentAction("重置");
    state.count = 0;
    state.message = "Hello MobX-Lite";
    state.total = 0;
  };

  const batchUpdate = () => {
    setCurrentAction("批量更新");
    // 多个状态更新只会触发一次批处理
    state.count += 5;
    state.count += 11;
    state.count += 22;
    state.count += 21;
    state.message = "Batch update completed";
  };

  // 清空日志
  const clearLogs = () => {
    setLogs([]);
    setCurrentAction("清空日志");
    logMessage("日志已清空");
  };

  return (
    <motion.div 
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* 标题栏 */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">
            MobX-Lite 状态管理演示
          </h1>
          <motion.button
            onClick={clearLogs}
            className="text-sm text-white bg-white/20 px-3 py-1 rounded-full"
            whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
            whileTap={{ scale: 0.95 }}
          >
            清空日志
          </motion.button>
        </div>

        {/* 状态显示区域 */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
            当前状态
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* 状态卡片 - 带进入动画 */}
            <motion.div 
              className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                计数器值
              </p>
              <motion.p 
                className="text-3xl font-bold text-gray-800 dark:text-white"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, type: "spring" }}
              >
                {state.count}
              </motion.p>
            </motion.div>
            
            <motion.div 
              className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-1">
                消息内容
              </p>
              <p className="text-xl font-medium text-gray-800 dark:text-white">
                {state.message}
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
                计算总计
              </p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">
                {state.total}
              </p>
            </motion.div>
          </div>

          {/* 按钮区域 */}
          <div className="flex flex-wrap gap-3 mb-8">
            <motion.button
              onClick={increment}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">➕</span> 增加计数
            </motion.button>
            
            <motion.button
              onClick={updateMessage}
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg shadow"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">📝</span> 更新消息
            </motion.button>
            
            <motion.button
              onClick={batchUpdate}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-lg shadow"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">📊</span> 批量更新
            </motion.button>
            
            <motion.button
              onClick={resetAll}
              className="px-5 py-2.5 bg-red-500 text-white rounded-lg shadow"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">🔄</span> 重置
            </motion.button>
          </div>

          {/* 日志区域 */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                更新日志 ({logs.length})
              </h2>
              <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-blue-600 dark:text-blue-400"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isExpanded ? "收起" : "展开全部"}
              </motion.button>
            </div>
            
            <motion.div 
              className={`bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg overflow-y-auto`}
              animate={{ 
                maxHeight: isExpanded ? "24rem" : "15rem"
              }}
              transition={{ duration: 0.3 }}
            >
              {logs.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  暂无日志记录
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {/* 按操作类型对日志进行分组 */}
                    {(() => {
                      const groupsMap = logs.reduce((groups, log) => {
                        const key = log.action;
                        const group = groups.get(key) || [];
                        group.push(log);
                        groups.set(key, group);
                        return groups;
                      }, new Map<string, LogEntry[]>());

                      const groupsArray = Array.from(groupsMap).sort((a, b) => {
                        // 按时间排序，最新的在前面
                        const timeA = a[1][0].timestamp.getTime();
                        const timeB = b[1][0].timestamp.getTime();
                        return timeB - timeA;
                      });

                      return groupsArray.map(([actionName, actionLogs], index) => (
                        <motion.div 
                          key={actionName + index} 
                          className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          {/* 操作标题行，使用不同颜色区分不同操作 */}
                          <div
                            className={`
                            px-3 py-1.5 rounded-md mb-2 font-medium text-white inline-block
                            ${actionName === "初始化" ? "bg-gray-600" : ""}
                            ${actionName === "增加计数" ? "bg-blue-600" : ""}
                            ${actionName === "更新消息" ? "bg-green-600" : ""}
                            ${actionName === "批量更新" ? "bg-purple-600" : ""}
                            ${actionName === "重置" ? "bg-red-600" : ""}
                            ${actionName === "清空日志" ? "bg-yellow-600" : ""}
                          `}
                          >
                            {actionName} - 
                            <span className="opacity-80 text-sm">
                              {new Date(actionLogs[0].timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          
                          {/* 该操作产生的所有日志 */}
                          <ul className="pl-4 mt-1 space-y-2">
                            {actionLogs.map((log, logIndex) => (
                              <motion.li 
                                key={log.id} 
                                className="text-sm text-gray-700 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-900/70 rounded-md"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: logIndex * 0.03 }}
                              >
                                <div className="flex items-start">
                                  <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-1.5 mr-2"></span>
                                  <span>{log.message}</span>
                                </div>
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      ));
                    })()}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CounterComponent;
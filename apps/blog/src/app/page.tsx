

"use client"

import React from 'react';
import CounterComponent from "@/app/components/CounterComponent";
import { motion } from "motion/react";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-gray-50 to-blue-50 dark:from-gray-900 dark:via-indigo-950 dark:to-gray-900 font-sans text-gray-800 dark:text-gray-100">
      
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div 
          className="absolute top-20 left-20 w-72 h-72 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-10"
          animate={{ 
            scale: [1, 1.1, 0.9, 1],
            x: [0, 30, -20, 0],
            y: [0, -50, 20, 0]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-72 h-72 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-10"
          animate={{ 
            scale: [1, 0.9, 1.1, 1],
            x: [0, -20, 30, 0],
            y: [0, 30, -40, 0]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity,
            repeatType: "reverse",
            delay: 2
          }}
        />
        <motion.div 
          className="absolute bottom-20 left-1/3 w-72 h-72 bg-pink-400 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-10"
          animate={{ 
            scale: [1, 1.15, 0.85, 1],
            x: [0, 25, -15, 0],
            y: [0, -30, 40, 0]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity,
            repeatType: "reverse",
            delay: 4
          }}
        />
      </div>

      {/* 主内容容器 */}
      <div className="relative z-10 container mx-auto px-4 py-16 md:py-24 flex flex-col items-center justify-center">
        {/* 标题部分 - 添加进入动画 */}
        <motion.header 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-4 tracking-tight"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            MobX-Lite 演示
          </motion.h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            一个轻量级的响应式状态管理解决方案，让你的 React 应用状态管理变得简单直观
          </p>
        </motion.header>

        {/* 内容卡片 */}
        <div className="w-full max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <CounterComponent />
          </motion.div>
        </div>

        {/* 页脚 */}
        <motion.footer 
          className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p>© {new Date().getFullYear()} MobX-Lite 示例应用</p>
        </motion.footer>
      </div>
      
      {/* 全局样式 */}
      <style jsx global>{`
        /* 平滑滚动 */
        html {
          scroll-behavior: smooth;
        }
        
        /* 选择文本样式 */
        ::selection {
          background-color: rgba(99, 102, 241, 0.3);
        }
        
        /* 自定义滚动条 */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.8);
        }
      `}</style>
    </div>
  );
}

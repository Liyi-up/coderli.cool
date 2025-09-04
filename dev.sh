#!/bin/bash

# 设置脚本执行失败时立即退出
set -e

# 清理之前的构建文件
rm -rf /Users/bytedance/Developer/coderli.cool/packages/mobx-lite/dist/*

# 启动 mobx-lite 的开发服务器（在新终端窗口）
osascript -e 'tell app "Terminal" to do script "cd /Users/bytedance/Developer/coderli.cool/packages/mobx-lite && npm run dev"'

# 等待 mobx-lite 首次构建完成
# 这很重要，确保首次构建完成后再启动 blog 应用
for i in {1..10}; do
  if [ -f "/Users/bytedance/Developer/coderli.cool/packages/mobx-lite/dist/index.js" ]; then
    echo "mobx-lite 构建完成，启动 blog 应用..."
    break
  fi
  echo "等待 mobx-lite 构建完成... ($i/10)"
  sleep 1
  if [ $i -eq 10 ]; then
    echo "警告：mobx-lite 构建超时，尝试继续启动 blog 应用..."
  fi

done

# 启动 blog 应用的开发服务器（在当前终端窗口）
cd /Users/bytedance/Developer/coderli.cool/apps/blog
npm run dev
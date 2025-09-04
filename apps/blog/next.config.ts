import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config, options) => {
    // 无论服务器还是客户端，都配置监听选项
    config.watchOptions = {
      poll: 1000, // 每秒轮询一次文件变化
      ignored: /node_modules/ // 忽略 node_modules 目录
    };

    // 配置别名，确保直接引用源代码
    config.resolve.alias = {
      ...config.resolve.alias,
      '@coderli/mobx-lite': path.resolve(__dirname, '../../packages/mobx-lite/src/index.ts')
    };

    // 配置模块解析，优先使用源码
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../packages/mobx-lite/src')
    ];

    // 对于 Next.js 15，我们需要特殊处理客户端热更新
    if (!options.isServer) {
      // 配置热模块替换插件
      config.plugins.push(
        new options.webpack.HotModuleReplacementPlugin()
      );
    }

    return config;
  },
 
 
};

export default nextConfig;

import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: [
    { 
      file: 'dist/index.js', 
      format: 'cjs',
      sourcemap: true,
      sourcemapPathTransform: (relativeSourcePath) => {
        return `../../../packages/mobx-lite/src/${relativeSourcePath}`;
      }
    },
    { 
      file: 'dist/index.esm.js', 
      format: 'esm',
      sourcemap: true,
      sourcemapPathTransform: (relativeSourcePath) => {
        return `../../../packages/mobx-lite/src/${relativeSourcePath}`;
      }
    }
  ],
  plugins: [typescript({
    sourceMap: true,
    inlineSources: true,
    // 添加增量编译配置以加快构建速度
    incremental: true,
    tsBuildInfoFile: 'dist/.tsbuildinfo'
  })],
  // 避免构建时的依赖缓存
  cache: false
};
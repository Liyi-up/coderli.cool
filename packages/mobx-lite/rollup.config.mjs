import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,  // 确保启用 sourcemap
      sourcemapPathTransform: (relativeSourcePath) => {
        // 确保路径映射正确，便于浏览器找到源码
        return `../../../packages/mobx-lite/src/${relativeSourcePath}`;
      }
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,  // 确保启用 sourcemap
      sourcemapPathTransform: (relativeSourcePath) => {
        return `../../../packages/mobx-lite/src/${relativeSourcePath}`;
      }
    }
  ],
  plugins: [typescript({
    sourceMap: true,  // TypeScript 也需要启用 sourcemap
    inlineSources: true  // 内联源码到 sourcemap 中
  })]
};
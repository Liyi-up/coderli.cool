/**
 * 创建一个自动运行的反应
 * 当依赖的可观察数据变化时，自动重新执行提供的函数
 * @param fn 要自动运行的函数
 * @returns 清理函数，调用后停止自动运行
 */
declare function autorun(fn: () => void): () => void;
export default autorun;

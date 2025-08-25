import { globalState } from "../core/globalState";

function autorun(effect: () => void) {
  const run = () => {
    const prev = globalState.activeEffect;
    globalState.activeEffect = run;
    try {
      effect();
    } finally {
      globalState.activeEffect = prev;
    }
  };
  // 初始化执行收集依赖
  run();
}

export default autorun;

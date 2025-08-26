import { globalState } from "../core/globalState";

function autorun(effect: () => void) {
  const run = () => {
    const prev = globalState.activeReaction;
    globalState.activeReaction = run;
    try {
      effect();
    } finally {
      globalState.activeReaction = prev;
    }
  };
  // 初始化执行收集依赖
  run();
  
}

export default autorun;

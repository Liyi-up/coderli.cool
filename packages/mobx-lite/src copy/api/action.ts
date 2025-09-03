import { globalState } from "../core/globalState";


function action<T extends (...args: any[]) => any>(fn: T): T;
function action<T extends (...args: any[]) => any>(name: string, fn: T): T;
function action<T extends (...args: any[]) => any>(nameOrFn: string | T, fn?: T): T {
  let name: string | undefined;
  let actionFn: T;

  // 处理参数重载
  if (typeof nameOrFn === 'string') {
    name = nameOrFn;
    actionFn = fn!;
  } else {
    actionFn = nameOrFn;
    name = 'action';
  }

  const { isBatching } = globalState;
  return function (...args: any[]): any {
    if (isBatching) {
      return actionFn(...args);
    }
    globalState.isBatching = true;

    try {
      return fn?.(...args);
    } finally {
      globalState.isBatching = false;
      globalState.pendingReactions.forEach((notification: any) => {
        notification();
      });
      globalState.pendingReactions.clear();
    }
  } as T;
}

export default action;



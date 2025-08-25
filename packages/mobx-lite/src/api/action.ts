import { globalState } from "../core/globalState";

function action<T extends (...args: any[]) => any>(fn: T): T {
  const { isBatching } = globalState;
  return function (...args: any[]): any {
    if (isBatching) {
      return fn(...args);
    }
    globalState.isBatching = true;

    try {
      return fn(...args);
    } finally {
      globalState.isBatching = false;
      globalState.pendingNotifications.forEach((notification: any) => {
        notification();
      });
      globalState.pendingNotifications.clear();
    }
  } as T;
}

export default action;

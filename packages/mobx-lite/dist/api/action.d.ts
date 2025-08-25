declare function action<T extends (...args: any[]) => any>(fn: T): T;
export default action;

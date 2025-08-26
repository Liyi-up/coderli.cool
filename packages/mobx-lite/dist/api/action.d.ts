declare function action<T extends (...args: any[]) => any>(fn: T): T;
declare function action<T extends (...args: any[]) => any>(name: string, fn: T): T;
export default action;

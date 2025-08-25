export interface Observer {
    (): void;
    dirty?: () => void;
}
export declare function collectDependency(target: object, key: string | symbol): void;
export declare function notifyDependency(target: object, key: string | symbol): void;

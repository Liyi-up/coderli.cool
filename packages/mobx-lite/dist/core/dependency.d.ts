export interface Observer {
    (): void;
    dirty?: () => void;
}
export declare function track(target: object, key: string | symbol): void;
export declare function trigger(target: object, key: string | symbol): void;

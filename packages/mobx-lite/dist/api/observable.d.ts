import ObservableValue from "../core/observablevalue";
declare function observable<T extends object>(value: T): T;
declare function observable<T>(value: T): ObservableValue<T>;
export default observable;

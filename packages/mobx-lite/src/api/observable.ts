import ObservableObject from "../core/observableobject";
import ObservableValue from "../core/observablevalue";
import isPlainObject from "../utils/isPlainObject";

function observable<T extends object>(value: T): T;
function observable<T>(value: T): ObservableValue<T>;
function observable<T extends object>(value: T): any {
  if (Array.isArray(value)) {
    return value;
  }

  if (value !== null && typeof value === "object") {
    if (isPlainObject(value)) {
      return new ObservableObject(value);
    }
    return value;
  }

  return new ObservableValue(value);
}
export default observable;

export type Reaction = (() => void) & {
  dependencies: Set<object>;
};



export interface GlobalState {
  trackingDerivation: Derivation | null;
  inBatch: number;
  runId: number;
}


export interface Derivation {
  dependenciesState: DerivationState;
  observing: IObservable[];
  newObserving: IObservable[] | null;
  unboundDepsCount: number;
  runId: number;
  onBecomeStale(): void;
  addDependency(observable: IObservable): void;
}

export enum DerivationState {
  NOT_TRACKING = -1,
  UP_TO_DATE = 0,
  POSSIBLY_STALE = 1,
  STALE = 2,
}

export interface IObservable {
  name: string;
  observers: Set<Derivation>;
  reportObserved(): boolean;
  reportChanged(): void;
  lastAccessedBy: number;
  lowestObserverState: DerivationState;
}

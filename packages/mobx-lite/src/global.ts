declare const window: any;
declare const self: any;

const mockGlobal = {};

export function getGlobal() {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  // @ts-ignore
  if (typeof global !== "undefined") {
    // @ts-ignore
    return global;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  return mockGlobal;
}

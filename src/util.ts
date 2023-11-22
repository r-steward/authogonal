/**
 * is object a promise
 */
export function isPromise(p: any) {
  return p?.then !== undefined;
}

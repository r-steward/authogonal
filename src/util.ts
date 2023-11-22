/**
 * is object a promise
 * @param p
 */
export function isPromise(p: any) {
  return p?.then !== undefined;
}



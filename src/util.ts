export const UnauthorizedCode = 401;
export const ForbiddenCode = 403;

/**
 * is object a promise
 */
export function isPromise(p: any) {
  return p?.then !== undefined;
}

/**
 * does object have error message
 * @param e
 * @returns
 */
export function isError(e: any): e is { message: string } {
  return typeof (e as { message: string }).message === 'string';
}

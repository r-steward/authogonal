﻿/**
 * Updates an API request to include authentication data (so that request can be authorised on the server side)
 * @param <R> request object
 */
export interface RequestEnricher<R> {
  authorizeRequest(request: R): Promise<R>;
}

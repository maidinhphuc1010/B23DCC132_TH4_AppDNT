import { request } from './client';

export const getById = id =>
  request('GET', `/assignments/${id}?_expand=course`);
export const getAll = () =>
  request('GET', '/assignments?_expand=course&_sort=dueDate');
export const update = (id, data) =>
  request('PATCH', `/assignments/${id}`, data);
export const create = data => request('POST', '/assignments', data);

import { request } from './client';

export const getById = id => request('GET', `/sessions/${id}?_expand=course`);
export const getAll = () => request('GET', '/sessions?_expand=course');

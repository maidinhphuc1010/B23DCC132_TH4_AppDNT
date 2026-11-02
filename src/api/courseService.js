import { request } from './client';

export const getAll = () => request('GET', '/courses');
export const getById = id => request('GET', `/courses/${id}`);

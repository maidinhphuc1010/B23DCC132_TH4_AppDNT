import { request } from './client';

export const getById = id => request('GET', `/grades/${id}?_expand=course`);
export const getAll = () => request('GET', '/grades?_expand=course');

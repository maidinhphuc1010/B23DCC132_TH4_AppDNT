import { request } from './client';

export const getById = (id = 1) => request('GET', `/students/${id}`);
export const update = (id, data) => request('PATCH', `/students/${id}`, data);

import { BASE_URL, TIMEOUT } from '../config';

export async function request(method, url, body) {
  const controller = new AbortController();
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject({
        type: 'timeout',
        status: null,
        message: 'Yêu cầu quá thời gian chờ 10 giây.',
      });
      controller.abort();
    }, TIMEOUT);
  });
  const execute = async () => {
    const response = await fetch(`${BASE_URL.replace(/\/$/, '')}${url}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw {
        type: 'http',
        status: response.status,
        message: `HTTP ${response.status}: ${
          response.statusText || 'Yêu cầu thất bại.'
        }`,
      };
    }
    if (response.status === 204) {
      return null;
    }
    try {
      return await response.json();
    } catch {
      throw {
        type: 'http',
        status: response.status,
        message: 'Phản hồi không phải JSON hợp lệ.',
      };
    }
  };
  try {
    return await Promise.race([execute(), timeout]);
  } catch (error) {
    if (['network', 'timeout', 'http'].includes(error?.type)) {
      throw error;
    }
    throw {
      type: 'network',
      status: null,
      message: error?.message || 'Không thể kết nối máy chủ.',
    };
  } finally {
    clearTimeout(timer);
  }
}

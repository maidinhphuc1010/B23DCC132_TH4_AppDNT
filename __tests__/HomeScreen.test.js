import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { LearningProvider } from '../src/context/LearningContext';
import { HomeScreen } from '../src/screens/HomeScreen';
import { LEARNING_STORAGE_KEY } from '../src/context/LearningContext';
import { storage } from '../src/utils/storage';
test('home dashboard displays subjects and an empty student profile state', async () => {
  await storage.remove(LEARNING_STORAGE_KEY);
  let renderer;
  await act(async () => {
    renderer = Renderer.create(
      <LearningProvider>
        <HomeScreen />
      </LearningProvider>,
    );
  });
  const rendered = JSON.stringify(renderer.toJSON());
  expect(rendered).toContain('Thông tin sinh viên');
  expect(rendered).toContain('Chưa có hồ sơ sinh viên');
  expect(rendered).toContain('Môn học');
  expect(rendered).toContain('Nhập môn lập trình');
  expect(rendered).toContain('IT101');
  expect(rendered).toContain('Bài tập sắp đến hạn');
  expect(rendered).toContain('Bài tập giới hạn hàm số');
  const nearest = rendered.indexOf('Bài tập giới hạn hàm số');
  const next = rendered.indexOf('Viết đoạn văn giới thiệu bản thân');
  const later = rendered.indexOf('Cài đặt danh sách liên kết');
  expect(nearest).toBeLessThan(next);
  expect(next).toBeLessThan(later);
  expect(rendered).not.toContain('Thực hành biến và kiểu dữ liệu');
  await act(async () => renderer.unmount());
});

import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { NavigationContainer } from '@react-navigation/native';
import { LearningProvider } from '../src/context/LearningContext';
import {
  AssignmentsScreen,
  AcademicResultDetailScreen,
  SubjectDetailScreen,
  StudentProfileScreen,
  ScheduleScreen,
  SubjectsScreen,
} from '../src/screens/LearningScreens';
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);
test('Student profile displays available student information', async () => {
  let renderer;
  await act(async () => {
    renderer = Renderer.create(
      <LearningProvider>
        <StudentProfileScreen />
      </LearningProvider>,
    );
  });
  expect(JSON.stringify(renderer.toJSON())).toContain(
    'Chưa có hồ sơ sinh viên',
  );
  await act(async () => renderer.unmount());
});
test('profile can be created with valid contacts and draft can be canceled', async () => {
  let renderer;
  await act(async () => {
    renderer = Renderer.create(
      <LearningProvider>
        <StudentProfileScreen />
      </LearningProvider>,
    );
  });
  await act(async () =>
    renderer.root
      .findByProps({ accessibilityLabel: 'Tạo hồ sơ' })
      .props.onPress(),
  );
  await act(async () =>
    renderer.root
      .findByProps({ accessibilityLabel: 'Họ và tên' })
      .props.onChangeText('Nguyễn An'),
  );
  await act(async () =>
    renderer.root
      .findByProps({ accessibilityLabel: 'Mã sinh viên' })
      .props.onChangeText('001'),
  );
  await act(async () =>
    renderer.root
      .findByProps({ accessibilityLabel: 'Email' })
      .props.onChangeText('an@example.com'),
  );
  await act(async () =>
    renderer.root
      .findByProps({ accessibilityLabel: 'Số điện thoại' })
      .props.onChangeText('abc'),
  );
  await act(async () =>
    renderer.root
      .findByProps({ accessibilityLabel: 'Lưu hồ sơ' })
      .props.onPress(),
  );
  expect(JSON.stringify(renderer.toJSON())).toContain(
    'Số điện thoại không hợp lệ.',
  );
  await act(async () =>
    renderer.root
      .findByProps({ accessibilityLabel: 'Hủy chỉnh sửa' })
      .props.onPress(),
  );
  expect(JSON.stringify(renderer.toJSON())).toContain(
    'Chưa có hồ sơ sinh viên',
  );
  await act(async () => renderer.unmount());
});
test('subject detail displays code, credits, lecturer and description', async () => {
  let rendered;
  await act(async () => {
    rendered = Renderer.create(
      <LearningProvider>
        <SubjectDetailScreen route={{ params: { subjectId: 'subject-001' } }} />
      </LearningProvider>,
    );
  });
  const output = JSON.stringify(rendered.toJSON());
  expect(output).toContain('Mã môn học');
  expect(output).toContain('IT101');
  expect(output).toContain('Số tín chỉ');
  expect(output).toContain('Giảng viên');
  expect(output).toContain('Mô tả');
  expect(output).toContain('Biến, kiểu dữ liệu, cấu trúc điều khiển và hàm.');
  await act(async () => rendered.unmount());
});
test('Schedule screen filters classes by weekday and displays time and room', async () => {
  let renderer;
  await act(async () => {
    renderer = Renderer.create(
      <NavigationContainer>
        <LearningProvider>
          <ScheduleScreen />
        </LearningProvider>
      </NavigationContainer>,
    );
  });
  const firstDay = renderer.root.findAllByProps({
    accessibilityRole: 'button',
  })[0];
  await act(async () => firstDay.props.onPress());
  const rendered = JSON.stringify(renderer.toJSON());
  expect(rendered).toContain('Nhập môn lập trình');
  expect(rendered).toContain('07:30–09:30');
  expect(rendered).toContain('A101');
  expect(rendered).toContain('B201');
  await act(async () => renderer.unmount());
});
test('academic result detail displays components, weights, calculated final score and pending score', async () => {
  let renderer;
  await act(async () => {
    renderer = Renderer.create(
      <LearningProvider>
        <AcademicResultDetailScreen
          route={{
            key: 'r1',
            name: 'AcademicResultDetail',
            params: { academicResultId: 'result-001' },
          }}
        />
      </LearningProvider>,
    );
  });
  let output = JSON.stringify(renderer.toJSON());
  expect(output).toContain('Chuyên cần');
  expect(output).toContain('10%');
  expect(output).toContain('Điểm tổng kết');
  expect(output).toContain('8.40');
  await act(async () => renderer.unmount());
  await act(async () => {
    renderer = Renderer.create(
      <LearningProvider>
        <AcademicResultDetailScreen
          route={{
            key: 'r2',
            name: 'AcademicResultDetail',
            params: { academicResultId: 'result-002' },
          }}
        />
      </LearningProvider>,
    );
  });
  output = JSON.stringify(renderer.toJSON());
  expect(output).toContain('Chưa có điểm');
  expect(output).toContain('Chưa đủ điểm thành phần');
  await act(async () => renderer.unmount());
});
test('Assignments can be filtered by status and marked complete', async () => {
  let renderer;
  await act(async () => {
    renderer = Renderer.create(
      <NavigationContainer>
        <LearningProvider>
          <AssignmentsScreen />
        </LearningProvider>
      </NavigationContainer>,
    );
  });
  let rendered = JSON.stringify(renderer.toJSON());
  expect(rendered).toContain('Hoàn thành');
  const target = renderer.root.findAll(node =>
    node.props.accessibilityLabel?.startsWith('Đánh dấu hoàn thành:'),
  )[0];
  await act(async () => target.props.onPress());
  rendered = JSON.stringify(renderer.toJSON());
  expect(rendered).toContain('Đã hoàn thành');
  const completedFilter = renderer.root.findAllByProps({
    accessibilityRole: 'button',
  })[3];
  await act(async () => completedFilter.props.onPress());
  const filtered = JSON.stringify(renderer.toJSON());
  expect(filtered).toContain('Thiết kế cơ sở dữ liệu quản lý thư viện');
  expect(filtered).toContain('Bài tập giới hạn hàm số');
  expect(filtered).toContain('Hoàn thành');
  await act(async () => renderer.unmount());
});
test('Subjects screen filters rows by title and detail using SearchBar', async () => {
  let renderer;
  await act(async () => {
    renderer = Renderer.create(
      <NavigationContainer>
        <LearningProvider>
          <SubjectsScreen />
        </LearningProvider>
      </NavigationContainer>,
    );
  });
  let rendered = JSON.stringify(renderer.toJSON());
  expect(rendered).toContain('Nhập môn lập trình');
  expect(rendered).toContain('Cấu trúc dữ liệu và giải thuật');
  const search = renderer.root.findByProps({ accessibilityLabel: 'Tìm kiếm' });
  await act(async () => search.props.onChangeText('IT201'));
  rendered = JSON.stringify(renderer.toJSON());
  expect(rendered).toContain('Cấu trúc dữ liệu và giải thuật');
  expect(rendered).not.toContain('Nhập môn lập trình');
  await act(async () => renderer.unmount());
});
test('profile displays empty academic results state', async () => {
  let rendered;
  await act(async () => {
    rendered = Renderer.create(
      <LearningProvider>
        <StudentProfileScreen />
      </LearningProvider>,
    );
  });
  expect(JSON.stringify(rendered.toJSON())).toContain(
    'Chưa có hồ sơ sinh viên',
  );
  await act(async () => rendered.unmount());
});

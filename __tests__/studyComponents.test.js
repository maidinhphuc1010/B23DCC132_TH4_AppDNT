import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import AppButton from '../src/components/common/AppButton';
import EmptyState from '../src/components/common/EmptyState';
import SearchBar from '../src/components/common/SearchBar';
import FilterChips from '../src/components/common/FilterChips';
import SyncBadge from '../src/components/common/SyncBadge';
import LastUpdatedText from '../src/components/common/LastUpdatedText';
import FormInput from '../src/components/common/FormInput';
import DaySelector from '../src/components/schedule/DaySelector';
import StatusToggle from '../src/components/assignment/StatusToggle';
import AssignmentItem from '../src/components/assignment/AssignmentItem';
import GpaSummary from '../src/components/grade/GpaSummary';
import { currentDay } from '../src/utils/date';
import { calcGpa, toScale4 } from '../src/utils/gpa';
import { validateAssignment, validateProfile } from '../src/utils/validators';

let renderer;
async function mount(element) {
  await act(async () => {
    renderer = Renderer.create(element);
  });
  return renderer.root;
}
afterEach(async () => {
  await act(async () => renderer?.unmount());
});
test('button loading disables interaction and exposes busy state', async () => {
  const root = await mount(
    <AppButton title="Lưu" onPress={jest.fn()} loading />,
  );
  expect(
    root.findByProps({ accessibilityLabel: 'Lưu' }).props.accessibilityState
      .disabled,
  ).toBe(true);
  expect(
    root.findByProps({ accessibilityLabel: 'Lưu' }).props.accessibilityState
      .busy,
  ).toBe(true);
});
test('empty state only renders an action when callback exists', async () => {
  await mount(<EmptyState title="Trống" />);
  expect(renderer.root.findAllByType(AppButton)).toHaveLength(0);
  await act(async () =>
    renderer.update(<EmptyState title="Trống" onAction={jest.fn()} />),
  );
  expect(renderer.root.findAllByType(AppButton)).toHaveLength(1);
});
test('search clear calls callback with empty string', async () => {
  const change = jest.fn();
  const root = await mount(<SearchBar value="môn" onChangeText={change} />);
  root.findByProps({ accessibilityLabel: 'Xóa tìm kiếm' }).props.onPress();
  expect(change).toHaveBeenCalledWith('');
  expect(root.findByType(TextInput).props.value).toBe('môn');
});
test('filter selection and day defaults are controlled by props', async () => {
  const select = jest.fn();
  const root = await mount(<DaySelector onSelectDay={select} />);
  expect(root.findByType(FilterChips).props.selected).toBe(currentDay());
  expect(root.findByType(FilterChips).props.options).toHaveLength(7);
  root.findByProps({ accessibilityLabel: 'Chủ nhật' }).props.onPress();
  expect(select).toHaveBeenCalledWith(8);
});
test('status toggle supplies the next status in both directions', async () => {
  const toggle = jest.fn();
  await mount(<StatusToggle status="todo" onToggle={toggle} />);
  renderer.root
    .findByProps({ accessibilityLabel: 'Đánh dấu đã xong' })
    .props.onPress();
  expect(toggle).toHaveBeenLastCalledWith('done');
  await act(async () =>
    renderer.update(<StatusToggle status="done" onToggle={toggle} />),
  );
  renderer.root
    .findByProps({ accessibilityLabel: 'Đánh dấu chưa xong' })
    .props.onPress();
  expect(toggle).toHaveBeenLastCalledWith('todo');
});
test('pending badge and timestamps hide when absent', async () => {
  await mount(
    <>
      <SyncBadge />
      <LastUpdatedText />
    </>,
  );
  expect(renderer.toJSON()).toBeNull();
  await act(async () =>
    renderer.update(
      <>
        <SyncBadge pending />
        <LastUpdatedText
          timestamp={new Date(2026, 9, 26, 14, 32).toISOString()}
        />
      </>,
    ),
  );
  const text = JSON.stringify(renderer.toJSON());
  expect(text).toContain('Chưa đồng bộ');
  expect(text).toContain('14:32, 26/10/2026');
});
test('assignment includes status and pending badge; form exposes validation error', async () => {
  await mount(
    <AssignmentItem
      assignment={{
        title: 'Bài 1',
        status: 'todo',
        dueDate: '2020-01-01',
        course: { name: 'Toán' },
      }}
      pending
      onPress={jest.fn()}
      onToggleStatus={jest.fn()}
    />,
  );
  expect(renderer.root.findByType(SyncBadge).props.pending).toBe(true);
  expect(renderer.root.findByType(StatusToggle).props.status).toBe('todo');
  await act(async () =>
    renderer.update(
      <FormInput
        label="Email"
        value="x"
        onChangeText={jest.fn()}
        error="Email không hợp lệ"
      />,
    ),
  );
  expect(JSON.stringify(renderer.toJSON())).toContain('Email không hợp lệ');
});
test('GPA rounds to two decimals and weights credits including failures', async () => {
  const summary = calcGpa(
    [
      { courseId: 1, total: 9 },
      { courseId: 2, total: 3 },
    ],
    [
      { id: 1, credits: 3 },
      { id: 2, credits: 1 },
    ],
  );
  expect(summary).toEqual({ gpa: 3, totalCredits: 3 });
  expect(toScale4(8.4)).toBe(3.5);
  await mount(<GpaSummary {...summary} />);
  expect(JSON.stringify(renderer.toJSON())).toContain('3.00');
});
test('validators reject invalid dates, past due dates and empty required fields', () => {
  expect(validateAssignment({ title: '', dueDate: 'bad' })).toHaveProperty(
    'title',
  );
  expect(
    validateAssignment({ title: 'A', courseId: 1, dueDate: '2000-01-01' }),
  ).toHaveProperty('dueDate');
  expect(
    validateAssignment({ title: 'A', courseId: 1, dueDate: '2099-01-01' }),
  ).toEqual({});
  expect(validateProfile({ fullName: '', email: 'x' })).toHaveProperty('email');
});

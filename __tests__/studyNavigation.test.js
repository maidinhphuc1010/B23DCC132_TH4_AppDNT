import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import AppNavigator from '../src/navigation/AppNavigator';
import HomeStack from '../src/navigation/HomeStack';
import CourseStack from '../src/navigation/CourseStack';
import ScheduleStack from '../src/navigation/ScheduleStack';
import AssignmentStack from '../src/navigation/AssignmentStack';
import ProfileStack from '../src/navigation/ProfileStack';
import CourseDetailScreen from '../src/screens/courses/CourseDetailScreen';
import AssignmentFormScreen from '../src/screens/assignments/AssignmentFormScreen';
import EditProfileScreen from '../src/screens/profile/EditProfileScreen';
import AppButton from '../src/components/common/AppButton';
import FormInput from '../src/components/common/FormInput';
import FilterChips from '../src/components/common/FilterChips';
import { useAppData } from '../src/context/AppDataContext';
import { ROUTES } from '../src/navigation/routes';

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
  DefaultTheme: { colors: {} },
}));
jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: 'TabNavigator',
    Screen: 'TabScreen',
  }),
}));
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: 'StackNavigator',
    Screen: 'StackScreen',
  }),
}));
jest.mock('../src/context/AppDataContext', () => ({ useAppData: jest.fn() }));
jest.mock('../src/hooks/useCourseDetail', () => ({
  useCourseDetail: () => ({
    data: { id: 1, name: 'Lập trình' },
    refresh: jest.fn(),
  }),
}));
jest.mock('../src/hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({ isOnline: true }),
}));
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);
let renderer;
let data;
const query = value => ({
  data: value,
  loading: false,
  refreshing: false,
  error: null,
  refresh: jest.fn(),
});
beforeEach(() => {
  data = {
    assignments: query([
      { id: 1, status: 'todo' },
      { id: 2, status: 'done' },
    ]),
    courses: query([{ id: 1, name: 'Lập trình' }]),
    sessions: query([]),
    student: query({ fullName: 'An', email: 'an@example.com' }),
    saveAssignment: jest.fn().mockResolvedValue({ id: 3 }),
    saveStudent: jest.fn().mockResolvedValue({ id: 1 }),
  };
  useAppData.mockImplementation(() => data);
});
afterEach(async () => {
  await act(async () => renderer?.unmount());
});
async function mount(element) {
  await act(async () => {
    renderer = Renderer.create(element);
  });
}
test('five tabs have icons, labels, own stacks and live badge', async () => {
  await mount(<AppNavigator />);
  const tabs = renderer.root.findAllByType('TabScreen');
  expect(tabs.map(tab => tab.props.component)).toEqual([
    HomeStack,
    CourseStack,
    ScheduleStack,
    AssignmentStack,
    ProfileStack,
  ]);
  expect(tabs.map(tab => tab.props.options.title)).toEqual([
    'Tổng quan',
    'Môn học',
    'Thời khóa biểu',
    'Bài tập',
    'Cá nhân',
  ]);
  expect(tabs[3].props.options.tabBarBadge).toBe(1);
  const options = renderer.root.findByType('TabNavigator').props.screenOptions;
  for (const tab of tabs) {
    expect(
      options({ route: { name: tab.props.name } }).tabBarIcon({
        color: 'red',
        size: 24,
      }),
    ).toBeTruthy();
  }
  data.assignments.data[0].status = 'done';
  await act(async () => renderer.update(<AppNavigator />));
  expect(
    renderer.root.findAllByType('TabScreen')[3].props.options.tabBarBadge,
  ).toBeUndefined();
});
test('all stacks register required routes including home detail reuse', async () => {
  for (const [Stack, names] of [
    [HomeStack, [ROUTES.Home, ROUTES.CourseDetail, ROUTES.AssignmentDetail]],
    [CourseStack, [ROUTES.CourseList, ROUTES.CourseDetail]],
    [ScheduleStack, [ROUTES.Schedule, ROUTES.SessionDetail]],
    [
      AssignmentStack,
      [ROUTES.AssignmentList, ROUTES.AssignmentDetail, ROUTES.AssignmentForm],
    ],
    [
      ProfileStack,
      [
        ROUTES.Profile,
        ROUTES.EditProfile,
        ROUTES.GradeList,
        ROUTES.GradeDetail,
      ],
    ],
  ]) {
    await mount(<Stack />);
    expect(
      renderer.root
        .findAllByType('StackScreen')
        .map(screen => screen.props.name),
    ).toEqual(names);
    expect(
      renderer.root.findByType('StackNavigator').props.screenOptions
        .headerBackTitle,
    ).toBe('Quay lại');
    await act(async () => renderer.unmount());
  }
});
test('detail accepts id and sets title from fetched data', async () => {
  const navigation = { setOptions: jest.fn() };
  await mount(
    <CourseDetailScreen
      route={{ params: { id: 1 } }}
      navigation={navigation}
    />,
  );
  expect(navigation.setOptions).toHaveBeenCalledWith({ title: 'Lập trình' });
});

test('assignment form validates and only returns after successful save', async () => {
  const navigation = { setOptions: jest.fn(), goBack: jest.fn() };
  await mount(<AssignmentFormScreen navigation={navigation} />);
  await act(async () =>
    renderer.root
      .findAllByType(AppButton)
      .find(button => button.props.title === 'Lưu bài tập')
      .props.onPress(),
  );
  expect(data.saveAssignment).not.toHaveBeenCalled();
  await act(async () => {
    renderer.root.findAllByType(FormInput)[0].props.onChangeText('Bài mới');
    renderer.root
      .findByType(require('../src/components/common/DueDatePicker').default)
      .props.onChange('2099-12-30T23:59:00+07:00');
    renderer.root.findByType(FilterChips).props.onSelect(1);
  });
  await act(async () =>
    renderer.root
      .findAllByType(AppButton)
      .find(button => button.props.title === 'Lưu bài tập')
      .props.onPress(),
  );
  expect(data.saveAssignment).toHaveBeenCalledWith(
    expect.objectContaining({ title: 'Bài mới', courseId: 1, status: 'todo' }),
  );
  expect(navigation.goBack).toHaveBeenCalledTimes(1);
});
test('profile form stays open on failure and returns on success', async () => {
  const navigation = { setOptions: jest.fn(), goBack: jest.fn() };
  data.saveStudent.mockRejectedValueOnce(new Error('Mất mạng'));
  await mount(<EditProfileScreen navigation={navigation} />);
  await act(async () => renderer.root.findByType(AppButton).props.onPress());
  expect(navigation.goBack).not.toHaveBeenCalled();
  expect(JSON.stringify(renderer.toJSON())).toContain('Mất mạng');
  await act(async () =>
    renderer.root
      .findAllByType(AppButton)
      .find(button => button.props.title === 'Lưu thông tin')
      .props.onPress(),
  );
  expect(navigation.goBack).toHaveBeenCalledTimes(1);
});

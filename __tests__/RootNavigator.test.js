import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from '../src/navigation/RootNavigator';
import { HomeScreen } from '../src/screens/HomeScreen';
import { LearningProvider } from '../src/context/LearningContext';
import { MainTabNavigator } from '../src/navigation/MainTabNavigator';
import {
  SubjectsScreen,
  ScheduleScreen,
  AssignmentsScreen,
  ResultsScreen,
  AcademicResultDetailScreen,
  StudentProfileScreen,
} from '../src/screens/LearningScreens';
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);
test('starts the root native stack on Home with the shared light theme', async () => {
  let renderer;
  try {
    await act(async () => {
      renderer = Renderer.create(
        <LearningProvider>
          <RootNavigator />
        </LearningProvider>,
      );
    });
    expect(renderer.root.findAllByType(HomeScreen)).toHaveLength(1);
    const container = renderer.root.findByType(NavigationContainer);
    expect(container.props.theme.dark).toBe(false);
    expect(JSON.stringify(renderer.toJSON())).toContain('Quản lý học tập');
    const navigation =
      renderer.root.findByType(MainTabNavigator).props.navigation;
    for (const [screen, component] of [
      ['Subjects', SubjectsScreen],
      ['Schedule', ScheduleScreen],
      ['Assignments', AssignmentsScreen],
      ['Results', ResultsScreen],
    ]) {
      await act(async () => {
        navigation.navigate('MainTabs', { screen });
      });
      expect(renderer.root.findAllByType(component)).toHaveLength(1);
    }
    await act(async () => {
      navigation.navigate('AcademicResultDetail', {
        academicResultId: 'result-001',
      });
    });
    expect(
      renderer.root.findAllByType(AcademicResultDetailScreen),
    ).toHaveLength(1);
    await act(async () => navigation.goBack());
    await act(async () => {
      navigation.navigate('StudentProfile');
    });
    expect(renderer.root.findAllByType(StudentProfileScreen)).toHaveLength(1);
    await act(async () => {
      navigation.goBack();
    });
    expect(renderer.root.findAllByType(StudentProfileScreen)).toHaveLength(0);
  } finally {
    await act(async () => renderer?.unmount());
  }
});

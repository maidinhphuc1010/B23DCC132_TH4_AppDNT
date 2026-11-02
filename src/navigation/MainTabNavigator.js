import React from 'react';
import { Button } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { HomeScreen } from '../screens/HomeScreen';
import {
  SubjectsScreen,
  ScheduleScreen,
  AssignmentsScreen,
  ResultsScreen,
} from '../screens/LearningScreens';
import { theme } from '../theme';
const Tab = createBottomTabNavigator();
function ProfileButton() {
  const navigation = useNavigation();
  return (
    <Button
      title="Hồ sơ"
      color={theme.colors.primary}
      onPress={() => navigation.navigate('StudentProfile')}
    />
  );
}
export function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerTintColor: theme.colors.primary,
        headerStyle: { backgroundColor: theme.colors.surface },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarIconStyle: { display: 'none' },
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Tổng quan',
          headerRight: ProfileButton,
        }}
      />
      <Tab.Screen
        name="Subjects"
        component={SubjectsScreen}
        options={{ title: 'Môn học' }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{ title: 'Lịch học' }}
      />
      <Tab.Screen
        name="Assignments"
        component={AssignmentsScreen}
        options={{ title: 'Bài tập' }}
      />
      <Tab.Screen
        name="Results"
        component={ResultsScreen}
        options={{ title: 'Kết quả' }}
      />
    </Tab.Navigator>
  );
}

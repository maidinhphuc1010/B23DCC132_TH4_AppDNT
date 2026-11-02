import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStack from './HomeStack';
import CourseStack from './CourseStack';
import ScheduleStack from './ScheduleStack';
import AssignmentStack from './AssignmentStack';
import ProfileStack from './ProfileStack';
import { ROUTES } from './routes';
import { useAppData } from '../context/AppDataContext';
import colors from '../theme/colors';
import spacing from '../theme/spacing';
import typography from '../theme/typography';

const Tab = createBottomTabNavigator();
const icons = {
  [ROUTES.HomeTab]: '⌂',
  [ROUTES.CourseTab]: '▤',
  [ROUTES.ScheduleTab]: '▦',
  [ROUTES.AssignmentTab]: '☑',
  [ROUTES.ProfileTab]: '●',
};
const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};
const screenOptions = ({ route }) => ({
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarItemStyle: styles.tab,
  tabBarLabelStyle: styles.label,
  tabBarIcon: ({ color, size }) => (
    <Text accessible={false} style={[styles.icon, { color, fontSize: size }]}>
      {icons[route.name]}
    </Text>
  ),
});
export default function AppNavigator() {
  const { assignments } = useAppData();
  const pending = (assignments.data || []).filter(
    item => item.status !== 'done',
  ).length;
  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen
          name={ROUTES.HomeTab}
          component={HomeStack}
          options={{
            title: 'Tổng quan',
            tabBarAccessibilityLabel: 'Tổng quan',
          }}
        />
        <Tab.Screen
          name={ROUTES.CourseTab}
          component={CourseStack}
          options={{ title: 'Môn học', tabBarAccessibilityLabel: 'Môn học' }}
        />
        <Tab.Screen
          name={ROUTES.ScheduleTab}
          component={ScheduleStack}
          options={{
            title: 'Thời khóa biểu',
            tabBarAccessibilityLabel: 'Thời khóa biểu',
          }}
        />
        <Tab.Screen
          name={ROUTES.AssignmentTab}
          component={AssignmentStack}
          options={{
            title: 'Bài tập',
            tabBarAccessibilityLabel: 'Bài tập',
            tabBarBadge: pending || undefined,
          }}
        />
        <Tab.Screen
          name={ROUTES.ProfileTab}
          component={ProfileStack}
          options={{ title: 'Cá nhân', tabBarAccessibilityLabel: 'Cá nhân' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
const styles = StyleSheet.create({
  tab: { minHeight: spacing.touch, minWidth: spacing.touch },
  label: { ...typography.caption },
  icon: { ...typography.h3 },
});

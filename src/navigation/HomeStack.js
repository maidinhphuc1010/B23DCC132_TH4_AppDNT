import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import CourseDetailScreen from '../screens/courses/CourseDetailScreen';
import AssignmentDetailScreen from '../screens/assignments/AssignmentDetailScreen';
import { ROUTES } from './routes';
import stackOptions from './stackOptions';
const Stack = createNativeStackNavigator();
export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen
        name={ROUTES.Home}
        component={HomeScreen}
        options={{ title: 'Tổng quan' }}
      />
      <Stack.Screen name={ROUTES.CourseDetail} component={CourseDetailScreen} />
      <Stack.Screen
        name={ROUTES.AssignmentDetail}
        component={AssignmentDetailScreen}
      />
    </Stack.Navigator>
  );
}

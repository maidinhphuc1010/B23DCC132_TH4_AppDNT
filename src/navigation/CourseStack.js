import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CourseListScreen from '../screens/courses/CourseListScreen';
import CourseDetailScreen from '../screens/courses/CourseDetailScreen';
import { ROUTES } from './routes';
import stackOptions from './stackOptions';
const Stack = createNativeStackNavigator();
export default function CourseStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen
        name={ROUTES.CourseList}
        component={CourseListScreen}
        options={{ title: 'Môn học' }}
      />
      <Stack.Screen name={ROUTES.CourseDetail} component={CourseDetailScreen} />
    </Stack.Navigator>
  );
}

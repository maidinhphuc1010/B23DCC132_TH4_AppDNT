import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ScheduleScreen from '../screens/schedule/ScheduleScreen';
import SessionDetailScreen from '../screens/schedule/SessionDetailScreen';
import { ROUTES } from './routes';
import stackOptions from './stackOptions';
const Stack = createNativeStackNavigator();
export default function ScheduleStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen
        name={ROUTES.Schedule}
        component={ScheduleScreen}
        options={{ title: 'Thời khóa biểu' }}
      />
      <Stack.Screen
        name={ROUTES.SessionDetail}
        component={SessionDetailScreen}
      />
    </Stack.Navigator>
  );
}

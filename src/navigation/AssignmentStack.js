import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AssignmentListScreen from '../screens/assignments/AssignmentListScreen';
import AssignmentDetailScreen from '../screens/assignments/AssignmentDetailScreen';
import AssignmentFormScreen from '../screens/assignments/AssignmentFormScreen';
import { ROUTES } from './routes';
import stackOptions from './stackOptions';
const Stack = createNativeStackNavigator();
export default function AssignmentStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen
        name={ROUTES.AssignmentList}
        component={AssignmentListScreen}
        options={{ title: 'Bài tập' }}
      />
      <Stack.Screen
        name={ROUTES.AssignmentDetail}
        component={AssignmentDetailScreen}
      />
      <Stack.Screen
        name={ROUTES.AssignmentForm}
        component={AssignmentFormScreen}
      />
    </Stack.Navigator>
  );
}

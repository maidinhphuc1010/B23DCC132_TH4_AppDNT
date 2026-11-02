import React, { useState } from 'react';
import { FlatList } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import EmptyState from '../../components/common/EmptyState';
import QueryStatus from '../../components/common/QueryStatus';
import DaySelector from '../../components/schedule/DaySelector';
import SessionCard from '../../components/schedule/SessionCard';
import { useAppData } from '../../context/AppDataContext';
import { ROUTES } from '../../navigation/routes';
import { currentDay } from '../../utils/date';

/** @param {{navigation: object}} props */
export default function ScheduleScreen({ navigation }) {
  const { sessions } = useAppData();
  const [day, setDay] = useState(currentDay);
  return (
    <ScreenContainer>
      <DaySelector selectedDay={day} onSelectDay={setDay} />
      <FlatList
        data={(sessions.data || []).filter(item => item.dayOfWeek === day)}
        keyExtractor={item => String(item.id)}
        refreshing={sessions.refreshing}
        onRefresh={sessions.refresh}
        ListHeaderComponent={<QueryStatus query={sessions} />}
        ListEmptyComponent={
          !sessions.loading && (
            <EmptyState title="Không có buổi học trong ngày" />
          )
        }
        renderItem={({ item }) => (
          <SessionCard
            session={item}
            onPress={() =>
              navigation.navigate(ROUTES.SessionDetail, { id: item.id })
            }
          />
        )}
      />
    </ScreenContainer>
  );
}

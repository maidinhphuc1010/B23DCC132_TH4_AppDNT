import React, { useState } from 'react';
import { FlatList } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import EmptyState from '../../components/common/EmptyState';
import QueryStatus from '../../components/common/QueryStatus';
import FilterChips from '../../components/common/FilterChips';
import GradeRow from '../../components/grade/GradeRow';
import GpaSummary from '../../components/grade/GpaSummary';
import { useAppData } from '../../context/AppDataContext';
import { ROUTES } from '../../navigation/routes';
import { calcGpa } from '../../utils/gpa';

/** @param {{navigation: object}} props */
export default function GradeListScreen({ navigation }) {
  const { grades, courses } = useAppData();
  const [semester, setSemester] = useState('all');
  const options = [
    { value: 'all', label: 'Tất cả học kỳ' },
    ...[...new Set((grades.data || []).map(item => item.semester))].map(
      value => ({ value, label: value }),
    ),
  ];
  const data = (grades.data || []).filter(
    item => semester === 'all' || item.semester === semester,
  );
  return (
    <ScreenContainer>
      <FilterChips
        options={options}
        selected={semester}
        onSelect={setSemester}
      />
      <GpaSummary {...calcGpa(data, courses.data || [])} />
      <FlatList
        data={data}
        keyExtractor={item => String(item.id)}
        refreshing={grades.refreshing}
        onRefresh={grades.refresh}
        ListHeaderComponent={<QueryStatus query={grades} />}
        ListEmptyComponent={
          !grades.loading && <EmptyState title="Chưa có kết quả học tập" />
        }
        renderItem={({ item }) => (
          <GradeRow
            grade={item}
            onPress={() =>
              navigation.navigate(ROUTES.GradeDetail, { id: item.id })
            }
          />
        )}
      />
    </ScreenContainer>
  );
}

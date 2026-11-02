import React, { useState } from 'react';
import { FlatList } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import SearchBar from '../../components/common/SearchBar';
import FilterChips from '../../components/common/FilterChips';
import EmptyState from '../../components/common/EmptyState';
import QueryStatus from '../../components/common/QueryStatus';
import CourseCard from '../../components/course/CourseCard';
import { useAppData } from '../../context/AppDataContext';
import { ROUTES } from '../../navigation/routes';

/** @param {{navigation: object}} props */
export default function CourseListScreen({ navigation }) {
  const { courses } = useAppData();
  const [search, setSearch] = useState('');
  const [semester, setSemester] = useState('all');
  const options = [
    { value: 'all', label: 'Tất cả học kỳ' },
    ...[...new Set((courses.data || []).map(item => item.semester))].map(
      value => ({ value, label: value }),
    ),
  ];
  const data = (courses.data || []).filter(
    item =>
      item.name
        .toLocaleLowerCase('vi')
        .includes(search.toLocaleLowerCase('vi')) &&
      (semester === 'all' || item.semester === semester),
  );
  return (
    <ScreenContainer>
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Tìm tên môn học"
      />
      <FilterChips
        options={options}
        selected={semester}
        onSelect={setSemester}
      />
      <FlatList
        data={data}
        keyExtractor={item => String(item.id)}
        refreshing={courses.refreshing}
        onRefresh={courses.refresh}
        ListHeaderComponent={<QueryStatus query={courses} />}
        ListEmptyComponent={
          !courses.loading && (
            <EmptyState
              title="Không có môn học"
              description="Thử đổi từ khóa hoặc học kỳ."
            />
          )
        }
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            onPress={() =>
              navigation.navigate(ROUTES.CourseDetail, { id: item.id })
            }
          />
        )}
      />
    </ScreenContainer>
  );
}

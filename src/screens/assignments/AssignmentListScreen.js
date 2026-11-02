import React, { useState } from 'react';
import { FlatList } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import EmptyState from '../../components/common/EmptyState';
import QueryStatus from '../../components/common/QueryStatus';
import AppButton from '../../components/common/AppButton';
import ErrorView from '../../components/common/ErrorView';
import FilterChips from '../../components/common/FilterChips';
import AssignmentItem from '../../components/assignment/AssignmentItem';
import { useAppData } from '../../context/AppDataContext';
import { useMutation } from '../../hooks/useMutation';
import { ROUTES } from '../../navigation/routes';
import { isOverdue } from '../../utils/date';

/** @param {{navigation: object}} props */
export default function AssignmentListScreen({ navigation }) {
  const { assignments, saveAssignment } = useAppData();
  const [filter, setFilter] = useState('all');
  const mutation = useMutation();
  const data = (assignments.data || []).filter(
    item =>
      filter === 'all' ||
      (filter === 'overdue' ? isOverdue(item) : item.status === filter),
  );
  return (
    <ScreenContainer>
      <AppButton
        title="Thêm bài tập"
        onPress={() => navigation.navigate(ROUTES.AssignmentForm)}
      />
      <FilterChips
        options={[
          { value: 'all', label: 'Tất cả' },
          { value: 'todo', label: 'Chưa xong' },
          { value: 'done', label: 'Đã xong' },
          { value: 'overdue', label: 'Quá hạn' },
        ]}
        selected={filter}
        onSelect={setFilter}
      />
      {mutation.error ? (
        <ErrorView message={mutation.error} onRetry={assignments.refresh} />
      ) : null}
      <FlatList
        data={data}
        keyExtractor={item => String(item.id)}
        refreshing={assignments.refreshing}
        onRefresh={assignments.refresh}
        ListHeaderComponent={<QueryStatus query={assignments} />}
        ListEmptyComponent={
          !assignments.loading && <EmptyState title="Không có bài tập" />
        }
        renderItem={({ item }) => (
          <AssignmentItem
            assignment={item}
            pending={!!item.pending}
            onPress={() =>
              navigation.navigate(ROUTES.AssignmentDetail, { id: item.id })
            }
            onToggleStatus={status =>
              mutation.run(() => saveAssignment({ status }, item.id))
            }
          />
        )}
      />
    </ScreenContainer>
  );
}

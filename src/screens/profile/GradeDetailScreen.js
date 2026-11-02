import React from 'react';
import ScreenContainer from '../../components/common/ScreenContainer';
import QueryStatus from '../../components/common/QueryStatus';
import EmptyState from '../../components/common/EmptyState';
import InfoRow from '../../components/profile/InfoRow';
import { useRecordDetail } from '../../hooks/useRecordDetail';
import { useScreenTitle } from '../../hooks/useScreenTitle';

/** @param {{navigation: object, route: {params: {id: string|number}}}} props */
export default function GradeDetailScreen({ navigation, route }) {
  const grades = useRecordDetail('grades', route.params.id);
  const grade = grades.data;
  useScreenTitle(navigation, grade?.course?.name || 'Chi tiết kết quả học tập');
  return (
    <ScreenContainer scroll>
      <QueryStatus query={grades} />
      {grade ? (
        <>
          {[
            ['semester', 'Học kỳ'],
            ['attendance', 'Chuyên cần'],
            ['midterm', 'Giữa kỳ'],
            ['final', 'Cuối kỳ'],
            ['total', 'Tổng kết'],
            ['letter', 'Điểm chữ'],
          ].map(([field, label]) => (
            <InfoRow key={field} label={label} value={grade[field]} />
          ))}
        </>
      ) : (
        !grades.loading && <EmptyState title="Không tìm thấy kết quả" />
      )}
    </ScreenContainer>
  );
}

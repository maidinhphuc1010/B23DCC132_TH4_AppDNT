import React from 'react';
import ScreenContainer from '../../components/common/ScreenContainer';
import QueryStatus from '../../components/common/QueryStatus';
import EmptyState from '../../components/common/EmptyState';
import InfoRow from '../../components/profile/InfoRow';
import { useCourseDetail } from '../../hooks/useCourseDetail';
import { useScreenTitle } from '../../hooks/useScreenTitle';
import { useAppData } from '../../context/AppDataContext';
import { formatDateTime } from '../../utils/date';

/** @param {{navigation: object, route: {params: {id: string|number}}}} props */
export default function CourseDetailScreen({ navigation, route }) {
  const { id } = route.params;
  const query = useCourseDetail(id);
  const { courses, sessions, assignments } = useAppData();
  const course =
    query.data || courses.data?.find(item => String(item.id) === String(id));
  useScreenTitle(navigation, course?.name || 'Chi tiết môn học');
  return (
    <ScreenContainer scroll>
      <QueryStatus query={query} />
      {course ? (
        <>
          <InfoRow label="Mã môn" value={course.code} />
          <InfoRow label="Tên môn" value={course.name} />
          <InfoRow label="Tín chỉ" value={course.credits} />
          <InfoRow label="Giảng viên" value={course.lecturer} />
          <InfoRow label="Mô tả" value={course.description} />
          <InfoRow label="Học kỳ" value={course.semester} />
          <QueryStatus query={sessions} />
          {(sessions.data || [])
            .filter(item => String(item.courseId) === String(id))
            .map(item => (
              <InfoRow
                key={item.id}
                label={
                  item.dayOfWeek === 8 ? 'Chủ nhật' : `Thứ ${item.dayOfWeek}`
                }
                value={`${item.startTime} – ${item.endTime}, ${item.room}`}
              />
            ))}
          <QueryStatus query={assignments} />
          {(assignments.data || [])
            .filter(item => String(item.courseId) === String(id))
            .map(item => (
              <InfoRow
                key={item.id}
                label={item.title}
                value={formatDateTime(item.dueDate)}
              />
            ))}
        </>
      ) : (
        !query.loading && <EmptyState title="Không tìm thấy môn học" />
      )}
    </ScreenContainer>
  );
}

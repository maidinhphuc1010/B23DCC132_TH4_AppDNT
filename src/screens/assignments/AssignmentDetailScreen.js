import React from 'react';
import { useRecordDetail } from '../../hooks/useRecordDetail';
import ScreenContainer from '../../components/common/ScreenContainer';
import QueryStatus from '../../components/common/QueryStatus';
import EmptyState from '../../components/common/EmptyState';
import ErrorView from '../../components/common/ErrorView';
import InfoRow from '../../components/profile/InfoRow';
import StatusToggle from '../../components/assignment/StatusToggle';
import SyncBadge from '../../components/common/SyncBadge';
import { useAppData } from '../../context/AppDataContext';
import { useScreenTitle } from '../../hooks/useScreenTitle';
import { useMutation } from '../../hooks/useMutation';
import { formatDateTime } from '../../utils/date';

/** @param {{navigation: object, route: {params: {id: string|number}}}} props */
export default function AssignmentDetailScreen({ navigation, route }) {
  const { assignments, saveAssignment } = useAppData();
  const detail = useRecordDetail('assignments', route.params.id);
  const assignment =
    assignments.data?.find(
      item => String(item.id) === String(route.params.id),
    ) || detail.data;
  const mutation = useMutation();
  useScreenTitle(navigation, assignment?.title || 'Chi tiết bài tập');
  return (
    <ScreenContainer scroll>
      <QueryStatus query={detail} />
      {mutation.error ? (
        <ErrorView message={mutation.error} onRetry={assignments.refresh} />
      ) : null}
      {assignment ? (
        <>
          <InfoRow label="Tiêu đề" value={assignment.title} />
          <InfoRow label="Môn học" value={assignment.course?.name} />
          <InfoRow label="Mô tả" value={assignment.description} />
          <InfoRow label="Hạn nộp" value={formatDateTime(assignment.dueDate)} />
          <StatusToggle
            status={assignment.status}
            onToggle={status =>
              mutation.run(() =>
                saveAssignment({ status }, assignment.id, assignment),
              )
            }
          />
          <SyncBadge pending={!!assignment.pending} />
        </>
      ) : (
        !detail.loading &&
        !detail.error && <EmptyState title="Không tìm thấy bài tập" />
      )}
    </ScreenContainer>
  );
}

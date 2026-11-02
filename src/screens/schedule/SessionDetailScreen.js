import React from 'react';
import ScreenContainer from '../../components/common/ScreenContainer';
import QueryStatus from '../../components/common/QueryStatus';
import EmptyState from '../../components/common/EmptyState';
import InfoRow from '../../components/profile/InfoRow';
import { useRecordDetail } from '../../hooks/useRecordDetail';
import { useScreenTitle } from '../../hooks/useScreenTitle';

/** @param {{navigation: object, route: {params: {id: string|number}}}} props */
export default function SessionDetailScreen({ navigation, route }) {
  const sessions = useRecordDetail('sessions', route.params.id);
  const session = sessions.data;
  useScreenTitle(navigation, session?.course?.name || 'Chi tiết buổi học');
  return (
    <ScreenContainer scroll>
      <QueryStatus query={sessions} />
      {session ? (
        <>
          <InfoRow label="Môn học" value={session.course?.name} />
          <InfoRow
            label="Ngày học"
            value={
              session.dayOfWeek === 8 ? 'Chủ nhật' : `Thứ ${session.dayOfWeek}`
            }
          />
          <InfoRow
            label="Thời gian"
            value={`${session.startTime} – ${session.endTime}`}
          />
          <InfoRow label="Phòng" value={session.room} />
          <InfoRow label="Ghi chú" value={session.note} />
        </>
      ) : (
        !sessions.loading && <EmptyState title="Không tìm thấy buổi học" />
      )}
    </ScreenContainer>
  );
}

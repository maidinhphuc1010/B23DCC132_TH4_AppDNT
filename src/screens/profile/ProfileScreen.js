import React from 'react';
import ScreenContainer from '../../components/common/ScreenContainer';
import QueryStatus from '../../components/common/QueryStatus';
import AppButton from '../../components/common/AppButton';
import InfoRow from '../../components/profile/InfoRow';
import GpaSummary from '../../components/grade/GpaSummary';
import { useAppData } from '../../context/AppDataContext';
import { ROUTES } from '../../navigation/routes';
import { calcGpa } from '../../utils/gpa';

/** @param {{navigation: object}} props */
export default function ProfileScreen({ navigation }) {
  const { student, grades, courses } = useAppData();
  return (
    <ScreenContainer scroll>
      <QueryStatus query={student} />
      {student.data ? (
        <>
          {[
            ['studentCode', 'Mã sinh viên'],
            ['fullName', 'Họ tên'],
            ['className', 'Lớp'],
            ['major', 'Ngành'],
            ['email', 'Email'],
            ['phone', 'Số điện thoại'],
          ].map(([field, label]) => (
            <InfoRow key={field} label={label} value={student.data[field]} />
          ))}
          <AppButton
            title="Chỉnh sửa thông tin"
            onPress={() => navigation.navigate(ROUTES.EditProfile)}
          />
        </>
      ) : null}
      <QueryStatus query={grades} />
      <GpaSummary {...calcGpa(grades.data || [], courses.data || [])} />
      <AppButton
        title="Kết quả học tập"
        onPress={() => navigation.navigate(ROUTES.GradeList)}
      />
    </ScreenContainer>
  );
}

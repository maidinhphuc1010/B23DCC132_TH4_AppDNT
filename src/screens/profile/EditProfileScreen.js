import React, { useState } from 'react';
import ScreenContainer from '../../components/common/ScreenContainer';
import FormInput from '../../components/common/FormInput';
import QueryStatus from '../../components/common/QueryStatus';
import ErrorView from '../../components/common/ErrorView';
import AppButton from '../../components/common/AppButton';
import { useAppData } from '../../context/AppDataContext';
import { useMutation } from '../../hooks/useMutation';
import { useScreenTitle } from '../../hooks/useScreenTitle';
import { validateProfile } from '../../utils/validators';

/** @param {{navigation: object}} props */
export default function EditProfileScreen({ navigation }) {
  const { student, saveStudent } = useAppData();
  const [changes, setChanges] = useState({});
  const [errors, setErrors] = useState({});
  const mutation = useMutation();
  const form = { ...student.data, ...changes };
  useScreenTitle(navigation, 'Chỉnh sửa thông tin');
  function save() {
    const nextErrors = validateProfile(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      return;
    }
    mutation.run(
      () => saveStudent(changes),
      () => navigation.goBack(),
    );
  }
  return (
    <ScreenContainer scroll>
      <QueryStatus query={student} />
      {[
        ['fullName', 'Họ tên', 'default'],
        ['className', 'Lớp', 'default'],
        ['major', 'Ngành', 'default'],
        ['email', 'Email', 'email-address'],
        ['phone', 'Số điện thoại', 'phone-pad'],
      ].map(([field, label, keyboardType]) => (
        <FormInput
          key={field}
          label={label}
          value={form[field] || ''}
          onChangeText={value =>
            setChanges(previous => ({ ...previous, [field]: value }))
          }
          error={errors[field]}
          keyboardType={keyboardType}
        />
      ))}
      {mutation.error ? (
        <ErrorView message={mutation.error} onRetry={save} />
      ) : null}
      <AppButton
        title="Lưu thông tin"
        onPress={save}
        loading={mutation.saving}
        disabled={!student.data}
      />
    </ScreenContainer>
  );
}

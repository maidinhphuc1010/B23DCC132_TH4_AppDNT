import React, { useState } from 'react';
import ScreenContainer from '../../components/common/ScreenContainer';
import FormInput from '../../components/common/FormInput';
import DueDatePicker from '../../components/common/DueDatePicker';
import FilterChips from '../../components/common/FilterChips';
import QueryStatus from '../../components/common/QueryStatus';
import ErrorView from '../../components/common/ErrorView';
import AppButton from '../../components/common/AppButton';
import { useAppData } from '../../context/AppDataContext';
import { useMutation } from '../../hooks/useMutation';
import { useScreenTitle } from '../../hooks/useScreenTitle';
import { validateAssignment } from '../../utils/validators';

/** @param {{navigation: object}} props */
export default function AssignmentFormScreen({ navigation }) {
  const { courses, saveAssignment } = useAppData();
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    courseId: '',
  });
  const [errors, setErrors] = useState({});
  const mutation = useMutation();
  useScreenTitle(navigation, 'Thêm bài tập');
  const change = (field, value) =>
    setForm(previous => ({ ...previous, [field]: value }));
  function save() {
    const nextErrors = validateAssignment(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      return;
    }
    mutation.run(
      () =>
        saveAssignment({
          ...form,
          title: form.title.trim(),
          dueDate: new Date(form.dueDate).toISOString(),
          status: 'todo',
        }),
      () => navigation.goBack(),
    );
  }
  return (
    <ScreenContainer scroll>
      <QueryStatus query={courses} />
      <FormInput
        label="Tiêu đề"
        value={form.title}
        onChangeText={value => change('title', value)}
        error={errors.title}
      />
      <FormInput
        label="Mô tả"
        value={form.description}
        onChangeText={value => change('description', value)}
      />
      <FilterChips
        options={(courses.data || []).map(course => ({
          value: course.id,
          label: course.name,
        }))}
        selected={form.courseId}
        onSelect={value => change('courseId', value)}
      />
      {errors.courseId ? (
        <ErrorView message={errors.courseId} onRetry={courses.refresh} />
      ) : null}
      <DueDatePicker
        value={form.dueDate}
        onChange={value => change('dueDate', value)}
        error={errors.dueDate}
      />
      {mutation.error ? (
        <ErrorView message={mutation.error} onRetry={save} />
      ) : null}
      <AppButton title="Lưu bài tập" onPress={save} loading={mutation.saving} />
    </ScreenContainer>
  );
}

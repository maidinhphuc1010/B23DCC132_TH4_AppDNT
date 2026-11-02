import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import AppButton from './AppButton';
import FormInput from './FormInput';
import colors from '../../theme/colors';
/** Calendar using local time; no platform-specific dependency. */
export default function DueDatePicker({ value, onChange, error }) {
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [time, setTime] = useState('23:59');
  const selected = value ? new Date(value) : null;
  function choose(day, clock = time) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(clock)) {
      return;
    }
    const [hours, minutes] = clock.split(':').map(Number);
    onChange(
      new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        hours,
        minutes,
      ).toISOString(),
    );
  }
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return (
    <View>
      <Text>
        Hạn nộp — tháng {month.getMonth() + 1}/{month.getFullYear()}
      </Text>
      <View style={styles.row}>
        <AppButton
          title="Tháng trước"
          onPress={() =>
            setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
          }
        />
        <AppButton
          title="Tháng sau"
          onPress={() =>
            setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
          }
        />
      </View>
      <View style={styles.row}>
        {Array.from({ length: days }, (_, index) => {
          const day = new Date(
            month.getFullYear(),
            month.getMonth(),
            index + 1,
          );
          const active = selected?.toDateString() === day.toDateString();
          return (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityLabel={`Ngày ${index + 1}/${
                month.getMonth() + 1
              }/${month.getFullYear()}`}
              accessibilityState={{ selected: active }}
              onPress={() => choose(day)}
              style={[styles.day, active && styles.selected]}
            >
              <Text>{index + 1}</Text>
            </Pressable>
          );
        })}
      </View>
      <FormInput
        label="Giờ nộp (HH:mm)"
        value={time}
        onChangeText={text => {
          setTime(text);
          if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(text)) {
            onChange('');
          } else if (selected) {
            choose(selected, text);
          }
        }}
        error={
          !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
            ? 'Giờ phải có dạng HH:mm (00:00–23:59).'
            : error
        }
      />
      <Text>
        {selected ? selected.toLocaleString('vi-VN') : 'Chưa chọn ngày nộp'}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  day: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: { backgroundColor: colors.border },
});

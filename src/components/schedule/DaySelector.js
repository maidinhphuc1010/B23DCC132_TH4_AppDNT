import React from 'react';
import FilterChips from '../common/FilterChips';
import { currentDay } from '../../utils/date';

/** @param {{selectedDay?: number, onSelectDay: Function}} props */
export default function DaySelector({
  selectedDay = currentDay(),
  onSelectDay,
}) {
  return (
    <FilterChips
      options={[2, 3, 4, 5, 6, 7, 8].map(day => ({
        value: day,
        label: day === 8 ? 'Chủ nhật' : `Thứ ${day}`,
      }))}
      selected={selectedDay}
      onSelect={onSelectDay}
    />
  );
}

import { TextInput } from 'flowbite-react';
import { DateTime } from 'luxon';
import { FC, useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';

import { DATETIME_FORMAT, TIME_FORMAT } from '#fe/constants';

export interface FutureTimePickerProps {
  id?: string;
  value?: Date;
  onChange: (date: Date) => void;
}

const useFutureTimePickerFacade = ({ value, onChange }: FutureTimePickerProps) => {
  const [date, setDate] = useState<Date>(null);
  const [dateTime, setDateTime] = useState<Date>(null);
  const minTime = useMemo(() => {
    const now = DateTime.now();
    const dateInput = DateTime.fromJSDate(date);
    if (!date || now.hasSame(dateInput, 'day')) {
      // 今日のときは、現在時刻以降を開放
      // ライブラリ側が分単位でしか指定できないようなので、1 分後としている
      return now.plus({ minute: 1 }).startOf('minute').toJSDate();
    } else {
      // それ以外のときは、全時刻を開放
      return dateInput.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toJSDate();
    }
  }, [date]);
  const maxTime = useMemo(() => new Date(9999, 12, 31, 23, 59, 59, 999), []);

  useEffect(() => {
    if (!dateTime) return;

    if (+dateTime < +new Date()) {
      // 過去の日時の修正
      const ms = 60000 * 15; // 15 分毎
      const newDateTime = new Date(Math.ceil(+new Date() / ms) * ms);
      setDateTime(newDateTime);
      onChange(newDateTime);
    } else {
      // そのまま反映
      onChange(dateTime);
    }
  }, [dateTime]);

  useEffect(() => {
    if (!value) return;

    setDate(value);
    setDateTime(value);
  }, [value]);

  return { setDate, setDateTime, minTime, maxTime };
};

export const FutureTimePicker: FC<FutureTimePickerProps> = (props) => {
  const { id, value } = props;

  const { setDate, setDateTime, minTime, maxTime } = useFutureTimePickerFacade(props);

  return (
    <DatePicker
      id={id}
      selected={value}
      onSelect={setDate}
      onChange={setDateTime}
      showTimeSelect
      timeFormat={TIME_FORMAT}
      dateFormat={DATETIME_FORMAT}
      timeIntervals={15}
      minDate={new Date()}
      minTime={minTime}
      maxTime={maxTime}
      popperProps={{ strategy: 'fixed' }}
      customInput={<TextInput />}
    />
  );
};

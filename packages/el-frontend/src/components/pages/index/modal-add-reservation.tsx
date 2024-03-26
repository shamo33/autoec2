import { Button, Label, Modal, Select, Spinner } from 'flowbite-react';
import { FC, SyntheticEvent, useCallback, useId, useState } from 'react';

import { FutureTimePicker } from '#fe/components/pages/index/future-time-picker';
import { ModalBase } from '#fe/components/pages/index/modal-base';
import type { PostEventDto } from '#types/dto/event';

export interface ModalAddReservationProps {
  onClose?: () => void;
  onSubmit?: (data: PostEventDto) => void;
  show?: boolean;
  processing?: boolean;
}

const useModalAddReservationFacade = ({ onSubmit }: ModalAddReservationProps) => {
  const typeDomId = useId();
  const dateTimeDomId = useId();

  const [dateTime, setDateTime] = useState<Date>(null);
  const [reservationType, setReservationType] = useState<string>('startup');
  const onReservationTypeChange = useCallback((ev: SyntheticEvent<HTMLSelectElement, Event>) => {
    console.log(ev.currentTarget.value);
    setReservationType(ev.currentTarget.value);
  }, []);

  const [showInvalidDateError, setShowInvalidDateError] = useState(false);
  const wrappedOnSubmit = useCallback(() => {
    if (!dateTime || +dateTime < +Date.now()) {
      setShowInvalidDateError(true);
      return;
    }

    setShowInvalidDateError(false);
    onSubmit &&
      onSubmit({
        startup: reservationType === 'startup',
        dateTime: dateTime.toISOString(),
      });
  }, [dateTime, onSubmit]);

  return {
    dateTime,
    onDateTimeChange: setDateTime,
    onReservationTypeChange,
    onSubmit: wrappedOnSubmit,
    typeDomId,
    dateTimeDomId,
    showInvalidDateError,
  };
};

export const ModalAddReservation: FC<ModalAddReservationProps> = (props) => {
  const { show, onClose, processing } = props;
  const {
    dateTime,
    onDateTimeChange,
    onReservationTypeChange,
    onSubmit,
    typeDomId,
    dateTimeDomId,
    showInvalidDateError,
  } = useModalAddReservationFacade(props);

  return (
    <ModalBase show={show} onClose={onClose} className="h-full">
      <Modal.Header>予約の追加</Modal.Header>
      <Modal.Body>
        <div className="flex flex-col gap-2">
          <Label htmlFor={typeDomId}>予約種別</Label>
          <Select id={typeDomId} onChange={onReservationTypeChange}>
            <option value="startup">起動</option>
            <option value="shutdown">停止</option>
          </Select>
          <Label htmlFor={dateTimeDomId} className="mt-4">
            日時
          </Label>
          <FutureTimePicker id={dateTimeDomId} value={dateTime} onChange={onDateTimeChange} />
          {showInvalidDateError && (
            <Label htmlFor={dateTimeDomId} className="text-red-500">
              未来の日時を指定してください
            </Label>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer className="flex flex-row justify-end">
        <Button className="w-20 min-w-fit" pill={true} onClick={onSubmit} disabled={processing}>
          {processing ? <Spinner size="sm" aria-label="処理中" /> : '追加'}
        </Button>
        <Button color="light" pill={true} onClick={onClose} disabled={processing}>
          キャンセル
        </Button>
      </Modal.Footer>
    </ModalBase>
  );
};

import { Button, Modal, Spinner } from 'flowbite-react';
import { DateTime } from 'luxon';
import { FC, useCallback } from 'react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

import { BadgeReservationType } from '#fe/components/pages/index/badge-reservation-type';
import { ModalBase } from '#fe/components/pages/index/modal-base';
import { DATETIME_FORMAT } from '#fe/constants';
import type { GetEventDto } from '#types/dto/event';

export interface ModalDeleteReservationProps {
  event: GetEventDto;
  onClose?: () => void;
  onSubmit?: (name: string) => void;
  show?: boolean;
  processing?: boolean;
}

const useModalDeleteReservationFacade = ({ event, onSubmit }: ModalDeleteReservationProps) => {
  const wrappedOnSubmit = useCallback(() => {
    onSubmit && onSubmit(event.name);
  }, [event, onSubmit]);

  return {
    onSubmit: wrappedOnSubmit,
  };
};

export const ModalDeleteReservation: FC<ModalDeleteReservationProps> = (props) => {
  const { show, onClose, processing, event } = props;
  const { onSubmit } = useModalDeleteReservationFacade(props);

  return (
    <ModalBase show={show} onClose={onClose} className="h-full">
      <Modal.Body>
        <HiOutlineExclamationCircle className="mx-auto mb-4 h-20 w-20 text-gray-400 dark:text-gray-200" />
        <dl className="flex flex-row items-center">
          <dt className="w-24">予約種別:</dt>
          <dd>
            <BadgeReservationType startup={event.startup} />
          </dd>
        </dl>
        <dl className="flex flex-row items-center">
          <dt className="w-24">日時:</dt>
          <dd>{DateTime.fromISO(event.dateTime).toFormat(DATETIME_FORMAT)}</dd>
        </dl>
        <p className="mt-4">この予約を取り消しますか？</p>
      </Modal.Body>
      <Modal.Footer className="flex flex-row justify-end">
        <Button
          color="failure"
          className="w-20 min-w-fit"
          pill={true}
          onClick={onSubmit}
          disabled={processing}
        >
          {processing ? <Spinner size="sm" aria-label="処理中" /> : '取消'}
        </Button>
        <Button color="light" pill={true} onClick={onClose} disabled={processing}>
          キャンセル
        </Button>
      </Modal.Footer>
    </ModalBase>
  );
};

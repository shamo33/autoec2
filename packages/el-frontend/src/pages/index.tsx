import { Button, Table } from 'flowbite-react';
import { DateTime } from 'luxon';
import { NextPage } from 'next';
import { FC, Suspense, useCallback, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HiOutlinePlusCircle, HiRefresh } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { preload, suspend } from 'suspend-react';

import logo from '#fe/assets/logo.svg';
import { Loading } from '#fe/components/loading';
import { BadgeReservationType } from '#fe/components/pages/index/badge-reservation-type';
import { ModalAddReservation } from '#fe/components/pages/index/modal-add-reservation';
import { ModalDeleteReservation } from '#fe/components/pages/index/modal-delete-reservation';
import { ModalRequestFailed } from '#fe/components/pages/index/modal-request-failed';
import { DATETIME_FORMAT } from '#fe/constants';
import s from '#fe/pages/index.module.scss';
import { useBackendInfo } from '#fe/states/backend-info';
import { fetchBackend } from '#fe/utils/fetch-api';
import type { BackendInfo } from '#types/backend-info';
import type { GetEventDto, HasConfigDto, PostEventDto } from '#types/dto/event';

const CONFIG_CACHE_KEY = 'has-config';
const EVENTS_CACHE_KEY = 'events';

interface IndexPageInnerProps {
  events: GetEventDto[];
}

const checkConfig = async (backendInfo: BackendInfo) => {
  const res = await fetchBackend(backendInfo, '/has-config');
  if (!res.ok) {
    throw new Error('Failed to fetch has-config');
  }
  const json = (await res.json()) as HasConfigDto;
  console.log(json);

  if (!json.hasConfig) {
    throw new Error('failed to load config');
  }
};

const getEvents = async (backendInfo: BackendInfo) => {
  const res = await fetchBackend(backendInfo, '/events');
  if (!res.ok) {
    throw new Error('Failed to fetch events');
  }
  const json = (await res.json()) as GetEventDto[];
  console.log(json);
  return json;
};

const postEvent = async (backendInfo: BackendInfo, dto: PostEventDto) => {
  return await fetchBackend(backendInfo, '/events', {
    method: 'POST',
    body: JSON.stringify(dto),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

const deleteEvent = async (backendInfo: BackendInfo, name: string) => {
  return await fetchBackend(backendInfo, `/events/${name}`, { method: 'DELETE' });
};

const IndexPageInner: FC<IndexPageInnerProps> = (props) => {
  const [backendInfo] = useBackendInfo();

  const [events, setEvents] = useState(props.events);

  const [isAddModalShown, setIsAddModalShown] = useState(false);
  const [isAddModalProcessing, setIsAddModalProcessing] = useState(false);
  const openAddModal = useCallback(() => setIsAddModalShown(true), []);
  const closeAddModal = useCallback(() => setIsAddModalShown(false), []);

  const [isDeleteModalShown, setIsDeleteModalShown] = useState(false);
  const [isDeleteModalProcessing, setIsDeleteModalProcessing] = useState(false);
  const closeDeleteModal = useCallback(() => setIsDeleteModalShown(false), []);
  const [deleteModalEvent, setDeleteModalEvent] = useState<GetEventDto>(null);

  const openDeleteModal = useCallback((event: GetEventDto) => {
    setDeleteModalEvent(event);
    setIsDeleteModalShown(true);
  }, []);

  const reload = useCallback(async () => {
    try {
      const events = await getEvents(backendInfo);
      setEvents(events);
      // 使わないだろうが一応 suspend 用のキャッシュも更新しておく
      preload(() => Promise.resolve(events), [EVENTS_CACHE_KEY]);
    } catch (e) {
      toast.error('予約の再読込に失敗しました。');
    }
  }, [backendInfo]);

  const onAddModalSubmit = useCallback(
    async (dto: PostEventDto) => {
      setIsAddModalProcessing(true);
      const res = await postEvent(backendInfo, dto);
      setIsAddModalProcessing(false);
      setIsAddModalShown(false);
      if (res.ok) {
        toast.success('予約を追加しました。');
      } else {
        toast.error('予約追加失敗。もう一度予約しなおしてください。');
      }
      await reload();
    },
    [backendInfo]
  );

  const onDeleteModalSubmit = useCallback(
    async (name: string) => {
      setIsDeleteModalProcessing(true);
      const res = await deleteEvent(backendInfo, name);
      setIsDeleteModalProcessing(false);
      setIsDeleteModalShown(false);
      if (res.ok) {
        toast.success('予約を削除しました。');
      } else {
        toast.error('予約の削除に失敗しました。');
      }
      await reload();
    },
    [backendInfo]
  );

  return (
    <>
      <div className={s.root}>
        <div className="no-drag w-[80%] h-full mx-auto flex flex-col">
          <header className="drag flex flex-row justify-between items-center mb-4 gap-4">
            <div className="flex-grow">
              <img src={logo.src} alt="logo" />
            </div>
            <button
              onClick={reload}
              className="no-drag rounded-full p-1 text-gray-700 hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-200"
            >
              <HiRefresh className="text-lg" />
            </button>
            <Button
              onClick={openAddModal}
              size="sm"
              className="no-drag bg-blue-500 hover:bg-blue-600"
            >
              <HiOutlinePlusCircle className="mr-1 text-lg" />
              予約追加
            </Button>
          </header>
          <Table hoverable={true} className="table-fixed">
            <Table.Head className="sticky top-0">
              <Table.HeadCell className="text-center">予約種別</Table.HeadCell>
              <Table.HeadCell className="text-center">日時</Table.HeadCell>
              <Table.HeadCell className="text-center">操作</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {events.length ? (
                events.map((event) => (
                  <Table.Row
                    key={event.name}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Table.Cell className="text-center">
                      <div className="flex flex-col items-center">
                        <BadgeReservationType startup={event.startup} />
                      </div>
                    </Table.Cell>
                    <Table.Cell className="text-center">
                      {DateTime.fromISO(event.dateTime).toFormat(DATETIME_FORMAT)}
                    </Table.Cell>
                    <Table.Cell>
                      <Button
                        color="light"
                        pill={true}
                        size="sm"
                        className="mx-auto"
                        onClick={() => {
                          openDeleteModal(event);
                        }}
                      >
                        取消
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell
                    colSpan={3}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800 text-center"
                  >
                    予約はありません
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </div>
      </div>
      {isAddModalShown && (
        <ModalAddReservation
          show={true}
          onClose={closeAddModal}
          processing={isAddModalProcessing}
          onSubmit={onAddModalSubmit}
        />
      )}
      {isDeleteModalShown && (
        <ModalDeleteReservation
          show={true}
          event={deleteModalEvent}
          onClose={closeDeleteModal}
          onSubmit={onDeleteModalSubmit}
          processing={isDeleteModalProcessing}
        />
      )}
    </>
  );
};

const IndexPage_2: FC = () => {
  const [backendInfo] = useBackendInfo();

  suspend(() => checkConfig(backendInfo), [CONFIG_CACHE_KEY]);
  const events = suspend(() => getEvents(backendInfo), [EVENTS_CACHE_KEY]);

  return <IndexPageInner events={events} />;
};

const IndexPage: NextPage = () => {
  // ロード中はローディングを表示
  // ロード完了したら、レスポンスを表示
  return (
    <ErrorBoundary fallback={<ModalRequestFailed />}>
      <Suspense fallback={<Loading />}>
        <IndexPage_2 />
      </Suspense>
    </ErrorBoundary>
  );
};

export default IndexPage;

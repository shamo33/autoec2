import { Modal } from 'flowbite-react';
import { FC } from 'react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

import { ModalBase } from '#fe/components/pages/index/modal-base';

export const ModalRequestFailed: FC = () => {
  return (
    <ModalBase show={true} className="h-full">
      <Modal.Body>
        <HiOutlineExclamationCircle className="mx-auto mb-4 h-20 w-20 text-gray-400 dark:text-gray-200" />
        <p className="mt-4">データの取得に失敗しました。</p>
        <p>
          インターネット接続が正常か、AWS
          の設定が完了しているかを確認し、本アプリを再起動してください。
        </p>
      </Modal.Body>
    </ModalBase>
  );
};

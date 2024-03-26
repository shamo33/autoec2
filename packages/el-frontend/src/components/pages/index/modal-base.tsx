import { Modal, ModalProps } from 'flowbite-react';
import { FC, useCallback } from 'react';

import { useModalRoot } from '#fe/states/modal-root';

export interface ModalBaseProps extends ModalProps {
  processing?: boolean;
}

const useModalBaseFacade = ({ onClose, processing }: ModalBaseProps) => {
  const wrappedOnClose = useCallback(() => {
    // 処理中の UI 上からの閉じる操作は受け付けない
    !processing && onClose && onClose();
  }, [processing, onClose]);

  const [modalRoot] = useModalRoot();

  return { onClose: wrappedOnClose, modalRoot };
};

export const ModalBase: FC<ModalBaseProps> = (props) => {
  const { children } = props;

  const { modalRoot, onClose } = useModalBaseFacade(props);

  return (
    <Modal {...props} root={modalRoot} onClose={onClose}>
      {children}
    </Modal>
  );
};

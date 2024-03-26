import '#fe/styles/global.scss';

import { clsx } from 'clsx';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { useEvent } from 'react-use';

import { Loading } from '#fe/components/loading';
import s from '#fe/pages/_app.module.scss';
import { useBackendInfo } from '#fe/states/backend-info';
import { useModalRoot } from '#fe/states/modal-root';
import { useRendererEvent } from '#fe/utils/renderer-event';

const useAppFacade = () => {
  // 表示サイズをウィンドウサイズに合わせて動的に変更する
  const resizeFunc = useCallback(() => {
    const pageWidth = 1024;
    const pageHeight = 600;

    const ratioWidth = window.innerWidth / pageWidth;
    const ratioHeight = window.innerHeight / pageHeight;
    const ratio = Math.min(ratioWidth, ratioHeight);
    document.documentElement.style.setProperty('--app-scale-ratio', String(ratio));
  }, []);
  useEvent('resize', resizeFunc);
  useEffect(resizeFunc, []);

  // ウィンドウ時のみ独自ウィンドウボタンを表示させる
  // フルスクリーン時は OS 標準のボタンを表示させる
  const [osButtonVisible, setOsButtonVisible] = useState(true);
  useRendererEvent(() => global.app.fullscreenEvent, setOsButtonVisible);
  useEffect(() => {
    global.app.isFullscreen().then(setOsButtonVisible);
  }, []);

  // ウィンドウがアクティブかどうか
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  useRendererEvent(() => global.app.focusEvent, setIsWindowFocused);
  useEffect(() => {
    global.app.isFocused().then(setIsWindowFocused);
  }, []);

  const [, setModalRoot] = useModalRoot();

  return { osButtonVisible, isWindowFocused, setModalRoot };
};

const App = ({ Component, pageProps }: AppProps) => {
  const { osButtonVisible, isWindowFocused, setModalRoot } = useAppFacade();

  return (
    <>
      <Head>
        <title>autoec2-electron</title>
      </Head>

      {!osButtonVisible && (
        <div className={s.buttons}>
          <button className={s.button1} onClick={() => global.app.minimize()}>
            <div className={clsx(s.circle, { [s.active]: isWindowFocused })} />
            <div className={s.icon}>_</div>
          </button>
          <button className={s.button2} onClick={() => global.app.toggleMaximize()}>
            <div className={clsx(s.circle, { [s.active]: isWindowFocused })} />
            <div className={s.icon}>□</div>
          </button>
          <button className={s.button3} onClick={() => global.app.close()}>
            <div className={clsx(s.circle, { [s.active]: isWindowFocused })} />
            <div className={s.icon}>×</div>
          </button>
        </div>
      )}

      <div className={s.mainApp}>
        <div className={s.mainAppInner}>
          <WaitForBackend>
            <Component {...pageProps} />
          </WaitForBackend>

          <div className={s.modalRoot} ref={setModalRoot}></div>
        </div>
      </div>

      <ToastContainer
        className={s.toastContainer}
        autoClose={3000}
        theme="colored"
        position="bottom-center"
      />
    </>
  );
};

interface WaitForBackendProps {
  children: ReactNode | ReactNode[];
}

const useWaitForBackendFacade = () => {
  const [backendInfo, setBackendInfo] = useBackendInfo();
  useRendererEvent(() => global.backendInfo.backendInfoEvent, setBackendInfo);
  useEffect(() => {
    global.backendInfo.getBackendInfo().then(setBackendInfo);
  }, []);

  return { backendInfo };
};

const WaitForBackend = ({ children }: WaitForBackendProps) => {
  const { backendInfo } = useWaitForBackendFacade();

  return backendInfo ? <>{children}</> : <Loading />;
};

export default App;

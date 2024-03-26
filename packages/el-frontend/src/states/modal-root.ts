import { createGlobalState } from 'react-use';

export const useModalRoot = createGlobalState<HTMLElement>(null);

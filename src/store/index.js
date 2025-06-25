/**
 * Redux Store 配置
 * 使用 Redux Toolkit 进行状态管理
 */

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// 导入各个slice
import authSlice from './slices/authSlice';
import userSlice from './slices/userSlice';
import chatSlice from './slices/chatSlice';
import learningSlice from './slices/learningSlice';
import blockchainSlice from './slices/blockchainSlice';
import uiSlice from './slices/uiSlice';
import translationSlice from './slices/translationSlice';

// 持久化配置
const persistConfig = {
  key: 'culturebridge',
  storage,
  whitelist: ['auth', 'user', 'ui'], // 只持久化这些reducer
  blacklist: ['chat', 'translation'], // 不持久化实时数据
};

// 根reducer
const rootReducer = combineReducers({
  auth: authSlice,
  user: userSlice,
  chat: chatSlice,
  learning: learningSlice,
  blockchain: blockchainSlice,
  ui: uiSlice,
  translation: translationSlice,
});

// 持久化reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 配置store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// 持久化store
export const persistor = persistStore(store);

// 类型定义
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

export default store;


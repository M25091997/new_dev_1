import { configureStore } from "@reduxjs/toolkit";
import {
    persistStore,
    persistReducer
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { thunk } from "redux-thunk";
import reducers from './reducer/index';

const persistConfig = {
    key: 'root',
    storage,
    // Add any blacklist/whitelist if needed
    // blacklist: ['someReducer'],
    // whitelist: ['someOtherReducer'],
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        immutableCheck: false, // Disable ImmutableStateInvariantMiddleware
        serializableCheck: false, // Disable SerializableStateInvariantMiddleware
        applyMiddleware: thunk
    }),
});

const Persiststore = persistStore(store);
export { Persiststore };

export default store;
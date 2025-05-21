"use client";

import {configureStore} from "@reduxjs/toolkit";
import childrenReducer from "@/lib/features/childrenSlice";

export const store = configureStore({
	reducer: {
		children: childrenReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

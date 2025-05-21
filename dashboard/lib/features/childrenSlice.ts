"use client";

import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Child} from "@/lib/api/children";

interface ChildrenState {
	children: Child[];
}

const initialState: ChildrenState = {
	children: [],
};

const childrenSlice = createSlice({
	name: "children",
	initialState,
	reducers: {
		setChildren(state, action: PayloadAction<Child[]>) {
			state.children = action.payload;
		},
		clearChildren(state) {
			state.children = [];
		},
	},
});

export const {setChildren, clearChildren} = childrenSlice.actions;
export default childrenSlice.reducer;

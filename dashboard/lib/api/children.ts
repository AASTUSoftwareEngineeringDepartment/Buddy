import api from "../axios";

export interface Child {
	child_id: string;
	parent_id: string;
	first_name: string;
	last_name: string;
	birth_date: string;
	nickname: string;
	username: string;
	status: string;
	role: string;
	created_at: string;
}

export const childrenApi = {
	getMyChildren: async (): Promise<Child[]> => {
		const response = await api.get<Child[]>("/api/v1/children/my-children");
		return response.data;
	},
};

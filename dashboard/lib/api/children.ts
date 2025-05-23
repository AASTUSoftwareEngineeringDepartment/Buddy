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

	updateChildProfile: async (child_id: string, profile: Record<string, string>) => {
		const response = await api.put(`/api/v1/children/${child_id}/profile`, profile);
		return response.data;
	},

	getChildSettings: async (child_id: string) => {
		const response = await api.get(`/api/v1/settings/${child_id}`);
		return response.data;
	},

	updateChildSettings: async (child_id: string, data: any) => {
		console.log(data);
		const response = await api.put(`/api/v1/settings/${child_id}`, data);
		return response.data;
	},

	getChildStreak: async (child_id: string) => {
		const response = await api.get(`/science/parent/child/${child_id}/streak`);
		return response.data;
	},

	getChildRewards: async (child_id: string) => {
		const response = await api.get(`/science/parent/child/${child_id}/rewards`);
		return response.data;
	},
};

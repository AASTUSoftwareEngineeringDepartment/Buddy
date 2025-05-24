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

export interface Story {
	story_id: string;
	title: string;
	story_body: string;
	image_url?: string;
}

export interface StoriesResponse {
	stories: Story[];
	total: number;
	skip: number;
	limit: number;
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
		const response = await api.get(`/api/v1/science/parent/child/${child_id}/streak`);
		return response.data;
	},

	getChildRewards: async (child_id: string) => {
		const response = await api.get(`/api/v1/science/parent/child/${child_id}/rewards`);
		return response.data;
	},

	getChildStories: async (child_id: string, limit: number = 3, skip: number = 0): Promise<StoriesResponse> => {
		const response = await api.get<StoriesResponse>(`/api/v1/stories/parent/child/${child_id}/stories`, {
			params: {limit, skip},
		});
		return response.data;
	},

	updateStory: async (story_id: string, data: {parent_comment: string; story_id: string; child_id: string}): Promise<Story> => {
		const response = await api.put(`/api/v1/stories/parent/story/update`, data);
		return response.data;
	},

	deleteStory: async (child_id: string, story_id: string): Promise<void> => {
		await api.delete(`/api/v1/stories/parent/child/${child_id}/story/${story_id}`);
	},

	getChildStats: async (child_id: string) => {
		const response = await api.get(`/api/v1/science/stats/${child_id}`);
		return response.data;
	},

	getChildQuestions: async (child_id: string, limit: number = 5, skip: number = 0) => {
		const response = await api.get(`/api/v1/science/parent/child/${child_id}/questions`, {params: {skip, limit}});
		return response.data;
	},
};

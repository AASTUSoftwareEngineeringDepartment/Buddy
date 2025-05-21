import {ChildCard} from "./ChildCard";
import {useState} from "react";
import {Child} from "@/lib/api/children";

export function ChildrenList({children, selectedId, onSelect}: {children: Child[]; selectedId: string | null; onSelect: (id: string) => void}) {
	const [search, setSearch] = useState("");
	const filtered = children.filter((c) => `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()));

	return (
		<div className='bg-white rounded-2xl shadow p-4 flex flex-col gap-4'>
			<input
				className='w-full px-3 py-2 rounded-lg border text-sm mb-2'
				placeholder='Search for child'
				value={search}
				onChange={(e) => setSearch(e.target.value)}
			/>
			<div className='flex flex-col gap-2'>
				{filtered.map((child) => (
					<ChildCard
						key={child.child_id}
						child={child}
						selected={child.child_id === selectedId}
						onClick={() => onSelect(child.child_id)}
					/>
				))}
			</div>
		</div>
	);
}

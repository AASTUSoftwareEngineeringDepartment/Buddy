import React from "react";

export function StreakProgress({streakData}: {streakData: any}) {
  if (!streakData) return null;
  return (
    <div className="rounded-2xl bg-white shadow p-6 border border-[#e0e4e8] flex flex-col gap-4 min-w-[260px]">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl font-bold text-[#344e41]">🔥 {streakData.current_streak}</span>
        <span className="text-sm text-gray-500">Current Streak</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div
          className="bg-gradient-to-r from-[#344e41] to-[#a3b18a] h-3 rounded-full"
          style={{width: `${streakData.streak_progress ?? 0}%`}}
        />
      </div>
      <div className="text-xs text-gray-500 mb-2">Progress to next achievement: {streakData.streak_progress ?? 0}%</div>
      {streakData.next_streak_achievement && (
        <div className="bg-[#e9f5ee] rounded-xl p-3 mb-2">
          <div className="font-semibold text-[#344e41]">Next: {streakData.next_streak_achievement.title}</div>
          <div className="text-xs text-gray-600">{streakData.next_streak_achievement.description}</div>
        </div>
      )}
      {streakData.streak_achievements && streakData.streak_achievements.length > 0 && (
        <div>
          <div className="font-semibold text-[#344e41] mb-1">Earned Achievements</div>
          <ul className="space-y-1">
            {streakData.streak_achievements.map((ach: any) => (
              <li key={ach.achievement_id} className="flex flex-col bg-[#f7fafc] rounded-lg px-3 py-2">
                <span className="font-medium text-[#344e41]">{ach.title}</span>
                <span className="text-xs text-gray-500">{ach.description}</span>
                <span className="text-xs text-gray-400">{ach.earned_at && new Date(ach.earned_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
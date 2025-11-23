import React, { useState, useEffect } from "react";

interface MoodFilterProps {
  moods?: string[];
  onFilterChange: (moodId: string) => void;
  activeFilter?: string;
}

const MoodFilter = ({
  moods = [],
  onFilterChange,
  activeFilter = "all",
}: MoodFilterProps) => {
  const [activeMood, setActiveMood] = useState<string>(activeFilter);

  // Update active mood ketika activeFilter props berubah
  useEffect(() => {
    setActiveMood(activeFilter);
  }, [activeFilter]);

  const handleMoodClick = (moodId: string) => {
    setActiveMood(moodId);
    onFilterChange(moodId);
  };

  // Combine "all" dengan moods dari API
  const moodList = [
    { id: "all", label: "All Looks" },
    ...moods.map((mood) => ({
      id: mood,
      label: mood.charAt(0).toUpperCase() + mood.slice(1),
    })),
  ];

  // Hapus duplikat jika ada "all" di moods array
  const uniqueMoods = moodList.filter(
    (mood, index, self) => index === self.findIndex((m) => m.id === mood.id)
  );

  return (
    <div className="px-4 py-6 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-4">
          Find Your Mood
        </h2>

        <div className="flex overflow-x-auto scrollbar-hide gap-3 pb-2">
          {uniqueMoods.map((mood) => (
            <button
              key={mood.id}
              onClick={() => handleMoodClick(mood.id)}
              className={`
              flex-shrink-0 px-4 py-2 rounded-full text-sm font-light transition-all duration-300 whitespace-nowrap
              ${
                activeMood === mood.id
                  ? "bg-neutral-900 text-white shadow-md"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }
            `}
            >
              {mood.label}
            </button>
          ))}
        </div>

        {/* Info text */}
        {moods.length > 0 && (
          <p className="text-xs text-neutral-500 mt-3">
            Total moods available: {moods.length}
          </p>
        )}
      </div>
    </div>
  );
};

export default MoodFilter;

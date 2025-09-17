import React, { useState } from "react";

interface Props {
  tabs: string[];
  activeIndex?: number;
  onChange?: (index: number) => void;
  loadingIndex?: number;
}

export const Tabs: React.FC<Props> = ({
  tabs,
  activeIndex,
  onChange,
  loadingIndex,
}) => {
  const [internalIndex, setInternalIndex] = useState(0);
  const derivedIndex =
    typeof activeIndex === "number" ? activeIndex : internalIndex;

  const handleClick = (idx: number) => {
    if (typeof activeIndex === "number") {
      if (onChange) onChange(idx);
    } else {
      setInternalIndex(idx);
      if (onChange) onChange(idx);
    }
  };

  return (
    <div>
      <div className="flex border-b border-gray-200">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            disabled={loadingIndex === index}
            className={`relative px-4 py-1 text-sm font-medium transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed
              ${
                derivedIndex === index
                  ? "border-b-2 border-gray-400 text-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <span className="inline-flex items-center gap-2">
              {tab}
              {loadingIndex === index && (
                <span
                  className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"
                  aria-label="Loading"
                />
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

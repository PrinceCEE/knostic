import type { ClassificationsData, StringsData } from "@/types";
import type { FC } from "react";
import { useState } from "react";

interface Props {
  headers: string[];
  data: (StringsData | ClassificationsData)[];
  maxHeight?: number | string;
  editable?: boolean;
  onCellChange?: (rowIndex: number, field: string, value: string) => void;
  onDeleteRow?: (rowIndex: number) => void;
}

export const Table: FC<Props> = ({
  headers,
  data,
  maxHeight = 400,
  editable = false,
  onCellChange,
  onDeleteRow,
}) => {
  const heightStyle =
    typeof maxHeight === "number" ? `${maxHeight}px` : String(maxHeight);
  const [editing, setEditing] = useState<{ row: number; field: string } | null>(
    null
  );
  const [draft, setDraft] = useState("");

  const startEdit = (row: number, field: string, initial: string) => {
    setEditing({ row, field });
    setDraft(initial);
  };
  const commit = () => {
    if (editing && onCellChange)
      onCellChange(editing.row, editing.field, draft);
    setEditing(null);
    setDraft("");
  };
  const cancel = () => {
    setEditing(null);
    setDraft("");
  };

  return (
    <div
      className="overflow-x-auto border border-gray-300 rounded-md"
      style={{ maxWidth: "100%" }}
    >
      <div
        className="overflow-y-auto rounded-md pb-4"
        style={{ maxHeight: heightStyle }}
      >
        <table className="min-w-full">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-700"
                >
                  {header}
                </th>
              ))}
              {editable && (
                <th className="px-2 py-2 text-left text-sm font-medium text-gray-700">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 &&
              data.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition duration-200 border-b border-gray-300 last:border-b-0"
                >
                  {headers.map((col, colIndex) => {
                    const value = String(
                      row[col as keyof (StringsData | ClassificationsData)] ||
                        ""
                    );
                    const isEditing =
                      editable &&
                      editing &&
                      editing.row === index &&
                      editing.field === col;
                    return (
                      <td
                        key={colIndex}
                        className="px-4 py-2 text-sm text-gray-600 cursor-pointer"
                        onClick={() => {
                          if (!editable) return;
                          startEdit(index, col, value);
                        }}
                      >
                        {isEditing ? (
                          <input
                            autoFocus
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onBlur={commit}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commit();
                              if (e.key === "Escape") cancel();
                            }}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                          />
                        ) : (
                          value
                        )}
                      </td>
                    );
                  })}
                  {editable && (
                    <td className="px-2 py-2 text-sm">
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-700 text-xs font-medium cursor-pointer"
                        onClick={() => onDeleteRow && onDeleteRow(index)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

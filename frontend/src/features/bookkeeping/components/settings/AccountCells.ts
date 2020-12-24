export const headCells: Array<{
  id: string;
  label: string;
  order: boolean;
  align: "left" | "right" | "inherit" | "center" | "justify";
}> = [
  { id: "isActive", label: "有効/無効", order: false, align: "center" },
  {
    id: "code",
    label: "科目コード",
    order: true,
    align: "center",
  },
  {
    id: "name",
    label: "名前",
    order: false,
    align: "center",
  },
  {
    id: "furigana",
    label: "ふりがな",
    order: false,
    align: "center",
  },
  {
    id: "code",
    label: "説明",
    order: false,
    align: "center",
  },
  { id: "edit", label: "編集", order: false, align: "center" },
];

export const rowCells: Array<{
  key: string;
  align: "left" | "right" | "inherit" | "center" | "justify";
}> = [
  {
    key: "code",
    align: "center",
  },
  {
    key: "name",
    align: "center",
  },
  {
    key: "furigana",
    align: "center",
  },
  {
    key: "description",
    align: "center",
  },
];

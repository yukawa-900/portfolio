export const headCells: Array<{
  id: string;
  label: string;
  order: boolean;
  align: "left" | "right" | "inherit" | "center" | "justify";
}> = [
  { id: "isActive", label: "有効/無効", order: false, align: "center" },
  {
    id: "name",
    label: "名前",
    order: false,
    align: "center",
  },
  {
    id: "code",
    label: "部門コード",
    order: true,
    align: "center",
  },
  { id: "edit", label: "編集", order: false, align: "center" },
];

export const rowCells: Array<{
  key: string;
  align: "left" | "right" | "inherit" | "center" | "justify";
}> = [
  {
    key: "name",
    align: "center",
  },
  {
    key: "code",
    align: "center",
  },
];

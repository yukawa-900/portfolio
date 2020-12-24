export const headCells: Array<{
  id: string;
  label: string;
  order: boolean;
  align: "left" | "right" | "inherit" | "center" | "justify";
}> = [
  {
    id: "date",
    label: "転記日付",
    order: true,
    align: "left",
  },
  {
    id: "slipNum",
    label: "伝票番号",
    order: true,
    align: "center",
  },
  {
    id: "department",
    label: "部門",
    order: false,
    align: "center",
  },
  {
    id: "currency",
    label: "通貨",
    order: false,
    align: "center",
  },
  { id: "pdf", label: "PDF", order: false, align: "center" },
  { id: "memo", label: "摘要", order: false, align: "center" },
  { id: "edit", label: "編集", order: false, align: "center" },
];

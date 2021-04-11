export const headCells: (
  isMonth: Boolean
) => Array<{
  id: string;
  label: string;
  order: boolean;
  align: "left" | "right" | "inherit" | "center" | "justify";
}> = (isMonth: Boolean) => {
  return [
    {
      id: "name",
      label: "名前",
      order: false,
      align: "left",
    },
    {
      id: isMonth ? "theMonth" : "theDay",
      label: isMonth ? "今月" : "当日",
      order: false,
      align: "right",
    },
    {
      id: isMonth ? "twoMonthsBefore" : "theDayBefore",
      label: isMonth ? "先月" : "前日",
      order: false,
      align: "right",
    },
    {
      id: isMonth ? "twoMonthsBefore" : "oneWeekBefore",
      label: isMonth ? "先々月" : "先週",
      order: false,
      align: "right",
    },
    {
      id: isMonth
        ? "ratioOfTheMonthToTheMonthBefore"
        : "ratioOfTheDayToTheDayBefore",
      label: isMonth ? "先月比" : "前日比",
      order: false,
      align: "right",
    },
    {
      id: isMonth
        ? "ratioOfTheMonthToTwoMonthsBefore"
        : "ratioOfTheDayToOneWeekBefore",
      label: isMonth ? "先々月比" : "先週比",
      order: false,
      align: "right",
    },
  ];
};

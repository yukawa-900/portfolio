const formatDate = (date: Date) => {
  // Date型 → String型
  return (
    date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
  );
};

export default formatDate;

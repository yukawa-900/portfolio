const formatDate = (date: Date | null) => {
  // Date型 → String型
  if (date) {
    let year = String(date.getFullYear());
    let month = String(date.getMonth() + 1);
    let day = String(date.getDate());

    // graphene-djangoでは、この 0 が無いと受けけつけない模様
    if (month.length === 1) {
      month = "0" + month;
    }

    if (day.length === 1) {
      day = "0" + day;
    }

    return year + "-" + month + "-" + day;
  } else {
    return "";
  }
};

export default formatDate;

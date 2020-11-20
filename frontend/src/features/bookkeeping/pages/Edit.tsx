import React, { useEffect } from "react";
import Form from "../components/Form";
import { useDispatch } from "react-redux";

const Edit = () => {
  // ✖️ storeから取り出し、Formに渡す
  // ○FormにEditかAddかを伝え、Form側で振り分ける

  return (
    <div>
      <Form role={"edit"} />
    </div>
  );
};

export default Edit;

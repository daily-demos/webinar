import React, { useEffect, useRef } from "react";
import * as typeformEmbed from "@typeform/embed";

const TypeForm = () => {
  const typeformRef = useRef(null);

  const onSubmit = function (e) {
    console.log(e, process.env.REACT_APP_TYPEFORM_TOKEN);
    const bearer = `Bearer ${process.env.REACT_APP_TYPEFORM_TOKEN}`;
    fetch(
      `https://api.typeform.com/forms/${process.env.REACT_APP_TYPEFORM_ID}/responses`,
      //   `https://api.typeform.com/forms/${process.env.REACT_APP_TYPEFORM_ID}/responses?included_response_ids=${e.response_id}`,
      {
        method: "GET",
        headers: {
          Authorization: bearer,
        },
        mode: "no-cors",
      }
    )
      .then((res) => res.json())
      .then((res) => console.log(res))
      .catch((err) => {
        console.log(err);
        // use guest name
      });
  };

  useEffect(() => {
    typeformEmbed.makeWidget(
      typeformRef.current,
      `https://form.typeform.com/to/${process.env.REACT_APP_TYPEFORM_ID}`,
      {
        hideFooter: true,
        hideHeaders: true,
        opacity: 0,
        onSubmit,
      }
    );
  }, [typeformRef]);

  return (
    <div ref={typeformRef} style={{ height: "400px", width: "100%" }}></div>
  );
};

export default TypeForm;

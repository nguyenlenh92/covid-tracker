import React from "react";
import Spinner from "react-bootstrap/Spinner"

const Loading = () => (
  <div className="d-flex justify-content-center">
      <Spinner style={{width: "3rem", height: "3rem"}} animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
      </Spinner>
  </div>
);

export default Loading;
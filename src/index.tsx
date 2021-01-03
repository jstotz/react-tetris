import { normalize, setupPage } from "csstips";
import React from "react";
import ReactDOM from "react-dom";
import Modal from "react-modal";
import Game from "./components/Game";
import reportWebVitals from "./reportWebVitals";

if (process.env.NODE_ENV !== "test") {
  Modal.setAppElement("#root");
  normalize();
  setupPage("#root");
}

ReactDOM.render(
  <React.StrictMode>
    <Game />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import store from "./components/store/store"
import { Provider } from "react-redux";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
  {" "}
  {/* Wrap the App in Provider */}
  <App /> {/* Render the App component */}
</Provider>
);

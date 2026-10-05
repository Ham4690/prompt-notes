import { render } from "preact";
import { App } from "./app";
import "./style.css";

if (navigator.storage?.persist) {
  navigator.storage.persist().catch(() => {
    // 要求が拒否されても致命的ではないため、ここでは何もしない
  });
}

render(<App />, document.getElementById("app")!);

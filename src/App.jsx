// src/App.js
import React from "react";
import { RouterProvider } from "react-router-dom";
import router from "./router.jsx";

function App() {
  return (
    <RouterProvider
      router={router}
      future={{
        v7_startTransition: true, 
      }}
    />
  );
}
export default App;

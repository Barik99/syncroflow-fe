import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Home from "./Home";
import NotFoundPage from "./NotFoundPage";
import Rules from "./Rules";
import Triggers from "./Triggers";
import FileExplorer from "./FileExplorer";
import Actions from "./Actions"; // Import the Rules component

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <NotFoundPage />,
  },
  {
    path: "/login",
    element: <App />,
  },
  {
    path: "/rules", // Add a new route for the Rules page
    element: <Rules />,
  },
  {
    path: "/triggers", // Add a new route for the Rules page
    element: <Triggers />,
  },
  {
    path: "/actions", // Add a new route for the Rules page
    element: <Actions />,
  },
  {
    path: "/file-explorer",
    element: <FileExplorer />,
  }
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
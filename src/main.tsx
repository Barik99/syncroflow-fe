import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import NotFoundPage from "./NotFoundPage";
import Rules from "./Rules";
import Triggers from "./Triggers";
import FileExplorer from "./FileExplorer";
import Actions from "./Actions"; // Import the Rules component
import ProtectedRoute from './ProtectedRoute';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFoundPage />,
  },
  {
    path: "/rules",
    element: <ProtectedRoute><Rules /></ProtectedRoute>,
  },
  {
    path: "/triggers",
    element: <ProtectedRoute><Triggers /></ProtectedRoute>,
  },
  {
    path: "/actions",
    element: <ProtectedRoute><Actions /></ProtectedRoute>,
  },
  {
    path: "/file-explorer",
    element: <ProtectedRoute><FileExplorer /></ProtectedRoute>,
  }
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
);
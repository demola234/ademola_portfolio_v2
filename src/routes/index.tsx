import { createBrowserRouter } from "react-router-dom";
import { GuestGuard } from "../guards/GuestGuard";

import GuestLayout from "../layout/rootLayout";
import Home from "../pages/Home";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <GuestGuard>
        <GuestLayout />
      </GuestGuard>
    ),
    children: [
      {
        path: "/",
        element: <Home />,
      },
    ],
  },
]);

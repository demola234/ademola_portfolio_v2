import { createBrowserRouter } from "react-router-dom";
import { GuestGuard } from "../guards/GuestGuard";

import GuestLayout from "../layout/rootLayout";
import BlogsPost from "../pages/BlogPost";
import BlogsPosts from "../pages/BlogPosts";
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
      {
        path: "/blogs",
        element: <BlogsPosts />,
      },
      {
        path: "/blogs/:title",
        element: <BlogsPost />,
      },
    ],
  },
]);

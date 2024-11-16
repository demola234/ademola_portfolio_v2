import { createBrowserRouter } from "react-router-dom";
import { GuestGuard } from "../guards/GuestGuard";

import GuestLayout from "../layout/rootLayout";
import Home from "../pages/Home";
import BlogPost from "../pages/BlogPost";
import BlogPosts from "../pages/BlogPosts";

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
        path: "/blog-posts",
        element: <BlogPosts />,
      },
      {
        path: "/blog-posts/:title",
        element: <BlogPost />,
      },
    ],
  },
]);

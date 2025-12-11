import { createBrowserRouter } from "react-router-dom";
import { GuestGuard } from "../guards/GuestGuard";

import GuestLayout from "../layout/rootLayout";
import BlogsPost from "../pages/BlogPost";
import BlogsPosts from "../pages/BlogPosts";
import Home from "../pages/Home";
import Projects from "../pages/Projects";
import ProjectPost from "../pages/ProjectPost";

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
        path: "/projects",
        element: <Projects />,
      },
      {
        path: "/blogs/:title",
        element: <BlogsPost />,
      },
      {
        path: "/projects/:title",
        element: <ProjectPost />,
      },
    ],
  },
]);

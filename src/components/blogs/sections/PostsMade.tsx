import { useNavigate } from "react-router-dom";
import slugify from "slugify";
import { posts } from "../../../data/posts";

const PostsMade = () => {
  const navigate = useNavigate();
  return (
    <div>
      <h1 className="mt-5 mb-4 text-xl font-bold">Blogs</h1>
      <p className="mb-8 text-sm text-white md:text-base">
        A portal into my thoughts, experiences, ideas, visions, interests, and
        more
      </p>
      <div className="space-y-4 md:space-y-6">
        {posts.map((post, index) => {
          const publishDate = new Date(post.publish_date);
          const day = publishDate.getDate();
          const month = publishDate.toLocaleString("en-US", { month: "short" });
          const year = publishDate.getFullYear();
          const slug = slugify(post.title, {
            lower: true,
            strict: true,
          });
          return (
            <div
              onClick={() => navigate(`/blogs/${slug}`)}
              key={index}
              className="flex flex-col w-full cursor-pointer md:flex-row group overflow-hidden rounded-lg md:rounded-none"
            >
              <div className="flex flex-col py-5 sm:py-6 md:py-9 md:w-[145px] w-auto justify-center items-center h-auto bg-[#1C1C1C] transition-colors duration-200 group-hover:bg-primaryDefault">
                <p className="text-lg md:text-2xl font-bold">{day}</p>

                <p className="text-sm md:text-base font-medium">
                  {month}, {year}
                </p>
              </div>
              <div className="px-4 sm:px-5 md:px-7 border w-full flex items-center py-6 sm:py-8 md:py-9 border-[#4A4A4A] transition-colors duration-200 group-hover:border-primaryDefault">
                <h4 className="text-lg font-bold md:text-xl leading-snug">{post.title}</h4>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PostsMade;

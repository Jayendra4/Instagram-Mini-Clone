import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Plus, Home, Search, Heart, User, Send } from "lucide-react";
import api from "../api/axios";
import PostCard from "../components/PostCard";

const Feed = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get user from storage (fastest method for this scale)
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchFeed = async () => {
      try {
        const response = await api.get("/posts/feed");
        const postsArray = Array.isArray(response?.data) ? response.data : [];
        setPosts(postsArray.map(post => ({
          ...post,
          author: post.author || post.user
        })));
      } catch (error) {
        console.error("Failed to load feed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-insta-border">
        <div className="max-w-[470px] mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-3xl font-logo text-[#262626]">Instagram</h1>
          <div className="flex items-center gap-4 text-[#262626]">
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
              }}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs font-semibold"
            >
              Logout
            </button>
            <Heart size={24} />
            <Link to="/create" className="hover:opacity-60">
              <Plus size={24} />
            </Link>
            <Send size={22} />
          </div>
        </div>
      </header>

      <main className="max-w-[470px] mx-auto px-4 pt-4">
        {/* Stories Strip */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {[...Array(8)].map((_, idx) => (
            <div key={idx} className="flex flex-col items-center text-xs text-[#262626]">
              <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5]">
                <div className="bg-white w-full h-full rounded-full flex items-center justify-center border border-white">
                  <span className="text-sm font-semibold text-insta-muted">IG</span>
                </div>
              </div>
              <span className="mt-1">Story</span>
            </div>
          ))}
        </div>

        {/* Feed Content */}
        {posts.length === 0 ? (
          <div className="bg-white border border-insta-border rounded-xl text-center py-16 px-8 mt-6">
            <h3 className="font-semibold text-lg mb-2">Welcome to Instagram</h3>
            <p className="text-insta-muted text-sm mb-4">
              Follow accounts to see their photos and videos in your feed.
            </p>
            <Link
              to="/create"
              className="text-[#0095f6] font-semibold text-sm hover:text-[#1877f2]"
            >
              Share your first post
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5 mt-2">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={user?._id}
              />
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-insta-border flex justify-around items-center py-2.5 z-40 md:hidden">
        <button
          aria-label="Home"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <Home size={28} className="text-[#262626]" />
        </button>
        <Search size={26} className="text-insta-muted" />
        <Link to="/create" aria-label="Create" className="bg-[#0095f6] text-white p-2 rounded-lg">
          <Plus size={20} />
        </Link>
        <Heart size={26} className="text-insta-muted" />
        <Link to={`/profile/${user?._id}`} aria-label="Profile">
          <div className="w-8 h-8 rounded-full border border-insta-border overflow-hidden bg-gray-100 flex items-center justify-center">
            <User size={20} className="text-insta-muted" />
          </div>
        </Link>
      </nav>
    </div>
  );
};

export default Feed;
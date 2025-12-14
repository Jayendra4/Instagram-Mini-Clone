
import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Send } from "lucide-react";
import api from "../api/axios";

const PostCard = ({ post, currentUserId }) => {
  if (!post || !post.author) {
    return null; // Or render a fallback UI
  }
  const [liked, setLiked] = useState(() => {
    // Ensure post.likes is an array before calling includes
    return Array.isArray(post.likes) ? post.likes.includes(currentUserId) : false;
  });
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);


  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return Math.floor(hours / 24) + "d";
  };

  const handleLike = async () => {
    try {
      // Optimistic UI update
      const newLikedState = !liked;
      const newLikeCount = newLikedState ? likeCount + 1 : Math.max(0, likeCount - 1);
      
      setLiked(newLikedState);
      setLikeCount(newLikeCount);
      
      const endpoint = newLikedState ? `/posts/${post._id}/like` : `/posts/${post._id}/unlike`;
      const response = await api.put(endpoint);
      
      // Update state with the actual response data
      if (response.data && response.data.success) {
        // Only update if the server response is different from our optimistic update
        if (response.data.data.likes.length !== newLikeCount) {
          setLikeCount(response.data.data.likes.length);
          setLiked(response.data.data.likes.includes(currentUserId));
        }
      }
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert optimistic update on error
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
      // You might want to show an error toast here
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const commentToAdd = commentText.trim();
    setCommentText("");

    try {
      const response = await api.post(`/posts/${post._id}/comment`, { 
        text: commentToAdd 
      });
      
      if (response && response.success) {
        // The axios interceptor returns response.data directly, so response is already the data object
        // response.data contains the post with all comments
        const updatedComments = response.data?.comments || [];
        
        // Update comments state with all comments from server
        setComments(updatedComments);
        
        // Auto-show comments section after posting
        setShowComments(true);
      }
    } catch (error) {
      console.error("Failed to post comment", error);
      // Restore the comment text if posting failed
      setCommentText(commentToAdd);
    }
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm mb-4 max-w-[470px] mx-auto">
      {/* Header */}
      <div className="flex items-center p-3">
        <Link to={`/profile/${post.author._id}`} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
             <img 
               src={post.author.profilePicture || "/default-avatar.png"} 
               alt={post.author.username}
               className="w-full h-full object-cover"
             />
          </div>
          <span className="font-semibold text-sm hover:underline">
            {post.author.username}
          </span>
        </Link>
        <span className="text-gray-400 text-xs ml-auto">
          {timeAgo(post.createdAt)}
        </span>
      </div>

      {/* Image */}
      <div className="w-full bg-black aspect-square">
        <img 
          src={post.imageUrl} 
          alt="Post" 
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>

      {/* Actions */}
      <div className="p-3 pb-1">
        <div className="flex gap-4 mb-2">
          <button onClick={handleLike} className="hover:opacity-60 transition">
            <Heart 
              size={24} 
              className={liked ? "fill-red-500 text-red-500" : "text-black"} 
            />
          </button>
          <button onClick={() => setShowComments(!showComments)} className="hover:opacity-60 transition">
            <MessageCircle size={24} />
          </button>
        </div>
        
        <div className="font-semibold text-sm mb-1">
          {likeCount} {likeCount === 1 ? "like" : "likes"}
        </div>

        <div className="text-sm mb-2">
          <span className="font-semibold mr-2">{post.author.username}</span>
          {post.caption}
        </div>
      </div>

      {/* Comments Section */}
      <div className="px-3 pb-3">
        {comments.length > 0 && !showComments && (
          <button 
            onClick={() => setShowComments(true)}
            className="text-gray-500 text-sm mb-2"
          >
            View all {comments.length} comments
          </button>
        )}

        {showComments && (
          <div className="mb-3 space-y-2 max-h-48 overflow-y-auto">
            {comments.map((comment, index) => (
              <div key={comment._id || index} className="text-sm">
                <span className="font-semibold mr-2">
                  {comment.user.username}
                </span>
                <span>{comment.text}</span>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleComment} className="flex items-center border-t pt-3 mt-2">
          <input
            type="text"
            placeholder="Add a comment..."
            className="flex-1 text-sm outline-none focus:outline-none"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            autoFocus={false}
          />
          {commentText.trim() && (
            <button 
              type="submit" 
              className="text-blue-500 font-semibold text-sm ml-2 hover:text-blue-700 transition-colors cursor-pointer"
            >
              Post
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default PostCard;
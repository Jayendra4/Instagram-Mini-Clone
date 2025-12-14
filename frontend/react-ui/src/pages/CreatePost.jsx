// C:\projects\instagram Mini Clone\frontend\react-ui\src\pages\CreatePost.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import api from "../api/axios";

const CreatePost = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    imageUrl: "",
    caption: ""
  });
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [serverError, setServerError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  // Helper function to format and validate URL
  const formatUrl = (url) => {
    if (!url || !url.trim()) {
      setPreviewUrl("");
      return "";
    }
    
    let formatted = url.trim();
    
    // Fix common issues: missing "ht" in "https://" or "http://"
    if (formatted.startsWith("tps://")) {
      formatted = "https" + formatted;
    } else if (formatted.startsWith("tp://")) {
      formatted = "http" + formatted;
    } else if (formatted.startsWith("://")) {
      formatted = "https" + formatted;
    }
    
    // Add protocol if missing
    if (!/^https?:\/\//i.test(formatted)) {
      formatted = 'https://' + formatted;
    }
    
    // Validate URL format
    try {
      const urlObj = new URL(formatted);
      setPreviewUrl(urlObj.toString());
      return urlObj.toString();
    } catch (err) {
      setPreviewUrl("");
      return "";
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    
    if (e.target.name === "imageUrl") {
      setImageError(false);
      setServerError("");
      formatUrl(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.imageUrl || !formData.imageUrl.trim()) {
      setServerError('Please provide an image URL');
      return;
    }

    setLoading(true);
    setServerError('');
    setImageError(false);

    try {
      let urlToCheck = formData.imageUrl.trim();
      
      // Fix common URL issues
      if (urlToCheck.startsWith("tps://")) {
        urlToCheck = "https" + urlToCheck;
      } else if (urlToCheck.startsWith("tp://")) {
        urlToCheck = "http" + urlToCheck;
      } else if (urlToCheck.startsWith("://")) {
        urlToCheck = "https" + urlToCheck;
      }
      
      if (!/^https?:\/\//i.test(urlToCheck)) {
        urlToCheck = 'https://' + urlToCheck;
      }

      let finalUrl;
      try {
        const urlObj = new URL(urlToCheck);
        finalUrl = urlObj.toString();
      } catch (err) {
        setServerError('Please enter a valid URL (e.g., example.com/image.jpg or https://example.com/image.jpg)');
        setLoading(false);
        return;
      }

      const response = await api.post("/posts", {
        imageUrl: finalUrl,
        caption: formData.caption.trim()
      });
      
      if (response && response.success) {
        navigate("/");
      }
    } catch (err) {
      console.error('Post creation error:', err);
      console.error('Error details:', {
        status: err?.status,
        data: err?.data,
        message: err?.message
      });
      
      // Handle error response from backend
      let errorMessage = 'Failed to share post. Please try again.';
      
      if (err?.data) {
        if (err.data.errors && err.data.errors.imageUrl) {
          errorMessage = err.data.errors.imageUrl;
        } else if (err.data.message) {
          errorMessage = err.data.message;
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setServerError(errorMessage);
      setImageError(true);
    } finally {
      setLoading(false);
    }
  };

  const isValidInput = formData.imageUrl && formData.caption;

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-10">
      <div className="max-w-lg mx-auto bg-white border shadow-sm rounded-lg overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-black">
            <X size={24} />
          </button>
          <h1 className="font-semibold text-lg">Create new post</h1>
          <button
            onClick={handleSubmit}
            disabled={loading || !isValidInput}
            className={`font-semibold text-sm ${
              isValidInput && !loading 
                ? "text-blue-500 hover:text-blue-700" 
                : "text-blue-300 cursor-not-allowed"
            }`}
          >
            {loading ? "Sharing..." : "Share"}
          </button>
        </div>

        {/* Content Area */}
        <div className="p-0">
          {serverError && (
            <div className="bg-red-50 text-red-500 p-3 text-sm text-center border-b border-red-100 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{serverError}</span>
            </div>
          )}

          {/* Image Preview / Input */}
          <div className="w-full bg-gray-100 aspect-square flex items-center justify-center overflow-hidden relative">
            {previewUrl && !imageError ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="text-center p-6">
                <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Paste an image URL to preview</p>
                <input
                  type="url"
                  name="imageUrl"
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="w-full max-w-xs px-3 py-2 border rounded-md text-sm outline-none focus:border-gray-400"
                  autoFocus
                />
              </div>
            )}
            
            {/* Overlay button to change image if one is already valid */}
            {previewUrl && !imageError && (
              <button 
                onClick={() => {
                  setFormData({ ...formData, imageUrl: "" });
                  setPreviewUrl("");
                  setImageError(false);
                }}
                className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs hover:bg-black/90"
              >
                Change Image
              </button>
            )}
          </div>

          {/* Caption Input */}
          <div className="p-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 overflow-hidden">
                {/* Placeholder for current user avatar */}
                <div className="w-full h-full bg-gradient-to-tr from-yellow-200 to-pink-200" />
              </div>
              <textarea
                name="caption"
                placeholder="Write a caption..."
                value={formData.caption}
                onChange={handleChange}
                className="flex-1 min-h-[100px] outline-none resize-none text-sm pt-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
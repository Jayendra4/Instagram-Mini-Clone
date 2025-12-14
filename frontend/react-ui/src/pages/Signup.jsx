// C:\projects\instagram Mini Clone\frontend\react-ui\src\pages\Signup.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import api from "../api/axios";

const Signup = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/signup", formData);
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Signup error:", err);
      
      if (err?.message && err.message !== "Network Error" && !err.message.includes("timeout")) {
        setError(err.message);
      } else if (!err?.status) {
        setError(
          "Network error: Unable to reach the server. Make sure the backend is running on http://localhost:5000"
        );
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = 
    formData.email && 
    formData.username && 
    formData.password.length >= 6;

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="bg-white border border-insta-border rounded-sm px-10 py-8 flex flex-col items-center insta-card">
          <h1 className="text-5xl font-logo text-[#262626] mb-4">Instagram</h1>
          <p className="text-center text-sm text-insta-muted font-semibold mb-6">
            Sign up to see photos and videos from your friends.
          </p>

          <form className="w-full flex flex-col gap-2" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Mobile Number or Email"
              value={formData.email}
              onChange={handleChange}
              className="bg-[#fafafa] border border-insta-border text-sm rounded-sm focus:border-gray-400 outline-none w-full px-3 py-2"
              required
            />

            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className="bg-[#fafafa] border border-insta-border text-sm rounded-sm focus:border-gray-400 outline-none w-full px-3 py-2"
            />

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="bg-[#fafafa] border border-insta-border text-sm rounded-sm focus:border-gray-400 outline-none w-full px-3 py-2"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="bg-[#fafafa] border border-insta-border text-sm rounded-sm focus:border-gray-400 outline-none w-full px-3 py-2"
              required
            />

            <p className="text-[11px] text-insta-muted text-center px-2">
              People who use our service may have uploaded your contact information to Instagram.
            </p>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className={`mt-2 flex h-9 items-center justify-center rounded-lg text-sm font-semibold text-white transition
                ${loading || !isFormValid ? "bg-[#b2dffc] cursor-not-allowed" : "bg-[#0095f6] hover:bg-[#1877f2]"}`}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Sign up"}
            </button>

            {error && (
              <p className="text-red-500 text-xs mt-3 text-center">
                {error}
              </p>
            )}
          </form>
        </div>

        <div className="bg-white border border-insta-border rounded-sm py-5 text-center mt-4">
          <span className="text-sm text-[#262626]">Have an account? </span>
          <Link to="/login" className="text-[#0095f6] font-semibold text-sm hover:text-[#1877f2]">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
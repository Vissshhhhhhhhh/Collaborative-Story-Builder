import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { googleLogin } from "../api/authApi";
import { useLocation, useNavigate } from "react-router-dom";

function Login() {
  const { Login, signup, loading, isAuthenticated } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const location = useLocation();
  const redirectTo = location.state?.from || "/dashboard";
  const navigate = useNavigate();

  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleLogin,
    });

    google.accounts.id.renderButton(document.getElementById("googleBtn"), {
      theme: "outline",
      size: "large",
      width: 320,
    });
  }, []);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      isSignup ? await signup(form) : await Login(form);
    } catch (err) {
      setErrorMsg(
      err.response?.data?.message ||
        (isSignup ? "Signup failed" : "Invalid email or password")
      );
    }
  };

  const handleGoogleLogin = async (response) => {
    try {
      await googleLogin(response.credential);
      window.location.href = redirectTo, { replace: true };
    } catch (err) {
      console.error("Google login failed");
      console.error(err.message);
      setErrorMsg("Google login failed. Try again.");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-2 sm:px-0">
      <div className="bg-white p-6 sm:p-8 w-full max-w-sm sm:max-w-md rounded shadow mx-4">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isSignup ? "Create Account" : "Login"}
        </h2>

        {errorMsg && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <input
              name="name"
              placeholder="Name"
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          )}

          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded cursor-pointer hover:bg-gray-800 transition"
          >
            {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        <div className="my-4 text-center text-gray-500">OR</div>
        <div id="googleBtn" className="flex justify-center"></div>

        <p className="text-center mt-4 text-sm">
          {isSignup ? "Already have an account?" : "Don't have an account?"}
          <button
            className="ml-1 text-blue-600 cursor-pointer"
            onClick={() => {
              setIsSignup(!isSignup);
              setErrorMsg("");
            }}
          >
            {isSignup ? "Login" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;

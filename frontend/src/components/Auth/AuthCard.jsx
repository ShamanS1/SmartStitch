import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AuthPage({ initialMode = "login" }) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    profileImage: null,
    shopName: "",
    shopAddress: "",
    shopDescription: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    setIsLogin(initialMode === "login");
  }, [initialMode]);

  const handleSwitch = (mode) => {
    // Clear any previous messages
    setMessage({ text: "", type: "" });
    setIsLogin(mode === "login");
    navigate(mode === "login" ? "/login" : "/register");
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profileImage" && files.length > 0) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    if (isLogin) {
      if (!formData.email || !formData.password) {
        setMessage({ text: "Please fill in all required fields", type: "error" });
        return false;
      }
    } else {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setMessage({ text: "Please fill in all required fields", type: "error" });
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setMessage({ text: "Passwords do not match", type: "error" });
        return false;
      }
      if (formData.password.length < 6) {
        setMessage({ text: "Password must be at least 6 characters", type: "error" });
        return false;
      }
      if (role === "tailor" && (!formData.shopName || !formData.shopAddress)) {
        setMessage({ text: "Shop details are required for tailors", type: "error" });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setMessage({ text: "", type: "" });
    
    try {
      if (isLogin) {
        // Login logic
        const response = await axios.post("http://localhost:5000/api/auth/login", {
          email: formData.email,
          password: formData.password
        });
        
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);
        
        setMessage({ text: "Login successful! Redirecting...", type: "success" });
        setTimeout(() => {
          if (response.data.role === "customer") {
            navigate("/store");
          } else if (response.data.role === "tailor") {
            navigate("/tailor/profile");
          } 
          // else if (response.data.role === "admin") {
          //   navigate("/admin");
          // }
        }, 1500);
      } else {
        // Register logic
        const registerData = new FormData();
        registerData.append("name", formData.name);
        registerData.append("email", formData.email);
        registerData.append("password", formData.password);
        registerData.append("confirmPassword", formData.confirmPassword);
        registerData.append("role", role);
        
        if (formData.address) registerData.append("address", formData.address);
        if (formData.profileImage) registerData.append("profileImage", formData.profileImage);
        
        if (role === "tailor") {
          registerData.append("shopDetails", JSON.stringify({
            name: formData.shopName,
            address: formData.shopAddress,
            description: formData.shopDescription
          }));
        }
        
        const response = await axios.post("http://localhost:5000/api/auth/register", registerData);
        
        // Instead of showing a message, redirect to verify page with token
        // You need to get the token from the backend response
        // Example assumes backend returns { token: "..." }
        const token = response.data.token;
        navigate(`/verify-email/${token}`);
      }
    } catch (error) {
      console.error("Auth error:", error);
      setMessage({ 
        text: error.response?.data?.message || "An error occurred. Please try again.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Main Container with enhanced 3D effect and smooth transitions */}
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        
        {/* Animated Panels Container */}
        <div className="relative w-full flex flex-col lg:flex-row">
          
          {/* Moving Overlay for animation effect */}
          <div 
            className={`absolute top-0 w-full lg:w-1/2 h-full bg-gradient-to-br from-blue-600 to-purple-700 transform transition-transform duration-700 ease-in-out z-20 lg:z-10 ${
              isLogin ? 'lg:translate-x-full translate-y-0' : 'lg:translate-x-0 translate-y-0'
            }`}
          >
            <div className="flex flex-col justify-center items-center h-full text-white p-6 lg:p-12">
              <div className="max-w-md text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-white opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isLogin ? (
                      // Register Icon
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    ) : (
                      // Login Icon
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    )}
                  </svg>
                </div>
                <h2 className="text-4xl font-bold mb-4">{isLogin ? "New Here?" : "Welcome Back!"}</h2>
                <p className="text-lg opacity-90 mb-8">
                  {isLogin 
                    ? "Join our community and connect with the best tailors around. Start your tailoring journey today!"
                    : "Sign in to access your account and continue your tailoring journey with us."}
                </p>
                <button
                  onClick={() => handleSwitch(isLogin ? "register" : "login")}
                  className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                >
                  {isLogin ? "Create Account" : "Sign In"}
                </button>
              </div>
            </div>
          </div>
          
          {/* Login Form Panel - Always present but visibility controlled */}
          <div 
            className={`w-full lg:w-1/2 p-6 lg:p-12 transition-all duration-700 ease-out ${
              isLogin 
                ? 'opacity-100 z-10' 
                : 'opacity-0 lg:opacity-100 -z-10 lg:z-0'
            }`}
          >
            <div className="max-w-md mx-auto">
              <div className="mb-8 text-center">
                <div className="inline-block p-3 rounded-full bg-blue-50 mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h3>
                <p className="text-gray-500">Sign in to your account</p>
              </div>
              
              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {isLogin && message.text && (
                  <div className={`p-4 rounded-lg text-sm font-medium animate-fade-in ${
                    message.type === "error" 
                      ? "bg-red-50 text-red-700 border border-red-200" 
                      : "bg-green-50 text-green-700 border border-green-200"
                  }`}>
                    <div className="flex items-center">
                      {message.type === "error" ? (
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                      {message.text}
                    </div>
                  </div>
                )}
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                      Email Address
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                      placeholder="Enter your email"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                        Password
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                      placeholder="Enter your password"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-lg ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing In...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>
                
                <div className="relative flex py-3 items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-sm">Or continue with</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    className="py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                  >
                    <svg className="w-5 h-5 mx-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.2837 10.2969H19.5V10.25H12V13.75H16.8438C16.2812 15.5938 14.3125 17 12 17C9.10938 17 6.75 14.6406 6.75 11.75C6.75 8.85938 9.10938 6.5 12 6.5C13.3125 6.5 14.5 6.96875 15.4062 7.75L17.9062 5.25C16.3438 3.78125 14.2812 3 12 3C7.17188 3 3.25 6.92188 3.25 11.75C3.25 16.5781 7.17188 20.5 12 20.5C16.8281 20.5 20.75 16.5781 20.75 11.75C20.75 11.25 20.5312 10.75 20.2837 10.2969Z" fill="#FBC02D"/>
                      <path d="M4.09375 7.45312L6.92188 9.5C7.65625 7.78125 9.65625 6.5 12 6.5C13.3125 6.5 14.5 6.96875 15.4062 7.75L17.9062 5.25C16.3438 3.78125 14.2812 3 12 3C8.59375 3 5.65625 4.78125 4.09375 7.45312Z" fill="#E53935"/>
                      <path d="M12 20.5C14.2187 20.5 16.2187 19.7656 17.7812 18.3594L15.0625 16C14.2187 16.6406 13.1562 17 12 17C9.70312 17 7.73438 15.5938 7.17188 13.75L4.34375 16.0156C5.89062 18.6406 8.79688 20.5 12 20.5Z" fill="#4CAF50"/>
                      <path d="M20.2839 10.2969H19.5002V10.25H12.0002V13.75H16.8439C16.5783 14.6094 16.0627 15.3594 15.3752 15.9688C15.3752 15.9688 15.3752 15.9688 15.3752 15.9688L18.0939 18.3281C17.8439 18.5781 20.7502 16.25 20.7502 11.75C20.7502 11.25 20.5314 10.75 20.2839 10.2969Z" fill="#1565C0"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                  >
                    <svg className="w-5 h-5 mx-auto text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                  >
                    <svg className="w-5 h-5 mx-auto" fill="black" viewBox="0 0 24 24">
                      <path d="M22.1771 11.1195C22.1771 10.3223 22.1134 9.52554 21.9766 8.74951H11.9995V12.6629H17.7238C17.4532 13.9299 16.7187 15.0338 15.6302 15.7834V18.3139H19.0009C21.0555 16.428 22.1771 14.0175 22.1771 11.1195Z" fill="#4285F4"/>
                      <path d="M11.9995 22.0001C14.8351 22.0001 17.2112 21.0338 19.0037 18.3139L15.633 15.7834C14.7009 16.4177 13.493 16.7717 12.0023 16.7717C9.11195 16.7717 6.68421 14.9424 5.80402 12.4044H2.32812V14.9974C4.16087 19.1235 7.97311 22.0001 11.9995 22.0001Z" fill="#34A853"/>
                      <path d="M5.80114 12.4044C5.39915 11.1374 5.39915 9.76864 5.80114 8.50166V5.90869H2.32804C0.752461 8.86245 0.752461 12.0436 2.32804 14.9973L5.80114 12.4044Z" fill="#FBBC04"/>
                      <path d="M11.9995 5.22839C13.6107 5.20769 15.1648 5.82859 16.3283 6.94976L19.2948 3.98326C17.3852 2.17738 14.744 1.17217 11.9995 1.19568C7.97311 1.19568 4.16087 4.07225 2.32812 8.20108L5.80123 10.7941C6.67862 8.25328 9.10916 6.42399 11.9995 5.22839Z" fill="#EA4335"/>
                    </svg>
                  </button>
                </div>
                
                <p className="text-center text-sm text-gray-500 mt-6">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleSwitch("register")}
                    className="text-blue-600 font-medium hover:underline focus:outline-none"
                  >
                    Create Account
                  </button>
                </p>
              </form>
            </div>
          </div>
          
          {/* Register Form Panel - Always present but visibility controlled */}
          <div 
            className={`w-full lg:w-1/2 p-6 lg:p-10 transition-all duration-700 ease-out ${
              isLogin 
                ? 'opacity-0 lg:opacity-100 -z-10 lg:z-0' 
                : 'opacity-100 z-10'
            }`}
          >
            <div className="max-w-md mx-auto">
              <div className="mb-6 text-center">
                <div className="inline-block p-3 rounded-full bg-blue-50 mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h3>
                <p className="text-gray-500">Join our tailoring community</p>
              </div>
              
              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && message.text && (
                  <div className={`p-4 rounded-lg text-sm font-medium animate-fade-in ${
                    message.type === "error" 
                      ? "bg-red-50 text-red-700 border border-red-200" 
                      : "bg-green-50 text-green-700 border border-green-200"
                  }`}>
                    <div className="flex items-center">
                      {message.type === "error" ? (
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                      {message.text}
                    </div>
                  </div>
                )}
                
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                </div>
                
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    placeholder="Enter your email"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                    </svg>
                  </div>
                </div>
                
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    placeholder="Create a password"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                </div>
                
                <div className="relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    placeholder="Confirm password"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                  </div>
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    placeholder="Your address (optional)"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">Upload Profile Image (optional)</p>
                  <label className="flex flex-col items-center px-4 py-3 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="mt-2 text-sm text-gray-500">{formData.profileImage ? formData.profileImage.name : "Browse files"}</span>
                    <input 
                      type="file" 
                      name="profileImage"
                      onChange={handleChange}
                      className="hidden" 
                      accept="image/*"
                    />
                  </label>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-3">I want to register as:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setRole("customer")}
                      className={`cursor-pointer p-3 rounded-lg border transition-all ${
                        role === "customer"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          role === "customer" ? "border-blue-500" : "border-gray-400"
                        }`}>
                          {role === "customer" && (
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          )}
                        </div>
                        <span className="font-medium text-gray-800">Customer</span>
                      </div>
                      <p className="mt-2 text-xs text-gray-500 pl-7">Find tailors and order custom clothes</p>
                    </div>
                    
                    <div
                      onClick={() => setRole("tailor")}
                      className={`cursor-pointer p-3 rounded-lg border transition-all ${
                        role === "tailor"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          role === "tailor" ? "border-blue-500" : "border-gray-400"
                        }`}>
                          {role === "tailor" && (
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          )}
                        </div>
                        <span className="font-medium text-gray-800">Tailor</span>
                      </div>
                      <p className="mt-2 text-xs text-gray-500 pl-7">Showcase your work and get customers</p>
                    </div>
                  </div>
                </div>
                
                {/* Conditional Tailor Fields */}
                {role === "tailor" && (
                  <div className="space-y-4 border-t border-gray-200 pt-4 mt-4">
                    <h4 className="font-medium text-gray-700">Shop Details</h4>
                    
                    <div className="relative">
                      <input
                        type="text"
                        name="shopName"
                        value={formData.shopName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        placeholder="Shop name"
                        required={role === "tailor"}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="text"
                        name="shopAddress"
                        value={formData.shopAddress}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        placeholder="Shop address"
                        required={role === "tailor"}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <textarea
                        name="shopDescription"
                        value={formData.shopDescription}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        placeholder="Describe your services (optional)"
                        rows="3"
                      ></textarea>
                      <div className="absolute top-3 left-0 pl-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-lg ${
                      loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Account...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
                
                <div className="relative flex py-3 items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-sm">Or sign up with</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    className="py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                  >
                    <svg className="w-5 h-5 mx-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.2837 10.2969H19.5V10.25H12V13.75H16.8438C16.2812 15.5938 14.3125 17 12 17C9.10938 17 6.75 14.6406 6.75 11.75C6.75 8.85938 9.10938 6.5 12 6.5C13.3125 6.5 14.5 6.96875 15.4062 7.75L17.9062 5.25C16.3438 3.78125 14.2812 3 12 3C7.17188 3 3.25 6.92188 3.25 11.75C3.25 16.5781 7.17188 20.5 12 20.5C16.8281 20.5 20.75 16.5781 20.75 11.75C20.75 11.25 20.5312 10.75 20.2837 10.2969Z" fill="#FBC02D"/>
                      <path d="M4.09375 7.45312L6.92188 9.5C7.65625 7.78125 9.65625 6.5 12 6.5C13.3125 6.5 14.5 6.96875 15.4062 7.75L17.9062 5.25C16.3438 3.78125 14.2812 3 12 3C8.59375 3 5.65625 4.78125 4.09375 7.45312Z" fill="#E53935"/>
                      <path d="M12 20.5C14.2187 20.5 16.2187 19.7656 17.7812 18.3594L15.0625 16C14.2187 16.6406 13.1562 17 12 17C9.70312 17 7.73438 15.5938 7.17188 13.75L4.34375 16.0156C5.89062 18.6406 8.79688 20.5 12 20.5Z" fill="#4CAF50"/>
                      <path d="M20.2839 10.2969H19.5002V10.25H12.0002V13.75H16.8439C16.5783 14.6094 16.0627 15.3594 15.3752 15.9688C15.3752 15.9688 15.3752 15.9688 15.3752 15.9688L18.0939 18.3281C17.8439 18.5781 20.7502 16.25 20.7502 11.75C20.7502 11.25 20.5314 10.75 20.2839 10.2969Z" fill="#1565C0"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                  >
                    <svg className="w-5 h-5 mx-auto text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                  >
                    <svg className="w-5 h-5 mx-auto" fill="black" viewBox="0 0 24 24">
                      <path d="M22.1771 11.1195C22.1771 10.3223 22.1134 9.52554 21.9766 8.74951H11.9995V12.6629H17.7238C17.4532 13.9299 16.7187 15.0338 15.6302 15.7834V18.3139H19.0009C21.0555 16.428 22.1771 14.0175 22.1771 11.1195Z" fill="#4285F4"/>
                      <path d="M11.9995 22.0001C14.8351 22.0001 17.2112 21.0338 19.0037 18.3139L15.633 15.7834C14.7009 16.4177 13.493 16.7717 12.0023 16.7717C9.11195 16.7717 6.68421 14.9424 5.80402 12.4044H2.32812V14.9974C4.16087 19.1235 7.97311 22.0001 11.9995 22.0001Z" fill="#34A853"/>
                      <path d="M5.80114 12.4044C5.39915 11.1374 5.39915 9.76864 5.80114 8.50166V5.90869H2.32804C0.752461 8.86245 0.752461 12.0436 2.32804 14.9973L5.80114 12.4044Z" fill="#FBBC04"/>
                      <path d="M11.9995 5.22839C13.6107 5.20769 15.1648 5.82859 16.3283 6.94976L19.2948 3.98326C17.3852 2.17738 14.744 1.17217 11.9995 1.19568C7.97311 1.19568 4.16087 4.07225 2.32812 8.20108L5.80123 10.7941C6.67862 8.25328 9.10916 6.42399 11.9995 5.22839Z" fill="#EA4335"/>
                    </svg>
                  </button>
                </div>
                
                <p className="text-center text-sm text-gray-500 mt-6">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleSwitch("login")}
                    className="text-blue-600 font-medium hover:underline focus:outline-none"
                  >
                    Sign In
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
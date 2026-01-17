import { createContext, useContext, useState, useEffect} from "react";
import * as authApi from "../api/authApi";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }){
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user,setUsers] = useState(null);

    // getting auth status from backend while the state var
    // gets refreshed when page reloads
    useEffect(() => {
        let isMounted = true;

        async function checkAuth() {
                try {
                        const res = await axios.get("http://localhost:5000/api/auth/me", {
                        withCredentials: true,
                    });

                    if (isMounted) {
                        setIsAuthenticated(true);
                        setUsers(res.data);
                    }
                } catch {
                    if (isMounted) {
                        setIsAuthenticated(false);
                        setUsers(null);
                    }
                } finally {
                    if (isMounted) setLoading(false);
                }
            }
        checkAuth();

        return () => {
            isMounted = false;
        };
    }, []);


    const Login = async (data) => {
        setLoading(true);
        try {
            await authApi.login(data);

            const res = await axios.get("http://localhost:5000/api/auth/me", {
            withCredentials: true,
            });

            setUsers(res.data);
            setIsAuthenticated(true);
        } catch (err) {
            console.error("Login failed:", err.response?.data?.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };


    const signup = async (data) => {
        setLoading(true);
        try {
            await authApi.signup(data);

            const res = await axios.get("http://localhost:5000/api/auth/me", {
            withCredentials: true,
            });

            setUsers(res.data);
            setIsAuthenticated(true);
        } catch (err) {
            console.error("Signup failed:", err.response?.data?.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };


    const logout = async () => {
        try {
            await fetch("http://localhost:5000/api/auth/logout", {
            method: "POST",
            credentials: "include"
            });
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            setIsAuthenticated(false);
            setUsers(null);
        }
    };



    return (
        <AuthContext.Provider
          value={{isAuthenticated,loading,Login,signup,logout,user}}>
            {children}
        </AuthContext.Provider>
    )
}
export const useAuth = () => useContext(AuthContext)
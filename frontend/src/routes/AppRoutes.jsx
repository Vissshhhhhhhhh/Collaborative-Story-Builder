import {BrowserRouter,Routes, Route} from "react-router-dom"

import Welcome from "../pages/Welcome";
import Login from "../pages/Login";
import Main from "../pages/Main";
import Dashboard from "../pages/Dashboard";
import Editor from "../pages/Editor";
import ProtectedRoute from "../components/common/ProtectedRoute";
import Reader from "../pages/Reader";

function AppRoutes(){
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/main" element={<Main />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/editor/:storyId" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
                <Route path="/reader/:source/:id" element={<Reader />} />
            </Routes>
        </BrowserRouter>
    );
}
export default AppRoutes;

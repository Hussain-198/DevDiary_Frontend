import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/TasksPage";
import AllTasksPage from "./pages/AllGoalsPage";
import ProgressPage from "./pages/ProgressPage";
import Navbar from "./components/NavigationBar";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/allgoals" element={<AllTasksPage />}/>
        <Route path="/tasks/:id" element={<TasksPage />} />
        <Route path="/progress" element={<ProgressPage />} />
      </Routes> 
    </>
  );
}

export default App;

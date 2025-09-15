import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/ui/Layout";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Rewards from "./pages/Rewards";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout currentPageName="Home"><Home /></Layout>} />
        <Route path="/home" element={<Layout currentPageName="Home"><Home /></Layout>} />
        <Route path="/courses" element={<Layout currentPageName="Courses"><Courses /></Layout>} />
        <Route path="/course-detail" element={<Layout currentPageName="CourseDetail"><CourseDetail /></Layout>} />
        <Route path="/rewards" element={<Layout currentPageName="Rewards"><Rewards /></Layout>} />
        <Route path="/profile" element={<Layout currentPageName="Profile"><Profile /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;


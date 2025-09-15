
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Assuming your backend is running on http://localhost:5000
        // In a real deployment, this URL would be dynamic or configured
        const response = await axios.get('http://localhost:5000/api/courses');
        setCourses(response.data.courses);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <div className="container mx-auto p-4">Loading courses...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Available Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course._id} className="bg-white shadow-lg rounded-lg overflow-hidden">
            {course.image_url && (
              <img src={course.image_url} alt={course.title} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
              <p className="text-gray-600 text-sm mb-4">{course.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                <span>Country: {course.country}</span>
                <span>Difficulty: {course.difficulty}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Points: {course.points_reward}</span>
                {course.duration_minutes && <span>Duration: {course.duration_minutes} min</span>}
              </div>
              {course.tags && course.tags.length > 0 && (
                <div className="mt-2">
                  {course.tags.map((tag, index) => (
                    <span key={index} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-gray-700 mt-4">{course.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;



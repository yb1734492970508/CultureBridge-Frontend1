export class UserProgress {
  static async filter({ user_email, course_id }) {
    // Mock API call
    const allProgress = [
      {
        id: "up-1",
        user_email: "test@example.com",
        course_id: "course-1",
        status: "completed",
        progress_percentage: 100,
        points_earned: 100,
        completion_date: "2025-09-10"
      },
      {
        id: "up-2",
        user_email: "test@example.com",
        course_id: "course-2",
        status: "in_progress",
        progress_percentage: 50,
        points_earned: 0,
        completion_date: null
      },
      {
        id: "up-3",
        user_email: "test@example.com",
        course_id: "course-4",
        status: "not_started",
        progress_percentage: 0,
        points_earned: 0,
        completion_date: null
      }
    ];

    let filtered = allProgress;

    if (user_email) {
      filtered = filtered.filter(p => p.user_email === user_email);
    }
    if (course_id) {
      filtered = filtered.filter(p => p.course_id === course_id);
    }
    return filtered;
  }

  static async create(data) {
    console.log("模拟创建用户进度:", data);
    // In a real app, this would call a backend API to create user progress
    return new Promise(resolve => setTimeout(() => {
      console.log("模拟用户进度创建成功");
      resolve({ id: `up-${Math.random().toString(36).substr(2, 9)}`, ...data });
    }, 500));
  }

  static async update(id, data) {
    console.log(`模拟更新用户进度 ${id}:`, data);
    // In a real app, this would call a backend API to update user progress
    return new Promise(resolve => setTimeout(() => {
      console.log("模拟用户进度更新成功");
      resolve({ id, ...data });
    }, 500));
  }
}


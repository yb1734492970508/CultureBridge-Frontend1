export class User {
  static async me() {
    // Mock API call for logged-in user
    return {
      id: "user-1",
      email: "test@example.com",
      full_name: "测试用户",
      avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=测试用户",
      total_points: 500,
      level: 5,
      learning_streak: 7,
      last_learning_date: "2025-09-14"
    };
  }

  static async loginWithRedirect(redirectUrl) {
    console.log("模拟登录重定向到:", redirectUrl);
    // In a real app, this would redirect to an auth provider
    // For now, we'll just simulate a successful login after a delay
    return new Promise(resolve => setTimeout(() => {
      console.log("模拟登录成功");
      resolve();
    }, 1000));
  }

  static async updateMyUserData(data) {
    console.log("模拟更新用户数据:", data);
    // In a real app, this would call a backend API to update user data
    return new Promise(resolve => setTimeout(() => {
      console.log("模拟用户数据更新成功");
      resolve();
    }, 500));
  }
}


export class Reward {
  static async list(sort = "_id", limit = 0) {
    // Mock API call
    return [
      {
        id: "reward-1",
        name: "文化探索者徽章",
        description: "完成5门课程后获得的荣誉徽章，象征着您对世界文化的热爱。",
        points_cost: 200,
        image_url: "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        category: "digital",
        stock: -1, // -1 means unlimited
        is_active: true
      },
      {
        id: "reward-2",
        name: "全球文化地图",
        description: "一张精美的全球文化地图，标记了世界各地的文化遗产和风俗。",
        points_cost: 500,
        image_url: "https://images.unsplash.com/photo-1593640408187-3a270fa2172f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        category: "physical",
        stock: 10,
        is_active: true
      },
      {
        id: "reward-3",
        name: "文化交流线上沙龙入场券",
        description: "参与每月一次的线上文化交流沙龙，与全球文化爱好者互动。",
        points_cost: 300,
        image_url: "https://images.unsplash.com/photo-1522204523234-8729aa6e993f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        category: "experience",
        stock: 50,
        is_active: true
      },
      {
        id: "reward-4",
        name: "文化周边商品八折优惠券",
        description: "在CultureBridge周边商城购买任意商品可享八折优惠。",
        points_cost: 150,
        image_url: "https://images.unsplash.com/photo-1563297007-0686b7015608?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        category: "discount",
        stock: -1,
        is_active: true
      },
      {
        id: "reward-5",
        name: "定制文化明信片",
        description: "选择您喜欢的国家，定制一张专属的文化主题明信片。",
        points_cost: 250,
        image_url: "https://images.unsplash.com/photo-1587563020088-517176717647?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        category: "physical",
        stock: 20,
        is_active: true
      },
      {
        id: "reward-6",
        name: "文化知识挑战赛资格",
        description: "获得参与CultureBridge文化知识挑战赛的资格，赢取更多积分。",
        points_cost: 100,
        image_url: "https://images.unsplash.com/photo-1546410531-bb4695029a9a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        category: "digital",
        stock: -1,
        is_active: true
      },
      {
        id: "reward-7",
        name: "文化主题电子书",
        description: "一本关于世界各地文化习俗和历史的精选电子书。",
        points_cost: 180,
        image_url: "https://images.unsplash.com/photo-1507842217343-583fd0462b34?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        category: "digital",
        stock: -1,
        is_active: true
      },
      {
        id: "reward-8",
        name: "文化主题T恤",
        description: "一件印有独特文化图案的T恤，展现您的文化品味。",
        points_cost: 400,
        image_url: "https://images.unsplash.com/photo-1576566588028-cdfd7ee8467d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        category: "physical",
        stock: 5,
        is_active: true
      },
      {
        id: "reward-9",
        name: "文化纪录片观看券",
        description: "免费观看一部精选的文化主题纪录片。",
        points_cost: 80,
        image_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        category: "digital",
        stock: -1,
        is_active: true
      },
      {
        id: "reward-10",
        name: "文化美食体验券",
        description: "在指定合作餐厅享受一次异国文化美食体验。",
        points_cost: 600,
        image_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        category: "experience",
        stock: 3,
        is_active: true
      }
    ].sort((a, b) => {
      if (sort === "_id") return a.id.localeCompare(b.id);
      if (sort === "-created_date") return b.id.localeCompare(a.id); // Mocking by id for now
      return 0;
    }).slice(0, limit || undefined);
  }

  static async update(id, data) {
    console.log(`模拟更新奖励 ${id}:`, data);
    // In a real app, this would call a backend API to update reward data
    return new Promise(resolve => setTimeout(() => {
      console.log("模拟奖励数据更新成功");
      resolve({ id, ...data });
    }, 500));
  }
}


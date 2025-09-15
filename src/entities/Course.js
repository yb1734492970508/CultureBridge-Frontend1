export class Course {
  static async list(sort = "_id", limit = 0) {
    // Mock API call
    return [
      {
        id: "course-1",
        title: "中国传统文化",
        description: "深入了解中国的历史、哲学、艺术和风俗习惯。",
        image_url: "https://images.unsplash.com/photo-1547989453-010379057888?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        country: "china",
        difficulty: "beginner",
        points_reward: 100,
        duration_minutes: 60,
        content: "本课程将带您领略中国传统文化的博大精深，从儒家思想、道家哲学到诗词歌赋、书法绘画，再到传统节日和民间艺术，全面展现中华文明的独特魅力。您将学习到中国传统文化的形成与发展，理解其核心价值观，并欣赏到丰富多彩的文化遗产。",
        tags: ["历史", "哲学", "艺术", "风俗"]
      },
      {
        id: "course-2",
        title: "美国流行文化",
        description: "探索美国电影、音乐、时尚和科技如何影响全球。",
        image_url: "https://images.unsplash.com/photo-1516251193007-455270677a17?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        country: "usa",
        difficulty: "intermediate",
        points_reward: 150,
        duration_minutes: 90,
        content: "本课程将深入剖析美国流行文化的方方面面，包括好莱坞电影的演变、摇滚乐和嘻哈音乐的兴起、时尚潮流的变迁以及硅谷科技的创新。您将了解到美国流行文化如何在全球范围内传播并产生深远影响，同时探讨其背后的社会、经济和政治因素。",
        tags: ["电影", "音乐", "时尚", "科技"]
      },
      {
        id: "course-3",
        title: "日本动漫与次文化",
        description: "了解日本动漫、漫画、J-Pop和独特青年文化。",
        image_url: "https://images.unsplash.com/photo-1503756234508-e32369269eb3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        country: "japan",
        difficulty: "beginner",
        points_reward: 120,
        duration_minutes: 75,
        content: "本课程将带您走进日本动漫的奇妙世界，从经典作品到最新潮流，深入探讨其艺术风格、叙事技巧和全球影响力。同时，您还将了解到日本独特的次文化，如Cosplay、偶像文化和电子游戏，以及它们如何塑造了日本年轻一代的生活方式和价值观。",
        tags: ["动漫", "漫画", "J-Pop", "青年文化"]
      },
      {
        id: "course-4",
        title: "法国艺术与美食",
        description: "品味法国的绘画、雕塑、建筑和世界闻名的烹饪艺术。",
        image_url: "https://images.unsplash.com/photo-1502602898664-343733af70e7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        country: "france",
        difficulty: "advanced",
        points_reward: 200,
        duration_minutes: 120,
        content: "本课程将带领您沉浸在法国的艺术与美食之中。您将探索法国绘画大师的杰作、哥特式教堂的宏伟建筑、卢浮宫的珍藏，并了解法国艺术史的演变。此外，课程还将介绍法国烹饪的精髓，从米其林星级餐厅到地方特色小吃，让您领略法式美食的独特魅力和文化内涵。",
        tags: ["艺术", "美食", "绘画", "建筑"]
      },
      {
        id: "course-5",
        title: "德国工业与哲学",
        description: "解析德国的工业革命、古典哲学和现代科技创新。",
        image_url: "https://images.unsplash.com/photo-1523784003020-81992013919e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        country: "germany",
        difficulty: "intermediate",
        points_reward: 160,
        duration_minutes: 100,
        content: "本课程将带您回顾德国的工业发展历程，从蒸汽机时代到汽车工业的崛起，再到现代高科技制造。同时，您将深入学习康德、黑格尔等德国古典哲学家的思想，理解其对西方文明的深远影响。课程还将探讨德国在可再生能源、人工智能等领域的最新科技创新。",
        tags: ["工业", "哲学", "科技", "历史"]
      },
      {
        id: "course-6",
        title: "意大利文艺复兴",
        description: "重温意大利文艺复兴时期的辉煌艺术、文学和科学成就。",
        image_url: "https://images.unsplash.com/photo-1529253355930-dd3811186320?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        country: "italy",
        difficulty: "advanced",
        points_reward: 180,
        duration_minutes: 110,
        content: "本课程将带您穿越时空，回到意大利文艺复兴的黄金时代。您将学习达芬奇、米开朗基罗、拉斐尔等艺术巨匠的生平与作品，了解《神曲》、《君主论》等文学经典，并探讨哥白尼、伽利略等科学家在天文学和物理学领域的突破。课程将全面展现文艺复兴对欧洲乃至世界文明的深远影响。",
        tags: ["文艺复兴", "艺术", "文学", "科学"]
      },
      {
        id: "course-7",
        title: "西班牙弗拉门戈与斗牛",
        description: "体验西班牙独特的弗拉门戈舞蹈、音乐和传统斗牛文化。",
        image_url: "https://images.unsplash.com/photo-1560928960-93716942004a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        country: "spain",
        difficulty: "beginner",
        points_reward: 90,
        duration_minutes: 50,
        content: "本课程将带您走进热情奔放的西班牙文化。您将学习弗拉门戈舞蹈的历史渊源、音乐特点和表演形式，感受其独特的艺术魅力。同时，课程还将介绍西班牙传统斗牛的起源、规则和文化象征意义，探讨其在西班牙社会中的地位和争议。",
        tags: ["舞蹈", "音乐", "斗牛", "传统"]
      },
      {
        id: "course-8",
        title: "韩国流行音乐与时尚",
        description: "分析K-Pop、韩剧、韩国美妆和时尚潮流的全球影响力。",
        image_url: "https://images.unsplash.com/photo-1580971033971-06769123013a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        country: "korea",
        difficulty: "intermediate",
        points_reward: 140,
        duration_minutes: 80,
        content: "本课程将深入探讨韩国流行文化在全球范围内的崛起。您将了解K-Pop音乐的制作流程、偶像团体的成功秘诀、韩剧的叙事特点和传播策略。同时，课程还将介绍韩国美妆和时尚产业的最新趋势，分析其如何影响全球年轻人的审美和消费习惯。",
        tags: ["K-Pop", "韩剧", "美妆", "时尚"]
      },
      {
        id: "course-9",
        title: "印度瑜伽与哲学",
        description: "学习印度瑜伽的起源、体式、冥想和古老哲学思想。",
        image_url: "https://images.unsplash.com/photo-1552196563-55cd13ea31ad?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        country: "india",
        difficulty: "beginner",
        points_reward: 110,
        duration_minutes: 65,
        content: "本课程将带您探索印度瑜伽的古老智慧。您将学习瑜伽的起源和发展，掌握基本的瑜伽体式和呼吸法，体验冥想的益处。同时，课程还将介绍印度教和佛教的哲学思想，理解其对瑜伽实践和印度文化的影响。",
        tags: ["瑜伽", "哲学", "冥想", "宗教"]
      },
      {
        id: "course-10",
        title: "巴西桑巴与狂欢节",
        description: "感受巴西桑巴舞的节奏、狂欢节的激情和多元文化。",
        image_url: "https://images.unsplash.com/photo-1517457373958-b7bdd458ce93?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        country: "brazil",
        difficulty: "intermediate",
        points_reward: 130,
        duration_minutes: 70,
        content: "本课程将带您体验巴西的活力与激情。您将学习桑巴舞的历史、舞步和音乐特点，感受其独特的魅力。同时，课程还将介绍巴西狂欢节的起源、传统和庆祝方式，了解其在巴西文化中的重要地位。此外，您还将探索巴西多元文化的融合与发展。",
        tags: ["桑巴", "狂欢节", "舞蹈", "音乐"]
      }
    ].sort((a, b) => {
      if (sort === "_id") return a.id.localeCompare(b.id);
      if (sort === "-created_date") return b.id.localeCompare(a.id); // Mocking by id for now
      return 0;
    }).slice(0, limit || undefined);
  }
}


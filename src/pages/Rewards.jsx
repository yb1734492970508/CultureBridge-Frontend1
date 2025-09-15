import React, { useState, useEffect } from "react";
import { Reward, User } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Gift, Award, Coins, ShoppingBag, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function Rewards() {
  const [rewards, setRewards] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isExchanging, setIsExchanging] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allRewards = await Reward.list("-created_date");
      setRewards(allRewards);
      
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        console.log("用户未登录");
      }
    } catch (error) {
      console.error("加载奖励数据失败:", error);
    }
  };

  const exchangeReward = async (reward) => {
    if (!user || user.total_points < reward.points_cost) return;

    setIsExchanging(prev => ({ ...prev, [reward.id]: true }));
    
    try {
      const newTotalPoints = user.total_points - reward.points_cost;
      await User.updateMyUserData({
        total_points: newTotalPoints
      });

      // Update stock if applicable
      if (reward.stock > 0) {
        await Reward.update(reward.id, {
          stock: reward.stock - 1
        });
      }

      setUser(prev => ({ ...prev, total_points: newTotalPoints }));
      setRewards(prev => prev.map(r => 
        r.id === reward.id ? { ...r, stock: Math.max(0, r.stock - 1) } : r
      ));

      // Show success message (you can replace with a toast)
      alert(`成功兑换 ${reward.name}!`);
    } catch (error) {
      console.error("兑换失败:", error);
      alert("兑换失败，请稍后重试");
    } finally {
      setIsExchanging(prev => ({ ...prev, [reward.id]: false }));
    }
  };

  const filteredRewards = selectedCategory === "all" 
    ? rewards 
    : rewards.filter(r => r.category === selectedCategory);

  const getCategoryIcon = (category) => {
    switch (category) {
      case "digital": return <Zap className="w-4 h-4" />;
      case "physical": return <ShoppingBag className="w-4 h-4" />;
      case "experience": return <Star className="w-4 h-4" />;
      case "discount": return <Coins className="w-4 h-4" />;
      default: return <Gift className="w-4 h-4" />;
    }
  };

  const getCategoryName = (category) => {
    switch (category) {
      case "digital": return "数字奖励";
      case "physical": return "实物奖励";
      case "experience": return "体验奖励";
      case "discount": return "优惠券";
      default: return "其他";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "digital": return "bg-blue-100 text-blue-800 border-blue-200";
      case "physical": return "bg-green-100 text-green-800 border-green-200";
      case "experience": return "bg-purple-100 text-purple-800 border-purple-200";
      case "discount": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">奖励商城</h1>
            <p className="text-gray-600">使用您的积分兑换精美奖励</p>
          </div>
          {user && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none mt-4 md:mt-0">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Coins className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">我的积分</p>
                    <p className="text-3xl font-bold">{user.total_points || 0}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5 bg-white/80 backdrop-blur-sm">
              <TabsTrigger value="all" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                全部
              </TabsTrigger>
              <TabsTrigger value="digital" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                数字奖励
              </TabsTrigger>
              <TabsTrigger value="physical" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                实物奖励
              </TabsTrigger>
              <TabsTrigger value="experience" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                体验奖励
              </TabsTrigger>
              <TabsTrigger value="discount" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                优惠券
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.map((reward, index) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden bg-white/80 backdrop-blur-sm border-white/20 h-full">
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-500 relative overflow-hidden">
                    {reward.image_url && (
                      <img 
                        src={reward.image_url} 
                        alt={reward.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge className={getCategoryColor(reward.category)}>
                        <div className="flex items-center gap-1">
                          {getCategoryIcon(reward.category)}
                          {getCategoryName(reward.category)}
                        </div>
                      </Badge>
                    </div>
                    
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <div className="flex items-center gap-1 text-sm font-semibold text-gray-800">
                          <Award className="w-4 h-4" />
                          {reward.points_cost}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors duration-300">
                      {reward.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{reward.description}</p>
                  </div>
                  
                  <div className="space-y-3">
                    {reward.stock !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">库存</span>
                        <span className={`font-medium ${reward.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {reward.stock > 0 ? `${reward.stock} 件` : '售罄'}
                        </span>
                      </div>
                    )}
                    
                    {user ? (
                      <Button 
                        className={`w-full ${
                          user.total_points >= reward.points_cost && reward.stock !== 0
                            ? 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        onClick={() => exchangeReward(reward)}
                        disabled={
                          user.total_points < reward.points_cost || 
                          reward.stock === 0 || 
                          isExchanging[reward.id] ||
                          !reward.is_active
                        }
                      >
                        {isExchanging[reward.id] ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            兑换中...
                          </div>
                        ) : user.total_points < reward.points_cost ? (
                          '积分不足'
                        ) : reward.stock === 0 ? (
                          '已售罄'
                        ) : !reward.is_active ? (
                          '暂不可兑换'
                        ) : (
                          <div className="flex items-center gap-2">
                            <Gift className="w-4 h-4" />
                            立即兑换
                          </div>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        onClick={() => User.loginWithRedirect(window.location.href)}
                      >
                        登录后兑换
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredRewards.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 text-6xl mb-4">🎁</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无相关奖励</h3>
            <p className="text-gray-500">更多精彩奖励即将上线，敬请期待！</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

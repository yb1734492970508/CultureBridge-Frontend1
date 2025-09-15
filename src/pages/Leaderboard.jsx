import React, { useState, useEffect } from "react";
import { User } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Award, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadLeaderboardData();
  }, []);

  const loadLeaderboardData = async () => {
    try {
      const users = await User.list("-total_points", 50); // Get top 50 users
      setLeaderboard(users);

      try {
        const me = await User.me();
        setCurrentUser(me);
      } catch (error) {
        console.log("用户未登录");
      }
    } catch (error) {
      console.error("加载排行榜数据失败:", error);
    }
  };

  const getRankColor = (rank) => {
    if (rank === 1) return "bg-yellow-400 text-white";
    if (rank === 2) return "bg-gray-400 text-white";
    if (rank === 3) return "bg-orange-400 text-white";
    return "bg-gray-200 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">排行榜</h1>
          <p className="text-gray-600 text-lg">看看谁是文化学习的佼佼者！</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="p-4 font-semibold text-gray-600">排名</th>
                      <th className="p-4 font-semibold text-gray-600">用户</th>
                      <th className="p-4 font-semibold text-gray-600 text-right">等级</th>
                      <th className="p-4 font-semibold text-gray-600 text-right">积分</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        className={`border-t border-gray-200/80 ${
                          currentUser?.email === user.email
                            ? "bg-purple-100/50"
                            : "hover:bg-gray-50/50"
                        }`}
                      >
                        <td className="p-4 align-middle">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${getRankColor(
                              index + 1
                            )}`}
                          >
                            {index + 1}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback className="bg-gray-200 text-gray-600">
                                {user.full_name?.[0] || user.email[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {user.full_name || user.email.split("@")[0]}
                              </p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-right align-middle">
                          <div className="flex items-center justify-end gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-semibold text-gray-800">{user.level || 1}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right align-middle">
                          <div className="flex items-center justify-end gap-2">
                            <Award className="w-4 h-4 text-purple-500" />
                            <span className="font-bold text-lg text-purple-800">
                              {user.total_points || 0}
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {leaderboard.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>排行榜正在生成中...</p>
          </div>
        )}
      </div>
    </div>
  );
}



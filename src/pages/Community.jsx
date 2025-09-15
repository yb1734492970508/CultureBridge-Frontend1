import React, { useState, useEffect } from "react";
import { Post, User } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, ThumbsUp, Share2, Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPosts();
    loadUser();
  }, []);

  const loadPosts = async () => {
    try {
      const allPosts = await Post.list("-created_date");
      setPosts(allPosts);
    } catch (error) {
      console.error("加载帖子失败:", error);
    }
  };

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.log("用户未登录");
    }
  };

  const handleNewPostChange = (event) => {
    setNewPostContent(event.target.value);
  };

  const handleSubmitNewPost = async () => {
    if (!user) {
      alert("请先登录才能发布帖子。");
      try {
        await User.loginWithRedirect(window.location.href);
      } catch (error) {
        console.error("登录失败:", error);
      }
      return;
    }

    if (newPostContent.trim() === "") {
      alert("帖子内容不能为空。");
      return;
    }

    setIsSubmitting(true);
    try {
      await Post.create({
        user_email: user.email,
        user_name: user.full_name || user.email.split("@")[0],
        user_avatar_url: user.avatar_url || "",
        content: newPostContent,
        likes: 0,
        comments: 0,
        created_date: new Date().toISOString().split("T")[0]
      });
      setNewPostContent("");
      loadPosts(); // Reload posts to show the new one
    } catch (error) {
      console.error("发布帖子失败:", error);
      alert("发布帖子失败，请稍后重试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId, currentLikes) => {
    if (!user) {
      alert("请先登录才能点赞。");
      try {
        await User.loginWithRedirect(window.location.href);
      } catch (error) {
        console.error("登录失败:", error);
      }
      return;
    }
    try {
      await Post.update(postId, { likes: currentLikes + 1 });
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, likes: currentLikes + 1 } : post
      ));
    } catch (error) {
      console.error("点赞失败:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-3xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">社区论坛</h1>
          <p className="text-gray-600">分享您的文化见解，与全球学习者交流</p>
        </motion.div>

        {/* New Post Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4 mb-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback>{user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <Textarea
                  placeholder="分享您的想法..."
                  value={newPostContent}
                  onChange={handleNewPostChange}
                  className="flex-1 bg-white/50 border-gray-300 focus-visible:ring-purple-500"
                  rows={3}
                />
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                onClick={handleSubmitNewPost}
                disabled={isSubmitting || newPostContent.trim() === ""}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    发布中...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    发布
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-white/20">
                <CardHeader className="flex flex-row items-center space-x-4 p-6 pb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={post.user_avatar_url} />
                    <AvatarFallback>{post.user_name?.[0] || post.user_email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {post.user_name || post.user_email.split("@")[0]}
                    </CardTitle>
                    <p className="text-gray-500 text-sm">{post.created_date}</p>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <p className="text-gray-800 mb-4 leading-relaxed">{post.content}</p>
                  <div className="flex items-center space-x-4 text-gray-500 text-sm">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
                      onClick={() => handleLike(post.id, post.likes)}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {post.likes} 赞
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-600 hover:text-green-600">
                      <MessageCircle className="w-4 h-4" />
                      {post.comments} 评论
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-600 hover:text-purple-600">
                      <Share2 className="w-4 h-4" />
                      分享
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {posts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无帖子</h3>
            <p className="text-gray-500">成为第一个分享您的想法的人！</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}



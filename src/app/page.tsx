"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoSparkles, IoHeart, IoShareSocial, IoBookmark } from "react-icons/io5";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUrls, setImageUrls] =  useState<string[]>([]);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setIsLoadingFeed(true);
    try {
      const response = await fetch("/api/get-images");
      const data = await response.json();
      setImageUrls(data);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setIsLoadingFeed(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to generate image");
      }

      if (data.imageUrl) {
        const image = new Image();
        image.onload = () => {
          setImageUrl(data.imageUrl);
          fetchImages();
        };
        image.src = data.imageUrl;
      }

      setInputText("");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="w-full px-6 py-4 backdrop-blur-lg bg-white/90 dark:bg-black/90 fixed top-0 z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <IoSparkles className="text-purple-600" />
            AI Gallery
          </h1>
        </div>
      </header>

      {/* Main Content */}

      <main className="pt-24 pb-32 max-w-7xl mx-auto px-4">
      {isLoadingFeed ? (
        // Skeleton 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl animate-pulse">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {imageUrls.map((image, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={image.url}
                  alt={`Generated ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      className="hover:text-red-500 transition-colors"
                    >
                      <IoHeart className="text-xl" />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      className="hover:text-blue-500 transition-colors"
                    >
                      <IoShareSocial className="text-xl" />
                    </motion.button>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    className="hover:text-purple-500 transition-colors"
                  >
                    <IoBookmark className="text-xl" />
                  </motion.button>
                </div>
                
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-black/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex gap-3">
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-800 dark:text-gray-200 transition-all"
                placeholder="Describe your imagination..."
                disabled={isLoading}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    <span>Creating Magic...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <IoSparkles className="text-xl" />
                    <span>Generate</span>
                  </div>
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </footer>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full animate-pulse" />
                  <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Creating Your Image...
                </h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <div className="fixed bottom-24 right-4 space-y-4">
        <AnimatePresence>
          {imageUrl && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="bg-green-500 text-white px-6 py-3 rounded-2xl shadow-lg"
            >
              Image generated successfully! 🎨
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
    </div>
  );
}
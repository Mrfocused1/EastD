"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseAuth, UserFavorite } from "@/lib/supabase-auth";
import {
  ArrowLeft,
  Heart,
  Loader2,
  Trash2,
  MapPin,
  Calendar,
} from "lucide-react";

const STUDIOS = [
  { slug: "studio-dock-one", name: "Studio Dock One", location: "30 Seagull Lane, London, E16 1YP" },
  { slug: "studio-dock-two", name: "Studio Dock Two", location: "30 Seagull Lane, London, E16 1YP" },
  { slug: "studio-wharf", name: "Studio Wharf", location: "30 Seagull Lane, London, E16 1YP" },
  { slug: "photography", name: "Photography Studio", location: "30 Seagull Lane, London, E16 1YP" },
];

export default function FavoritesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  async function loadFavorites() {
    try {
      const { data, error } = await supabaseAuth
        .from("user_favorites")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (data) setFavorites(data);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoadingFavorites(false);
    }
  }

  async function addFavorite(studioSlug: string, studioName: string) {
    try {
      const { error } = await supabaseAuth.from("user_favorites").insert({
        user_id: user?.id,
        studio_slug: studioSlug,
        studio_name: studioName,
      });

      if (!error) {
        loadFavorites();
      }
    } catch (error) {
      console.error("Error adding favorite:", error);
    }
  }

  async function removeFavorite(id: string) {
    setRemovingId(id);
    try {
      const { error } = await supabaseAuth
        .from("user_favorites")
        .delete()
        .eq("id", id);

      if (!error) {
        setFavorites(favorites.filter((f) => f.id !== id));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    } finally {
      setRemovingId(null);
    }
  }

  const isFavorite = (studioSlug: string) => {
    return favorites.some((f) => f.studio_slug === studioSlug);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#fdfbf8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black/40" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf8]">
      {/* Header */}
      <header className="bg-white border-b border-black/10">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="text-xl font-light tracking-[0.2em] text-black">
            EASTDOCK
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-black/60 hover:text-black mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>

          <h1 className="text-3xl font-light text-black mb-8">Favorite Studios</h1>

          {/* Current Favorites */}
          {loadingFavorites ? (
            <div className="bg-white border border-black/10 p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-black/40" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="bg-white border border-black/10 p-12 text-center mb-8">
              <Heart className="w-12 h-12 mx-auto text-black/20 mb-4" />
              <p className="text-black/60 mb-4">You haven't added any favorites yet</p>
              <p className="text-sm text-black/40">
                Add studios to your favorites for quick access
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {favorites.map((favorite) => {
                const studioInfo = STUDIOS.find(
                  (s) => s.slug === favorite.studio_slug
                );
                return (
                  <motion.div
                    key={favorite.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border border-black/10 p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          {favorite.studio_name}
                        </h3>
                        {studioInfo && (
                          <p className="text-sm text-black/60 flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {studioInfo.location}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeFavorite(favorite.id)}
                        disabled={removingId === favorite.id}
                        className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        {removingId === favorite.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Heart className="w-5 h-5 fill-current" />
                        )}
                      </button>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Link
                        href={`/${favorite.studio_slug}`}
                        className="flex-1 py-2 text-center text-sm border border-black/20 hover:bg-black hover:text-white transition-colors"
                      >
                        VIEW STUDIO
                      </Link>
                      <Link
                        href={`/booking?studio=${favorite.studio_slug}`}
                        className="flex-1 py-2 text-center text-sm bg-black text-white hover:bg-black/80 transition-colors flex items-center justify-center gap-1"
                      >
                        <Calendar className="w-4 h-4" />
                        BOOK
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* All Studios */}
          <div>
            <h2 className="text-lg font-medium mb-4">All Studios</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {STUDIOS.map((studio) => {
                const isFav = isFavorite(studio.slug);
                return (
                  <div
                    key={studio.slug}
                    className="bg-white border border-black/10 p-4 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-medium">{studio.name}</h3>
                      <p className="text-sm text-black/60">{studio.location}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (isFav) {
                          const fav = favorites.find(
                            (f) => f.studio_slug === studio.slug
                          );
                          if (fav) removeFavorite(fav.id);
                        } else {
                          addFavorite(studio.slug, studio.name);
                        }
                      }}
                      className={`p-2 rounded transition-colors ${
                        isFav
                          ? "text-red-500 hover:bg-red-50"
                          : "text-black/40 hover:text-red-500 hover:bg-red-50"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${isFav ? "fill-current" : ""}`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

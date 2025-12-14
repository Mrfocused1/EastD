"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseAuth, SavedCard } from "@/lib/supabase-auth";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  Trash2,
  Plus,
  Check,
  AlertCircle,
} from "lucide-react";

export default function CardsPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [settingDefault, setSettingDefault] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadCards();
    }
  }, [user]);

  async function loadCards() {
    try {
      const { data, error } = await supabaseAuth
        .from("user_saved_cards")
        .select("*")
        .eq("user_id", user?.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (data) setCards(data);
    } catch (error) {
      console.error("Error loading cards:", error);
    } finally {
      setLoadingCards(false);
    }
  }

  async function removeCard(id: string) {
    setRemovingId(id);
    try {
      // In a real implementation, you'd also call Stripe to detach the payment method
      const { error } = await supabaseAuth
        .from("user_saved_cards")
        .delete()
        .eq("id", id);

      if (!error) {
        setCards(cards.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error("Error removing card:", error);
    } finally {
      setRemovingId(null);
    }
  }

  async function setDefaultCard(id: string) {
    setSettingDefault(id);
    try {
      // First, unset all defaults
      await supabaseAuth
        .from("user_saved_cards")
        .update({ is_default: false })
        .eq("user_id", user?.id);

      // Then set the new default
      await supabaseAuth
        .from("user_saved_cards")
        .update({ is_default: true })
        .eq("id", id);

      // Reload cards
      loadCards();
    } catch (error) {
      console.error("Error setting default card:", error);
    } finally {
      setSettingDefault(null);
    }
  }

  function getCardIcon(brand: string) {
    const brandLower = brand?.toLowerCase() || "";
    if (brandLower.includes("visa")) return "💳";
    if (brandLower.includes("mastercard")) return "💳";
    if (brandLower.includes("amex")) return "💳";
    return "💳";
  }

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

      <main className="container mx-auto px-6 py-12 max-w-3xl">
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

          <h1 className="text-3xl font-light text-black mb-8">Payment Methods</h1>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Save cards for faster checkout</p>
              <p>
                When you make a booking, you can choose to save your card for future
                purchases. Saved cards are securely stored with Stripe.
              </p>
            </div>
          </div>

          {/* Cards List */}
          {loadingCards ? (
            <div className="bg-white border border-black/10 p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-black/40" />
            </div>
          ) : cards.length === 0 ? (
            <div className="bg-white border border-black/10 p-12 text-center">
              <CreditCard className="w-12 h-12 mx-auto text-black/20 mb-4" />
              <p className="text-black/60 mb-4">No saved payment methods</p>
              <p className="text-sm text-black/40 mb-6">
                Your cards will appear here when you save them during checkout
              </p>
              <Link
                href="/booking"
                className="inline-block px-6 py-2 bg-black text-white text-sm tracking-widest hover:bg-black/80 transition-colors"
              >
                MAKE A BOOKING
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cards.map((card) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-black/10 p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded flex items-center justify-center text-white text-xs font-bold">
                        {card.card_brand?.toUpperCase().slice(0, 4) || "CARD"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            •••• •••• •••• {card.card_last_four}
                          </p>
                          {card.is_default && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-black/60">
                          Expires {card.card_exp_month?.toString().padStart(2, "0")}/
                          {card.card_exp_year?.toString().slice(-2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!card.is_default && (
                        <button
                          onClick={() => setDefaultCard(card.id)}
                          disabled={settingDefault === card.id}
                          className="px-3 py-1 text-sm border border-black/20 hover:bg-black hover:text-white transition-colors flex items-center gap-1"
                        >
                          {settingDefault === card.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              Set Default
                            </>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => removeCard(card.id)}
                        disabled={removingId === card.id}
                        className="p-2 text-black/40 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        {removingId === card.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Security Note */}
          <div className="mt-8 p-4 bg-black/5 rounded text-center">
            <p className="text-sm text-black/60">
              🔒 Your payment information is securely stored by Stripe.
              <br />
              We never have access to your full card details.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

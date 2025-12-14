"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Tag, Users, Clock, Loader2, Edit2, Copy, Check, X, Percent, PoundSterling, Mail, Calendar, BarChart3 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface DiscountCode {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_booking_value: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  exclusive_email: string | null;
  valid_from: string;
  valid_until: string | null;
  applicable_studios: string[] | null;
  is_active: boolean;
  created_at: string;
}

interface DiscountUsage {
  id: string;
  discount_code_id: string;
  customer_email: string;
  customer_name: string;
  booking_date: string;
  studio: string;
  original_amount: number;
  discount_amount: number;
  final_amount: number;
  used_at: string;
}

const STUDIO_OPTIONS = [
  { value: 'studio-dock-one', label: 'Studio Dock One' },
  { value: 'studio-dock-two', label: 'Studio Dock Two' },
  { value: 'studio-wharf', label: 'Studio Wharf' },
  { value: 'photography', label: 'Photography Studio' },
];

export default function DiscountsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [usageHistory, setUsageHistory] = useState<DiscountUsage[]>([]);
  const [activeTab, setActiveTab] = useState<'codes' | 'usage'>('codes');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 10,
    min_booking_value: 0,
    max_discount_amount: '',
    usage_limit: '',
    exclusive_email: '',
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: '',
    applicable_studios: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [discountsRes, usageRes] = await Promise.all([
        supabase.from('discount_codes').select('*').order('created_at', { ascending: false }),
        supabase.from('discount_usage').select('*').order('used_at', { ascending: false }).limit(100),
      ]);

      if (discountsRes.data) setDiscounts(discountsRes.data);
      if (usageRes.data) setUsageHistory(usageRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 10,
      min_booking_value: 0,
      max_discount_amount: '',
      usage_limit: '',
      exclusive_email: '',
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: '',
      applicable_studios: [],
    });
    setEditingDiscount(null);
    setShowForm(false);
  }

  function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'EAST';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  }

  function editDiscount(discount: DiscountCode) {
    setEditingDiscount(discount);
    setFormData({
      code: discount.code,
      description: discount.description || '',
      discount_type: discount.discount_type,
      discount_value: discount.discount_value,
      min_booking_value: discount.min_booking_value || 0,
      max_discount_amount: discount.max_discount_amount?.toString() || '',
      usage_limit: discount.usage_limit?.toString() || '',
      exclusive_email: discount.exclusive_email || '',
      valid_from: discount.valid_from.split('T')[0],
      valid_until: discount.valid_until?.split('T')[0] || '',
      applicable_studios: discount.applicable_studios || [],
    });
    setShowForm(true);
  }

  async function saveDiscount() {
    if (!formData.code || formData.discount_value <= 0) {
      alert('Please fill in the discount code and value');
      return;
    }

    try {
      const data = {
        code: formData.code.toUpperCase().trim(),
        description: formData.description || null,
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        min_booking_value: formData.min_booking_value * 100, // Convert to pence
        max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) * 100 : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        exclusive_email: formData.exclusive_email || null,
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_until: formData.valid_until ? new Date(formData.valid_until + 'T23:59:59').toISOString() : null,
        applicable_studios: formData.applicable_studios.length > 0 ? formData.applicable_studios : null,
        updated_at: new Date().toISOString(),
      };

      if (editingDiscount) {
        const { error } = await supabase
          .from('discount_codes')
          .update(data)
          .eq('id', editingDiscount.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('discount_codes')
          .insert({ ...data, is_active: true });
        if (error) throw error;
      }

      resetForm();
      loadData();
      alert(editingDiscount ? 'Discount updated!' : 'Discount created!');
    } catch (err: any) {
      console.error('Error saving discount:', err);
      if (err.code === '23505') {
        alert('This discount code already exists. Please use a different code.');
      } else {
        alert('Failed to save discount');
      }
    }
  }

  async function toggleDiscount(id: string, isActive: boolean) {
    try {
      await supabase.from('discount_codes').update({ is_active: !isActive, updated_at: new Date().toISOString() }).eq('id', id);
      loadData();
    } catch (err) {
      console.error('Error toggling discount:', err);
    }
  }

  async function deleteDiscount(id: string) {
    if (!confirm('Delete this discount code? This cannot be undone.')) return;
    try {
      await supabase.from('discount_codes').delete().eq('id', id);
      loadData();
    } catch (err) {
      console.error('Error deleting discount:', err);
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  function formatDiscount(discount: DiscountCode): string {
    if (discount.discount_type === 'percentage') {
      return `${discount.discount_value}% off`;
    }
    return `£${discount.discount_value.toFixed(2)} off`;
  }

  function getDiscountStatus(discount: DiscountCode): { label: string; color: string } {
    if (!discount.is_active) {
      return { label: 'Disabled', color: 'bg-gray-100 text-gray-600' };
    }

    const now = new Date();
    const validFrom = new Date(discount.valid_from);
    const validUntil = discount.valid_until ? new Date(discount.valid_until) : null;

    if (now < validFrom) {
      return { label: 'Scheduled', color: 'bg-blue-100 text-blue-700' };
    }
    if (validUntil && now > validUntil) {
      return { label: 'Expired', color: 'bg-red-100 text-red-700' };
    }
    if (discount.usage_limit && discount.usage_count >= discount.usage_limit) {
      return { label: 'Limit Reached', color: 'bg-orange-100 text-orange-700' };
    }
    return { label: 'Active', color: 'bg-green-100 text-green-700' };
  }

  // Calculate stats
  const activeDiscounts = discounts.filter(d => {
    const status = getDiscountStatus(d);
    return status.label === 'Active';
  }).length;
  const totalUsage = discounts.reduce((sum, d) => sum + d.usage_count, 0);
  const totalSaved = usageHistory.reduce((sum, u) => sum + u.discount_amount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black/40" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-black/60 hover:text-black mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div>
          <p className="text-sm tracking-[0.3em] text-black/60 mb-2">PROMOTIONS</p>
          <h1 className="text-4xl font-light text-black">Discount Codes</h1>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-4 gap-6 mb-8"
      >
        <div className="bg-white p-6 border border-black/10">
          <div className="flex items-center gap-3 mb-2">
            <Tag className="w-5 h-5 text-black/40" />
            <span className="text-sm text-black/60">Total Codes</span>
          </div>
          <p className="text-3xl font-light">{discounts.length}</p>
        </div>
        <div className="bg-white p-6 border border-black/10">
          <div className="flex items-center gap-3 mb-2">
            <Check className="w-5 h-5 text-green-500" />
            <span className="text-sm text-black/60">Active</span>
          </div>
          <p className="text-3xl font-light">{activeDiscounts}</p>
        </div>
        <div className="bg-white p-6 border border-black/10">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-black/60">Times Used</span>
          </div>
          <p className="text-3xl font-light">{totalUsage}</p>
        </div>
        <div className="bg-white p-6 border border-black/10">
          <div className="flex items-center gap-3 mb-2">
            <PoundSterling className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-black/60">Total Discounts Given</span>
          </div>
          <p className="text-3xl font-light">£{(totalSaved / 100).toFixed(2)}</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="flex gap-2 mb-6"
      >
        {(['codes', 'usage'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm tracking-widest transition-colors ${
              activeTab === tab
                ? 'bg-black text-white'
                : 'bg-white border border-black/20 hover:border-black'
            }`}
          >
            {tab === 'codes' ? 'DISCOUNT CODES' : 'USAGE HISTORY'}
          </button>
        ))}
      </motion.div>

      {/* Codes Tab */}
      {activeTab === 'codes' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Create Button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-4 border-2 border-dashed border-black/20 hover:border-black transition-colors flex items-center justify-center gap-2 text-black/60 hover:text-black"
            >
              <Plus className="w-5 h-5" />
              Create New Discount Code
            </button>
          )}

          {/* Form */}
          {showForm && (
            <div className="bg-white border border-black/10 p-6">
              <h3 className="text-lg font-medium mb-6">
                {editingDiscount ? 'Edit Discount Code' : 'Create Discount Code'}
              </h3>

              <div className="space-y-6">
                {/* Code and Type */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black/70 mb-2">Discount Code *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        placeholder="e.g., SUMMER20"
                        className="flex-1 px-4 py-3 bg-white border border-black/20 focus:outline-none focus:border-black uppercase"
                      />
                      <button
                        type="button"
                        onClick={generateCode}
                        className="px-4 py-3 border border-black/20 hover:bg-black hover:text-white transition-colors text-sm"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black/70 mb-2">Discount Type *</label>
                    <select
                      value={formData.discount_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_type: e.target.value as 'percentage' | 'fixed' }))}
                      className="w-full px-4 py-3 bg-white border border-black/20 focus:outline-none focus:border-black"
                    >
                      <option value="percentage">Percentage Off</option>
                      <option value="fixed">Fixed Amount Off</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black/70 mb-2">
                      {formData.discount_type === 'percentage' ? 'Percentage (%)' : 'Amount (£)'} *
                    </label>
                    <input
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_value: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      max={formData.discount_type === 'percentage' ? 100 : undefined}
                      className="w-full px-4 py-3 bg-white border border-black/20 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-black/70 mb-2">Description (internal note)</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g., Summer promotion for returning customers"
                    className="w-full px-4 py-3 bg-white border border-black/20 focus:outline-none focus:border-black"
                  />
                </div>

                {/* Limits */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black/70 mb-2">Min Booking Value (£)</label>
                    <input
                      type="number"
                      value={formData.min_booking_value}
                      onChange={(e) => setFormData(prev => ({ ...prev, min_booking_value: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      placeholder="0 for no minimum"
                      className="w-full px-4 py-3 bg-white border border-black/20 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black/70 mb-2">Max Discount (£)</label>
                    <input
                      type="number"
                      value={formData.max_discount_amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_discount_amount: e.target.value }))}
                      min="0"
                      placeholder="Leave blank for no cap"
                      className="w-full px-4 py-3 bg-white border border-black/20 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black/70 mb-2">Usage Limit</label>
                    <input
                      type="number"
                      value={formData.usage_limit}
                      onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: e.target.value }))}
                      min="1"
                      placeholder="Leave blank for unlimited"
                      className="w-full px-4 py-3 bg-white border border-black/20 focus:outline-none focus:border-black"
                    />
                    <p className="text-xs text-black/50 mt-1">Set to 1 for single-use codes</p>
                  </div>
                </div>

                {/* Exclusive Email */}
                <div>
                  <label className="block text-sm font-medium text-black/70 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Exclusive to Email (optional)
                  </label>
                  <input
                    type="email"
                    value={formData.exclusive_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, exclusive_email: e.target.value }))}
                    placeholder="customer@example.com"
                    className="w-full px-4 py-3 bg-white border border-black/20 focus:outline-none focus:border-black"
                  />
                  <p className="text-xs text-black/50 mt-1">If set, only this email address can use the code</p>
                </div>

                {/* Date Range */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black/70 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Valid From *
                    </label>
                    <input
                      type="date"
                      value={formData.valid_from}
                      onChange={(e) => setFormData(prev => ({ ...prev, valid_from: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-black/20 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black/70 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Valid Until (optional)
                    </label>
                    <input
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-black/20 focus:outline-none focus:border-black"
                    />
                    <p className="text-xs text-black/50 mt-1">Leave blank for no expiration</p>
                  </div>
                </div>

                {/* Applicable Studios */}
                <div>
                  <label className="block text-sm font-medium text-black/70 mb-2">Applicable Studios</label>
                  <div className="flex flex-wrap gap-2">
                    {STUDIO_OPTIONS.map(studio => (
                      <label key={studio.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.applicable_studios.includes(studio.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                applicable_studios: [...prev.applicable_studios, studio.value]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                applicable_studios: prev.applicable_studios.filter(s => s !== studio.value)
                              }));
                            }
                          }}
                          className="w-4 h-4 accent-black"
                        />
                        <span className="text-sm">{studio.label}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-black/50 mt-1">Leave all unchecked to apply to all studios</p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={saveDiscount}
                    className="px-6 py-3 bg-black text-white text-sm tracking-widest hover:bg-black/80 transition-colors"
                  >
                    {editingDiscount ? 'UPDATE DISCOUNT' : 'CREATE DISCOUNT'}
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 border border-black/20 text-sm tracking-widest hover:border-black transition-colors"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Discount List */}
          {discounts.length === 0 ? (
            <div className="text-center py-12 bg-white border border-black/10">
              <Tag className="w-12 h-12 mx-auto text-black/20 mb-4" />
              <p className="text-black/60">No discount codes yet. Create your first discount above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {discounts.map(discount => {
                const status = getDiscountStatus(discount);
                return (
                  <div key={discount.id} className="bg-white border border-black/10 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <button
                            onClick={() => copyCode(discount.code)}
                            className="text-xl font-mono font-bold bg-black/5 px-4 py-2 rounded hover:bg-black hover:text-white transition-colors flex items-center gap-2"
                          >
                            {discount.code}
                            {copiedCode === discount.code ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 opacity-50" />
                            )}
                          </button>
                          <span className={`text-xs px-3 py-1 rounded-full ${status.color}`}>
                            {status.label}
                          </span>
                          <span className="text-lg font-medium text-green-600">
                            {formatDiscount(discount)}
                          </span>
                        </div>

                        {discount.description && (
                          <p className="text-sm text-black/60 mb-3">{discount.description}</p>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {discount.usage_limit && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {discount.usage_count}/{discount.usage_limit} used
                            </span>
                          )}
                          {!discount.usage_limit && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {discount.usage_count} used (unlimited)
                            </span>
                          )}
                          {discount.exclusive_email && (
                            <span className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {discount.exclusive_email}
                            </span>
                          )}
                          {discount.valid_until && (
                            <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Expires {new Date(discount.valid_until).toLocaleDateString()}
                            </span>
                          )}
                          {discount.min_booking_value > 0 && (
                            <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full">
                              Min £{(discount.min_booking_value / 100).toFixed(2)}
                            </span>
                          )}
                          {discount.applicable_studios && discount.applicable_studios.length > 0 && (
                            <span className="text-xs bg-black/5 text-black/70 px-3 py-1 rounded-full">
                              {discount.applicable_studios.length} studio{discount.applicable_studios.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleDiscount(discount.id, discount.is_active)}
                          className={`p-2 rounded transition-colors ${
                            discount.is_active
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-400 hover:bg-gray-50'
                          }`}
                          title={discount.is_active ? 'Disable' : 'Enable'}
                        >
                          {discount.is_active ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => editDiscount(discount)}
                          className="p-2 text-black/40 hover:text-black hover:bg-black/5 rounded transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteDiscount(discount.id)}
                          className="p-2 text-black/40 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tips */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-6 rounded-lg">
            <h3 className="font-medium text-green-900 mb-3">Discount Code Ideas</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white/50 p-4 rounded">
                <p className="font-medium text-green-800">First-Time Customer</p>
                <p className="text-green-600">10-15% off for new customers</p>
              </div>
              <div className="bg-white/50 p-4 rounded">
                <p className="font-medium text-green-800">Returning Customer</p>
                <p className="text-green-600">5-10% off for repeat bookings</p>
              </div>
              <div className="bg-white/50 p-4 rounded">
                <p className="font-medium text-green-800">VIP Code</p>
                <p className="text-green-600">Single-use code exclusive to one customer</p>
              </div>
              <div className="bg-white/50 p-4 rounded">
                <p className="font-medium text-green-800">Seasonal Promotion</p>
                <p className="text-green-600">Time-limited code with expiration date</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Usage Tab */}
      {activeTab === 'usage' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="bg-white border border-black/10">
            {usageHistory.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 mx-auto text-black/20 mb-4" />
                <p className="text-black/60">No discount usage yet.</p>
                <p className="text-sm text-black/40">Usage history will appear here when customers use discount codes.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/5">
                    <tr>
                      <th className="text-left text-xs font-medium text-black/60 py-4 px-6 uppercase tracking-wider">Code</th>
                      <th className="text-left text-xs font-medium text-black/60 py-4 px-6 uppercase tracking-wider">Customer</th>
                      <th className="text-left text-xs font-medium text-black/60 py-4 px-6 uppercase tracking-wider">Studio</th>
                      <th className="text-left text-xs font-medium text-black/60 py-4 px-6 uppercase tracking-wider">Original</th>
                      <th className="text-left text-xs font-medium text-black/60 py-4 px-6 uppercase tracking-wider">Discount</th>
                      <th className="text-left text-xs font-medium text-black/60 py-4 px-6 uppercase tracking-wider">Final</th>
                      <th className="text-left text-xs font-medium text-black/60 py-4 px-6 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {usageHistory.map(usage => {
                      const discount = discounts.find(d => d.id === usage.discount_code_id);
                      return (
                        <tr key={usage.id} className="hover:bg-black/[0.02]">
                          <td className="py-4 px-6 font-mono font-medium">{discount?.code || 'Unknown'}</td>
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-medium">{usage.customer_name}</p>
                              <p className="text-xs text-black/60">{usage.customer_email}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm">{usage.studio}</td>
                          <td className="py-4 px-6 text-sm">£{(usage.original_amount / 100).toFixed(2)}</td>
                          <td className="py-4 px-6 text-sm text-green-600">-£{(usage.discount_amount / 100).toFixed(2)}</td>
                          <td className="py-4 px-6 text-sm font-medium">£{(usage.final_amount / 100).toFixed(2)}</td>
                          <td className="py-4 px-6 text-sm text-black/60">
                            {new Date(usage.used_at).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

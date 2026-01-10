"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Activity,
  User,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  Loader2,
  X,
} from "lucide-react";
import { supabase } from "@/@/lib/supabase";

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  membershipType: "essential" | "full_production" | "custom";
  status: "active" | "inactive" | "pending" | "cancelled";
  monthlyFee: number;
  startDate: string;
  nextBillingDate: string;
  paymentMethod: "card" | "bank_transfer" | "cash";
  notes?: string;
  totalPaid: number;
  bookingsCount: number;
  lastPaymentDate?: string;
}

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  membershipType: "essential" | "full_production" | "custom";
  monthlyFee: string;
  startDate: string;
  paymentMethod: "card" | "bank_transfer" | "cash";
  notes: string;
}

const membershipLabels = {
  essential: "Essential",
  full_production: "Full Production",
  custom: "Custom",
};

const statusConfig = {
  active: { label: "Active", color: "bg-green-100 text-green-700", icon: CheckCircle },
  inactive: { label: "Inactive", color: "bg-gray-100 text-gray-700", icon: XCircle },
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700", icon: Clock },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function CRMPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [membershipFilter, setMembershipFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    membershipType: "essential",
    monthlyFee: "",
    startDate: "",
    paymentMethod: "card",
    notes: "",
  });

  // Load clients
  useEffect(() => {
    loadClients();
  }, []);

  // Filter clients
  useEffect(() => {
    let filtered = [...clients];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query) ||
          (client.company && client.company.toLowerCase().includes(query))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((client) => client.status === statusFilter);
    }

    if (membershipFilter !== "all") {
      filtered = filtered.filter((client) => client.membershipType === membershipFilter);
    }

    setFilteredClients(filtered);
  }, [clients, searchQuery, statusFilter, membershipFilter]);

  async function loadClients() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("membership_clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading clients:", error);
        return;
      }

      if (data) {
        setClients(data as Client[]);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddClient(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    try {
      const nextBillingDate = new Date(formData.startDate);
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

      const { error } = await supabase.from("membership_clients").insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        company: formData.company || null,
        membership_type: formData.membershipType,
        status: "active",
        monthly_fee: parseFloat(formData.monthlyFee),
        start_date: formData.startDate,
        next_billing_date: nextBillingDate.toISOString().split("T")[0],
        payment_method: formData.paymentMethod,
        notes: formData.notes || null,
        total_paid: 0,
        bookings_count: 0,
      });

      if (error) {
        console.error("Error adding client:", error);
        return;
      }

      await loadClients();
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdateClient(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClient) return;

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("membership_clients")
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          company: formData.company || null,
          membership_type: formData.membershipType,
          monthly_fee: parseFloat(formData.monthlyFee),
          payment_method: formData.paymentMethod,
          notes: formData.notes || null,
        })
        .eq("id", selectedClient.id);

      if (error) {
        console.error("Error updating client:", error);
        return;
      }

      await loadClients();
      setShowEditModal(false);
      setShowDetailModal(false);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdateStatus(clientId: string, newStatus: Client["status"]) {
    try {
      const { error } = await supabase
        .from("membership_clients")
        .update({ status: newStatus })
        .eq("id", clientId);

      if (error) {
        console.error("Error updating status:", error);
        return;
      }

      await loadClients();
    } catch (err) {
      console.error("Error:", err);
    }
  }

  async function handleDeleteClient(clientId: string) {
    if (!confirm("Are you sure you want to delete this client?")) return;

    try {
      const { error } = await supabase
        .from("membership_clients")
        .delete()
        .eq("id", clientId);

      if (error) {
        console.error("Error deleting client:", error);
        return;
      }

      await loadClients();
      setShowDetailModal(false);
    } catch (err) {
      console.error("Error:", err);
    }
  }

  function openEditModal(client: Client) {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone || "",
      company: client.company || "",
      membershipType: client.membershipType,
      monthlyFee: client.monthlyFee.toString(),
      startDate: client.startDate,
      paymentMethod: client.paymentMethod,
      notes: client.notes || "",
    });
    setShowEditModal(true);
  }

  function resetForm() {
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      membershipType: "essential",
      monthlyFee: "",
      startDate: new Date().toISOString().split("T")[0],
      paymentMethod: "card",
      notes: "",
    });
  }

  // Calculate stats
  const stats = {
    total: clients.length,
    active: clients.filter((c) => c.status === "active").length,
    pending: clients.filter((c) => c.status === "pending").length,
    monthlyRevenue: clients
      .filter((c) => c.status === "active")
      .reduce((sum, c) => sum + c.monthlyFee, 0),
    totalRevenue: clients.reduce((sum, c) => sum + c.totalPaid, 0),
  };

  return (
    <div className="max-w-7xl mx-auto">
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
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm tracking-[0.3em] text-black/60 mb-2">MANAGE</p>
            <h1 className="text-4xl font-light text-black">Membership CRM</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={loadClients}
              className="inline-flex items-center gap-2 px-4 py-3 border border-black/20 text-black text-sm tracking-widest hover:bg-black/5 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              REFRESH
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-sm tracking-widest hover:bg-black/80 transition-colors"
            >
              <Plus className="w-4 h-4" />
              ADD CLIENT
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
      >
        <div className="bg-white p-6 border border-black/10">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-5 h-5 text-black/60" />
            <p className="text-xs tracking-widest text-black/60 uppercase">Total Clients</p>
          </div>
          <p className="text-3xl font-light text-black">{stats.total}</p>
        </div>
        <div className="bg-white p-6 border border-black/10">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-xs tracking-widest text-black/60 uppercase">Active</p>
          </div>
          <p className="text-3xl font-light text-black">{stats.active}</p>
        </div>
        <div className="bg-white p-6 border border-black/10">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <p className="text-xs tracking-widest text-black/60 uppercase">Pending</p>
          </div>
          <p className="text-3xl font-light text-black">{stats.pending}</p>
        </div>
        <div className="bg-white p-6 border border-black/10">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-black/60" />
            <p className="text-xs tracking-widest text-black/60 uppercase">Monthly MRR</p>
          </div>
          <p className="text-3xl font-light text-black">£{stats.monthlyRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 border border-black/10 col-span-2 md:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-black/60" />
            <p className="text-xs tracking-widest text-black/60 uppercase">Total Revenue</p>
          </div>
          <p className="text-3xl font-light text-black">£{stats.totalRevenue.toLocaleString()}</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="bg-white border border-black/10 p-4 mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={membershipFilter}
            onChange={(e) => setMembershipFilter(e.target.value)}
            className="px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors bg-white"
          >
            <option value="all">All Memberships</option>
            <option value="essential">Essential</option>
            <option value="full_production">Full Production</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </motion.div>

      {/* Clients List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-black/40" />
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="bg-white border border-black/10 p-12 text-center">
            <User className="w-12 h-12 text-black/20 mx-auto mb-4" />
            <p className="text-black/60 mb-2">No clients found</p>
            <p className="text-sm text-black/40">
              {clients.length === 0
                ? "Add your first membership client to get started"
                : "Try adjusting your filters or search query"}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-black/10 overflow-hidden">
            <table className="w-full">
              <thead className="bg-black/5 border-b border-black/10">
                <tr>
                  <th className="text-left px-6 py-4 text-xs tracking-widest text-black/60 uppercase font-medium">
                    Client
                  </th>
                  <th className="text-left px-6 py-4 text-xs tracking-widest text-black/60 uppercase font-medium hidden md:table-cell">
                    Membership
                  </th>
                  <th className="text-left px-6 py-4 text-xs tracking-widest text-black/60 uppercase font-medium hidden lg:table-cell">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-xs tracking-widest text-black/60 uppercase font-medium hidden lg:table-cell">
                    Monthly Fee
                  </th>
                  <th className="text-left px-6 py-4 text-xs tracking-widest text-black/60 uppercase font-medium hidden xl:table-cell">
                    Next Billing
                  </th>
                  <th className="text-right px-6 py-4 text-xs tracking-widest text-black/60 uppercase font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client, index) => {
                  const StatusIcon = statusConfig[client.status].icon;
                  return (
                    <tr
                      key={client.id}
                      onClick={() => {
                        setSelectedClient(client);
                        setShowDetailModal(true);
                      }}
                      className="border-b border-black/10 hover:bg-black/5 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-black">{client.name}</p>
                          <p className="text-sm text-black/60">{client.email}</p>
                          {client.company && (
                            <p className="text-xs text-black/40 mt-1">{client.company}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-sm text-black/80">
                          {membershipLabels[client.membershipType]}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig[client.status].color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[client.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-sm text-black">£{client.monthlyFee.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 hidden xl:table-cell">
                        <span className="text-sm text-black/80">
                          {new Date(client.nextBillingDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClient(client);
                            setShowDetailModal(true);
                          }}
                          className="p-2 text-black/40 hover:text-black hover:bg-black/5 rounded transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-black/10 p-6 flex items-center justify-between">
              <h2 className="text-xl font-medium text-black">Add New Client</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-black/60 hover:text-black hover:bg-black/5 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddClient} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black/80 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black/80 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black/80 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black/80 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black/80 mb-2">
                    Membership Type *
                  </label>
                  <select
                    required
                    value={formData.membershipType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        membershipType: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors bg-white"
                  >
                    <option value="essential">Essential</option>
                    <option value="full_production">Full Production</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black/80 mb-2">
                    Monthly Fee (£) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.monthlyFee}
                    onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
                    className="w-full px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black/80 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black/80 mb-2">
                    Payment Method *
                  </label>
                  <select
                    required
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentMethod: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors bg-white"
                  >
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-black/80 mb-2">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors resize-none"
                />
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 border border-black/20 text-black text-sm tracking-widest hover:bg-black/5 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-black text-white text-sm tracking-widest hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      SAVING...
                    </>
                  ) : (
                    "ADD CLIENT"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Client Detail Modal */}
      {showDetailModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-black/10 p-6 flex items-center justify-between">
              <h2 className="text-xl font-medium text-black">{selectedClient.name}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-black/60 hover:text-black hover:bg-black/5 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {/* Contact Info */}
              <div className="mb-8">
                <h3 className="text-sm tracking-widest text-black/60 uppercase mb-4">
                  Contact Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-black/5">
                    <Mail className="w-5 h-5 text-black/40" />
                    <div>
                      <p className="text-xs text-black/40">Email</p>
                      <p className="text-black">{selectedClient.email}</p>
                    </div>
                  </div>
                  {selectedClient.phone && (
                    <div className="flex items-center gap-3 p-4 bg-black/5">
                      <Phone className="w-5 h-5 text-black/40" />
                      <div>
                        <p className="text-xs text-black/40">Phone</p>
                        <p className="text-black">{selectedClient.phone}</p>
                      </div>
                    </div>
                  )}
                  {selectedClient.company && (
                    <div className="flex items-center gap-3 p-4 bg-black/5">
                      <User className="w-5 h-5 text-black/40" />
                      <div>
                        <p className="text-xs text-black/40">Company</p>
                        <p className="text-black">{selectedClient.company}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Membership Details */}
              <div className="mb-8">
                <h3 className="text-sm tracking-widest text-black/60 uppercase mb-4">
                  Membership Details
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 border border-black/10">
                    <p className="text-xs text-black/40 mb-1">Type</p>
                    <p className="text-black">{membershipLabels[selectedClient.membershipType]}</p>
                  </div>
                  <div className="p-4 border border-black/10">
                    <p className="text-xs text-black/40 mb-1">Monthly Fee</p>
                    <p className="text-black">£{selectedClient.monthlyFee.toLocaleString()}</p>
                  </div>
                  <div className="p-4 border border-black/10">
                    <p className="text-xs text-black/40 mb-1">Payment Method</p>
                    <p className="text-black capitalize">{selectedClient.paymentMethod.replace("_", " ")}</p>
                  </div>
                  <div className="p-4 border border-black/10">
                    <p className="text-xs text-black/40 mb-1">Start Date</p>
                    <p className="text-black">
                      {new Date(selectedClient.startDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="p-4 border border-black/10">
                    <p className="text-xs text-black/40 mb-1">Next Billing</p>
                    <p className="text-black">
                      {new Date(selectedClient.nextBillingDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="p-4 border border-black/10">
                    <p className="text-xs text-black/40 mb-1">Total Bookings</p>
                    <p className="text-black">{selectedClient.bookingsCount}</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="mb-8">
                <h3 className="text-sm tracking-widest text-black/60 uppercase mb-4">Status</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusConfig).map(([key, config]) => {
                    const StatusIcon = config.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => handleUpdateStatus(selectedClient.id, key as Client["status"])}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          selectedClient.status === key
                            ? config.color
                            : "bg-black/5 text-black/60 hover:bg-black/10"
                        }`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              {selectedClient.notes && (
                <div className="mb-8">
                  <h3 className="text-sm tracking-widest text-black/60 uppercase mb-4">Notes</h3>
                  <div className="p-4 bg-black/5">
                    <p className="text-black">{selectedClient.notes}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-4 pt-6 border-t border-black/10">
                <button
                  onClick={() => openEditModal(selectedClient)}
                  className="flex items-center gap-2 px-6 py-3 border border-black/20 text-black text-sm tracking-widest hover:bg-black/5 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  EDIT CLIENT
                </button>
                <button
                  onClick={() => handleDeleteClient(selectedClient.id)}
                  className="flex items-center gap-2 px-6 py-3 border border-red-200 text-red-600 text-sm tracking-widest hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  DELETE CLIENT
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-black/10 p-6 flex items-center justify-between">
              <h2 className="text-xl font-medium text-black">Edit Client</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-black/60 hover:text-black hover:bg-black/5 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateClient} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black/80 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black/80 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black/80 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black/80 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black/80 mb-2">
                    Membership Type *
                  </label>
                  <select
                    required
                    value={formData.membershipType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        membershipType: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors bg-white"
                  >
                    <option value="essential">Essential</option>
                    <option value="full_production">Full Production</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black/80 mb-2">
                    Monthly Fee (£) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.monthlyFee}
                    onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
                    className="w-full px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-black/80 mb-2">
                  Payment Method *
                </label>
                <select
                  required
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentMethod: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors bg-white"
                >
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black/80 mb-2">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors resize-none"
                />
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 border border-black/20 text-black text-sm tracking-widest hover:bg-black/5 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-black text-white text-sm tracking-widest hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      SAVING...
                    </>
                  ) : (
                    "SAVE CHANGES"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

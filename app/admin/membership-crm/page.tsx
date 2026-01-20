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
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Loader2,
  X,
  FileText,
  Download,
  Bell,
  BarChart3,
  PieChart,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Globe,
  Link as LinkIcon,
  Receipt,
  Wallet,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

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
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

interface Payment {
  id: string;
  clientId: string;
  amount: number;
  date: string;
  method: string;
  status: "completed" | "pending" | "failed";
  invoiceNumber: string;
}

interface PayAsYouGoTransaction {
  id: string;
  clientName: string;
  clientEmail?: string;
  amount: number;
  date: string;
  service: string;
  paymentMethod: string;
  notes?: string;
  invoiceNumber: string;
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
  socialMedia: {
    instagram: string;
    facebook: string;
    twitter: string;
    linkedin: string;
    website: string;
  };
}

interface PayAsYouGoFormData {
  clientName: string;
  clientEmail: string;
  amount: string;
  date: string;
  service: string;
  paymentMethod: string;
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

type ViewMode = "dashboard" | "list" | "payg";

export default function MembershipCRMPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paygTransactions, setPaygTransactions] = useState<PayAsYouGoTransaction[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [membershipFilter, setMembershipFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaygModal, setShowPaygModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
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
    socialMedia: {
      instagram: "",
      facebook: "",
      twitter: "",
      linkedin: "",
      website: "",
    },
  });

  const [paygFormData, setPaygFormData] = useState<PayAsYouGoFormData>({
    clientName: "",
    clientEmail: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    service: "",
    paymentMethod: "card",
    notes: "",
  });

  // Load data
  useEffect(() => {
    loadData();
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

  async function loadData() {
    setIsLoading(true);
    try {
      const [clientsResult, paymentsResult, paygResult] = await Promise.all([
        supabase.from("membership_clients").select("*").order("created_at", { ascending: false }),
        supabase.from("membership_payments").select("*").order("date", { ascending: false }),
        supabase.from("payg_transactions").select("*").order("date", { ascending: false }),
      ]);

      if (clientsResult.error) {
        console.error("Error loading clients:", clientsResult.error);
      } else if (clientsResult.data) {
        setClients(clientsResult.data as Client[]);
      }

      if (paymentsResult.error) {
        console.error("Error loading payments:", paymentsResult.error);
      } else if (paymentsResult.data) {
        setPayments(paymentsResult.data as Payment[]);
      }

      if (paygResult.error) {
        console.error("Error loading PAYG transactions:", paygResult.error);
      } else if (paygResult.data) {
        setPaygTransactions(paygResult.data as PayAsYouGoTransaction[]);
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
        social_media: formData.socialMedia,
      });

      if (error) {
        console.error("Error adding client:", error);
        return;
      }

      await loadData();
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
          social_media: formData.socialMedia,
        })
        .eq("id", selectedClient.id);

      if (error) {
        console.error("Error updating client:", error);
        return;
      }

      await loadData();
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

      await loadData();
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

      await loadData();
      setShowDetailModal(false);
    } catch (err) {
      console.error("Error:", err);
    }
  }

  async function handleRecordPayment(clientId: string, amount: number, method: string) {
    try {
      const invoiceNumber = `INV-${Date.now()}`;
      
      const { error: paymentError } = await supabase.from("membership_payments").insert({
        client_id: clientId,
        amount: amount,
        date: new Date().toISOString().split("T")[0],
        method: method,
        status: "completed",
        invoice_number: invoiceNumber,
      });

      if (paymentError) {
        console.error("Error recording payment:", paymentError);
        return;
      }

      const client = clients.find((c) => c.id === clientId);
      if (client) {
        const nextBillingDate = new Date(client.nextBillingDate);
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

        const { error: updateError } = await supabase
          .from("membership_clients")
          .update({
            total_paid: client.totalPaid + amount,
            last_payment_date: new Date().toISOString().split("T")[0],
            next_billing_date: nextBillingDate.toISOString().split("T")[0],
          })
          .eq("id", clientId);

        if (updateError) {
          console.error("Error updating client:", updateError);
        }
      }

      await loadData();
      setShowPaymentModal(false);
    } catch (err) {
      console.error("Error:", err);
    }
  }

  async function handleAddPaygTransaction(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    try {
      const invoiceNumber = `PAYG-${Date.now()}`;
      
      const { error } = await supabase.from("payg_transactions").insert({
        client_name: paygFormData.clientName,
        client_email: paygFormData.clientEmail || null,
        amount: parseFloat(paygFormData.amount),
        date: paygFormData.date,
        service: paygFormData.service,
        payment_method: paygFormData.paymentMethod,
        notes: paygFormData.notes || null,
        invoice_number: invoiceNumber,
      });

      if (error) {
        console.error("Error adding PAYG transaction:", error);
        return;
      }

      await loadData();
      setShowPaygModal(false);
      resetPaygForm();
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeletePaygTransaction(id: string) {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      const { error } = await supabase
        .from("payg_transactions")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting transaction:", error);
        return;
      }

      await loadData();
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
      socialMedia: client.socialMedia || {
        instagram: "",
        facebook: "",
        twitter: "",
        linkedin: "",
        website: "",
      },
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
      socialMedia: {
        instagram: "",
        facebook: "",
        twitter: "",
        linkedin: "",
        website: "",
      },
    });
  }

  function resetPaygForm() {
    setPaygFormData({
      clientName: "",
      clientEmail: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      service: "",
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
    overduePayments: clients.filter((c) => {
      const today = new Date();
      const billingDate = new Date(c.nextBillingDate);
      return c.status === "active" && billingDate < today;
    }).length,
  };

  // Pay As You Go stats
  const paygStats = {
    totalTransactions: paygTransactions.length,
    totalRevenue: paygTransactions.reduce((sum, t) => sum + t.amount, 0),
    thisMonth: paygTransactions
      .filter((t) => {
        const date = new Date(t.date);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, t) => sum + t.amount, 0),
  };

  // Get upcoming payments (next 7 days)
  const upcomingPayments = clients
    .filter((c) => c.status === "active")
    .filter((c) => {
      const today = new Date();
      const billingDate = new Date(c.nextBillingDate);
      const diffDays = Math.ceil((billingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    })
    .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());

  // Get client payments
  const getClientPayments = (clientId: string) => {
    return payments.filter((p) => p.clientId === clientId);
  };

  const formatGBP = (amount: number) => {
    return `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
              onClick={loadData}
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

      {/* View Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05 }}
        className="flex items-center gap-4 mb-6"
      >
        <button
          onClick={() => setViewMode("dashboard")}
          className={`flex items-center gap-2 px-4 py-2 text-sm tracking-wider transition-colors ${
            viewMode === "dashboard"
              ? "bg-black text-white"
              : "bg-white border border-black/20 text-black hover:bg-black/5"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          DASHBOARD
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`flex items-center gap-2 px-4 py-2 text-sm tracking-wider transition-colors ${
            viewMode === "list"
              ? "bg-black text-white"
              : "bg-white border border-black/20 text-black hover:bg-black/5"
          }`}
        >
          <User className="w-4 h-4" />
          CLIENT LIST
        </button>
        <button
          onClick={() => setViewMode("payg")}
          className={`flex items-center gap-2 px-4 py-2 text-sm tracking-wider transition-colors ${
            viewMode === "payg"
              ? "bg-black text-white"
              : "bg-white border border-black/20 text-black hover:bg-black/5"
          }`}
        >
          <Wallet className="w-4 h-4" />
          PAY AS YOU GO
        </button>
      </motion.div>

      {/* Dashboard View */}
      {viewMode === "dashboard" && (
        <>
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
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
              <p className="text-3xl font-light text-black">{formatGBP(stats.monthlyRevenue)}</p>
            </div>
            <div className="bg-white p-6 border border-black/10">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-black/60" />
                <p className="text-xs tracking-widest text-black/60 uppercase">Total Revenue</p>
              </div>
              <p className="text-3xl font-light text-black">{formatGBP(stats.totalRevenue)}</p>
            </div>
            <div className="bg-white p-6 border border-black/10">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <p className="text-xs tracking-widest text-black/60 uppercase">Overdue</p>
              </div>
              <p className="text-3xl font-light text-black">{stats.overduePayments}</p>
            </div>
          </motion.div>

          {/* Revenue by Membership Type */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="grid md:grid-cols-2 gap-6 mb-8"
          >
            <div className="bg-white border border-black/10 p-6">
              <h3 className="text-sm tracking-widest text-black/60 uppercase mb-4">Revenue by Membership</h3>
              <div className="space-y-4">
                {(["essential", "full_production", "custom"] as const).map((type) => {
                  const typeClients = clients.filter((c) => c.membershipType === type && c.status === "active");
                  const typeRevenue = typeClients.reduce((sum, c) => sum + c.monthlyFee, 0);
                  const percentage = stats.monthlyRevenue > 0 ? (typeRevenue / stats.monthlyRevenue) * 100 : 0;
                  
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-black">{membershipLabels[type]}</span>
                        <span className="text-sm text-black/60">{formatGBP(typeRevenue)}</span>
                      </div>
                      <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Payments */}
            <div className="bg-white border border-black/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm tracking-widest text-black/60 uppercase">Upcoming Payments (7 Days)</h3>
                <Bell className="w-5 h-5 text-black/40" />
              </div>
              {upcomingPayments.length === 0 ? (
                <p className="text-sm text-black/40 text-center py-8">No upcoming payments</p>
              ) : (
                <div className="space-y-3">
                  {upcomingPayments.map((client) => {
                    const daysUntil = Math.ceil(
                      (new Date(client.nextBillingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <div
                        key={client.id}
                        className="flex items-center justify-between p-3 bg-black/5 hover:bg-black/10 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedClient(client);
                          setShowDetailModal(true);
                        }}
                      >
                        <div>
                          <p className="text-sm font-medium text-black">{client.name}</p>
                          <p className="text-xs text-black/60">{membershipLabels[client.membershipType]}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-black">{formatGBP(client.monthlyFee)}</p>
                          <p className="text-xs text-black/60">
                            {daysUntil === 0 ? "Today" : `In ${daysUntil} day${daysUntil > 1 ? "s" : ""}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white border border-black/10 p-6 mb-8"
          >
            <h3 className="text-sm tracking-widest text-black/60 uppercase mb-4">Recent Payments</h3>
            {payments.length === 0 ? (
              <p className="text-sm text-black/40 text-center py-8">No payments recorded</p>
            ) : (
              <div className="space-y-3">
                {payments.slice(0, 5).map((payment) => {
                  const client = clients.find((c) => c.id === payment.clientId);
                  return (
                    <div key={payment.id} className="flex items-center justify-between p-3 border-b border-black/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-black">{client?.name || "Unknown Client"}</p>
                          <p className="text-xs text-black/60">{payment.invoiceNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-black">{formatGBP(payment.amount)}</p>
                        <p className="text-xs text-black/60">
                          {new Date(payment.date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* List View - Clickable Client Cards */}
      {viewMode === "list" && (
        <>
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
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

          {/* Clients Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map((client) => {
                  const StatusIcon = statusConfig[client.status].icon;
                  const isOverdue = new Date(client.nextBillingDate) < new Date() && client.status === "active";
                  return (
                    <motion.div
                      key={client.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-white border border-black/10 p-6 hover:shadow-lg transition-all cursor-pointer ${isOverdue ? "border-red-200" : ""}`}
                      onClick={() => {
                        setSelectedClient(client);
                        setShowDetailModal(true);
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-black/60" />
                          </div>
                          <div>
                            <h3 className="font-medium text-black">{client.name}</h3>
                            <p className="text-sm text-black/60">{client.email}</p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[client.status].color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[client.status].label}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        {client.company && (
                          <p className="text-sm text-black/80 flex items-center gap-2">
                            <span className="font-medium">Company:</span> {client.company}
                          </p>
                        )}
                        <p className="text-sm text-black/80 flex items-center gap-2">
                          <span className="font-medium">Membership:</span> {membershipLabels[client.membershipType]}
                        </p>
                        <p className="text-sm text-black/80 flex items-center gap-2">
                          <span className="font-medium">Monthly:</span> {formatGBP(client.monthlyFee)}
                        </p>
                      </div>

                      {/* Social Media Links Preview */}
                      {client.socialMedia && (
                        <div className="flex items-center gap-2 pt-4 border-t border-black/10">
                          {client.socialMedia.instagram && <Instagram className="w-4 h-4 text-black/40" />}
                          {client.socialMedia.facebook && <Facebook className="w-4 h-4 text-black/40" />}
                          {client.socialMedia.twitter && <Twitter className="w-4 h-4 text-black/40" />}
                          {client.socialMedia.linkedin && <Linkedin className="w-4 h-4 text-black/40" />}
                          {client.socialMedia.website && <Globe className="w-4 h-4 text-black/40" />}
                          {(!client.socialMedia.instagram && !client.socialMedia.facebook && 
                            !client.socialMedia.twitter && !client.socialMedia.linkedin && 
                            !client.socialMedia.website) && (
                            <span className="text-xs text-black/40">No social links</span>
                          )}
                        </div>
                      )}

                      {isOverdue && (
                        <div className="mt-3 p-2 bg-red-50 text-red-600 text-xs rounded">
                          Payment overdue by {Math.ceil((new Date().getTime() - new Date(client.nextBillingDate).getTime()) / (1000 * 60 * 60 * 24))} days
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* Pay As You Go View */}
      {viewMode === "payg" && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid md:grid-cols-3 gap-4 mb-8"
          >
            <div className="bg-white p-6 border border-black/10">
              <div className="flex items-center gap-3 mb-2">
                <Receipt className="w-5 h-5 text-black/60" />
                <p className="text-xs tracking-widest text-black/60 uppercase">Total Transactions</p>
              </div>
              <p className="text-3xl font-light text-black">{paygStats.totalTransactions}</p>
            </div>
            <div className="bg-white p-6 border border-black/10">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-black/60" />
                <p className="text-xs tracking-widest text-black/60 uppercase">Total Revenue</p>
              </div>
              <p className="text-3xl font-light text-black">{formatGBP(paygStats.totalRevenue)}</p>
            </div>
            <div className="bg-white p-6 border border-black/10">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-black/60" />
                <p className="text-xs tracking-widest text-black/60 uppercase">This Month</p>
              </div>
              <p className="text-3xl font-light text-black">{formatGBP(paygStats.thisMonth)}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-white border border-black/10"
          >
            <div className="p-6 border-b border-black/10 flex items-center justify-between">
              <h2 className="text-xl font-medium text-black">Pay As You Go Transactions</h2>
              <button
                onClick={() => {
                  resetPaygForm();
                  setShowPaygModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm tracking-wider hover:bg-black/80 transition-colors"
              >
                <Plus className="w-4 h-4" />
                ADD TRANSACTION
              </button>
            </div>

            {paygTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <Receipt className="w-12 h-12 text-black/20 mx-auto mb-4" />
                <p className="text-black/60 mb-2">No transactions recorded</p>
                <p className="text-sm text-black/40">Add your first Pay As You Go transaction</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/5">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs tracking-widest text-black/60 uppercase font-medium">
                        Invoice
                      </th>
                      <th className="text-left px-6 py-4 text-xs tracking-widest text-black/60 uppercase font-medium">
                        Client
                      </th>
                      <th className="text-left px-6 py-4 text-xs tracking-widest text-black/60 uppercase font-medium">
                        Service
                      </th>
                      <th className="text-left px-6 py-4 text-xs tracking-widest text-black/60 uppercase font-medium">
                        Date
                      </th>
                      <th className="text-left px-6 py-4 text-xs tracking-widest text-black/60 uppercase font-medium">
                        Method
                      </th>
                      <th className="text-right px-6 py-4 text-xs tracking-widest text-black/60 uppercase font-medium">
                        Amount
                      </th>
                      <th className="text-right px-6 py-4 text-xs tracking-widest text-black/60 uppercase font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paygTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-t border-black/10 hover:bg-black/5">
                        <td className="px-6 py-4 text-sm text-black font-mono">{transaction.invoiceNumber}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-black">{transaction.clientName}</p>
                          {transaction.clientEmail && (
                            <p className="text-xs text-black/60">{transaction.clientEmail}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-black">{transaction.service}</td>
                        <td className="px-6 py-4 text-sm text-black/60">
                          {new Date(transaction.date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm text-black/60 capitalize">
                          {transaction.paymentMethod.replace("_", " ")}
                        </td>
                        <td className="px-6 py-4 text-sm text-black text-right font-medium">
                          {formatGBP(transaction.amount)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeletePaygTransaction(transaction.id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Total Revenue Summary */}
            {paygTransactions.length > 0 && (
              <div className="p-6 bg-black/5 border-t border-black/10">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-black/60">Total Pay As You Go Revenue</p>
                  <p className="text-2xl font-light text-black">{formatGBP(paygStats.totalRevenue)}</p>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto"
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

              {/* Social Media Links */}
              <div>
                <h3 className="text-sm font-medium text-black/80 mb-4 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Social Media Links
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-black/40" />
                    <input
                      type="url"
                      placeholder="Instagram URL"
                      value={formData.socialMedia.instagram}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialMedia: { ...formData.socialMedia, instagram: e.target.value }
                      })}
                      className="flex-1 px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-black/40" />
                    <input
                      type="url"
                      placeholder="Facebook URL"
                      value={formData.socialMedia.facebook}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialMedia: { ...formData.socialMedia, facebook: e.target.value }
                      })}
                      className="flex-1 px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-black/40" />
                    <input
                      type="url"
                      placeholder="Twitter/X URL"
                      value={formData.socialMedia.twitter}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialMedia: { ...formData.socialMedia, twitter: e.target.value }
                      })}
                      className="flex-1 px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-black/40" />
                    <input
                      type="url"
                      placeholder="LinkedIn URL"
                      value={formData.socialMedia.linkedin}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialMedia: { ...formData.socialMedia, linkedin: e.target.value }
                      })}
                      className="flex-1 px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-2 md:col-span-2">
                    <Globe className="w-4 h-4 text-black/40" />
                    <input
                      type="url"
                      placeholder="Website URL"
                      value={formData.socialMedia.website}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialMedia: { ...formData.socialMedia, website: e.target.value }
                      })}
                      className="flex-1 px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
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
            className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto"
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

              {/* Social Media Links */}
              {selectedClient.socialMedia && (
                <div className="mb-8">
                  <h3 className="text-sm tracking-widest text-black/60 uppercase mb-4">
                    Social Media & Links
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedClient.socialMedia.instagram && (
                      <a
                        href={selectedClient.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-black/5 hover:bg-black/10 transition-colors"
                      >
                        <Instagram className="w-5 h-5 text-pink-600" />
                        <div>
                          <p className="text-xs text-black/40">Instagram</p>
                          <p className="text-sm text-black truncate">View Profile</p>
                        </div>
                      </a>
                    )}
                    {selectedClient.socialMedia.facebook && (
                      <a
                        href={selectedClient.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-black/5 hover:bg-black/10 transition-colors"
                      >
                        <Facebook className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-xs text-black/40">Facebook</p>
                          <p className="text-sm text-black truncate">View Profile</p>
                        </div>
                      </a>
                    )}
                    {selectedClient.socialMedia.twitter && (
                      <a
                        href={selectedClient.socialMedia.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-black/5 hover:bg-black/10 transition-colors"
                      >
                        <Twitter className="w-5 h-5 text-black/60" />
                        <div>
                          <p className="text-xs text-black/40">Twitter/X</p>
                          <p className="text-sm text-black truncate">View Profile</p>
                        </div>
                      </a>
                    )}
                    {selectedClient.socialMedia.linkedin && (
                      <a
                        href={selectedClient.socialMedia.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-black/5 hover:bg-black/10 transition-colors"
                      >
                        <Linkedin className="w-5 h-5 text-blue-700" />
                        <div>
                          <p className="text-xs text-black/40">LinkedIn</p>
                          <p className="text-sm text-black truncate">View Profile</p>
                        </div>
                      </a>
                    )}
                    {selectedClient.socialMedia.website && (
                      <a
                        href={selectedClient.socialMedia.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-black/5 hover:bg-black/10 transition-colors"
                      >
                        <Globe className="w-5 h-5 text-black/60" />
                        <div>
                          <p className="text-xs text-black/40">Website</p>
                          <p className="text-sm text-black truncate">Visit Website</p>
                        </div>
                      </a>
                    )}
                    {(!selectedClient.socialMedia.instagram && !selectedClient.socialMedia.facebook &&
                      !selectedClient.socialMedia.twitter && !selectedClient.socialMedia.linkedin &&
                      !selectedClient.socialMedia.website) && (
                      <p className="text-sm text-black/40 col-span-full">No social media links added</p>
                    )}
                  </div>
                </div>
              )}

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
                    <p className="text-black">{formatGBP(selectedClient.monthlyFee)}</p>
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
                    <p className="text-xs text-black/40 mb-1">Total Paid</p>
                    <p className="text-black">{formatGBP(selectedClient.totalPaid)}</p>
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

              {/* Payment History */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm tracking-widest text-black/60 uppercase">Payment History</h3>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm tracking-wider hover:bg-black/80 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    RECORD PAYMENT
                  </button>
                </div>
                {getClientPayments(selectedClient.id).length === 0 ? (
                  <div className="p-8 text-center bg-black/5">
                    <FileText className="w-8 h-8 text-black/20 mx-auto mb-2" />
                    <p className="text-sm text-black/60">No payments recorded</p>
                  </div>
                ) : (
                  <div className="border border-black/10 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-black/5">
                        <tr>
                          <th className="text-left px-4 py-3 text-xs tracking-widest text-black/60 uppercase font-medium">
                            Invoice
                          </th>
                          <th className="text-left px-4 py-3 text-xs tracking-widest text-black/60 uppercase font-medium">
                            Date
                          </th>
                          <th className="text-left px-4 py-3 text-xs tracking-widest text-black/60 uppercase font-medium">
                            Method
                          </th>
                          <th className="text-right px-4 py-3 text-xs tracking-widest text-black/60 uppercase font-medium">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {getClientPayments(selectedClient.id).map((payment) => (
                          <tr key={payment.id} className="border-t border-black/10">
                            <td className="px-4 py-3 text-sm text-black">{payment.invoiceNumber}</td>
                            <td className="px-4 py-3 text-sm text-black/60">
                              {new Date(payment.date).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="px-4 py-3 text-sm text-black/60 capitalize">
                              {payment.method.replace("_", " ")}
                            </td>
                            <td className="px-4 py-3 text-sm text-black text-right">
                              {formatGBP(payment.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
            className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto"
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

              {/* Social Media Links */}
              <div>
                <h3 className="text-sm font-medium text-black/80 mb-4 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Social Media Links
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-black/40" />
                    <input
                      type="url"
                      placeholder="Instagram URL"
                      value={formData.socialMedia.instagram}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialMedia: { ...formData.socialMedia, instagram: e.target.value }
                      })}
                      className="flex-1 px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-black/40" />
                    <input
                      type="url"
                      placeholder="Facebook URL"
                      value={formData.socialMedia.facebook}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialMedia: { ...formData.socialMedia, facebook: e.target.value }
                      })}
                      className="flex-1 px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-black/40" />
                    <input
                      type="url"
                      placeholder="Twitter/X URL"
                      value={formData.socialMedia.twitter}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialMedia: { ...formData.socialMedia, twitter: e.target.value }
                      })}
                      className="flex-1 px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-black/40" />
                    <input
                      type="url"
                      placeholder="LinkedIn URL"
                      value={formData.socialMedia.linkedin}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialMedia: { ...formData.socialMedia, linkedin: e.target.value }
                      })}
                      className="flex-1 px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-2 md:col-span-2">
                    <Globe className="w-4 h-4 text-black/40" />
                    <input
                      type="url"
                      placeholder="Website URL"
                      value={formData.socialMedia.website}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialMedia: { ...formData.socialMedia, website: e.target.value }
                      })}
                      className="flex-1 px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
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

      {/* Record Payment Modal */}
      {showPaymentModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white max-w-md w-full"
          >
            <div className="border-b border-black/10 p-6 flex items-center justify-between">
              <h2 className="text-xl font-medium text-black">Record Payment</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 text-black/60 hover:text-black hover:bg-black/5 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRecordPayment(
                  selectedClient.id,
                  parseFloat(selectedClient.monthlyFee.toString()),
                  selectedClient.paymentMethod
                );
              }}
              className="p-6 space-y-6"
            >
              <div>
                <p className="text-sm text-black/60 mb-2">Client</p>
                <p className="text-lg font-medium text-black">{selectedClient.name}</p>
              </div>
              <div>
                <p className="text-sm text-black/60 mb-2">Amount</p>
                <p className="text-3xl font-light text-black">{formatGBP(selectedClient.monthlyFee)}</p>
              </div>
              <div>
                <p className="text-sm text-black/60 mb-2">Payment Method</p>
                <p className="text-black capitalize">{selectedClient.paymentMethod.replace("_", " ")}</p>
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-6 py-3 border border-black/20 text-black text-sm tracking-widest hover:bg-black/5 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-black text-white text-sm tracking-widest hover:bg-black/80 transition-colors"
                >
                  CONFIRM PAYMENT
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Pay As You Go Transaction Modal */}
      {showPaygModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white max-w-lg w-full"
          >
            <div className="border-b border-black/10 p-6 flex items-center justify-between">
              <h2 className="text-xl font-medium text-black">Add Pay As You Go Transaction</h2>
              <button
                onClick={() => setShowPaygModal(false)}
                className="p-2 text-black/60 hover:text-black hover:bg-black/5 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddPaygTransaction} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-black/80 mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={paygFormData.clientName}
                  onChange={(e) => setPaygFormData({ ...paygFormData, clientName: e.target.value })}
                  className="w-full px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black/80 mb-2">
                  Client Email
                </label>
                <input
                  type="email"
                  value={paygFormData.clientEmail}
                  onChange={(e) => setPaygFormData({ ...paygFormData, clientEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black/80 mb-2">
                    Amount (£) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={paygFormData.amount}
                    onChange={(e) => setPaygFormData({ ...paygFormData, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black/80 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={paygFormData.date}
                    onChange={(e) => setPaygFormData({ ...paygFormData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-black/80 mb-2">
                  Service *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Studio Booking, Photography Session"
                  value={paygFormData.service}
                  onChange={(e) => setPaygFormData({ ...paygFormData, service: e.target.value })}
                  className="w-full px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black/80 mb-2">
                  Payment Method *
                </label>
                <select
                  required
                  value={paygFormData.paymentMethod}
                  onChange={(e) => setPaygFormData({ ...paygFormData, paymentMethod: e.target.value })}
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
                  rows={2}
                  value={paygFormData.notes}
                  onChange={(e) => setPaygFormData({ ...paygFormData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors resize-none"
                />
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setShowPaygModal(false)}
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
                    "ADD TRANSACTION"
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

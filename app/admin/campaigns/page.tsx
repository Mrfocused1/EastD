"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Send, Users, Clock, Loader2, Play, Pause, Mail, Calendar, ChevronDown, ChevronUp, Edit2, Copy } from "lucide-react";
import Link from "next/link";
import Section from "@/components/admin/Section";
import TextInput from "@/components/admin/TextInput";
import { supabase } from "@/lib/supabase";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  template_type: string;
  is_active: boolean;
}

interface EmailCampaign {
  id: string;
  name: string;
  description: string;
  template_id: string;
  trigger_type: string;
  trigger_delay_hours: number;
  target_audience: string;
  is_active: boolean;
}

interface CustomerContact {
  id: string;
  email: string;
  name: string;
  source: string;
  studio: string;
  total_bookings: number;
  last_booking_date: string;
  subscribed: boolean;
}

// Available merge tags for email templates
const MERGE_TAGS = [
  { tag: "{{customer_name}}", description: "Customer's full name" },
  { tag: "{{customer_email}}", description: "Customer's email address" },
  { tag: "{{booking_date}}", description: "Date of booking" },
  { tag: "{{booking_time}}", description: "Time slot booked" },
  { tag: "{{studio_name}}", description: "Name of studio booked" },
  { tag: "{{total_amount}}", description: "Total booking amount" },
  { tag: "{{amount_paid}}", description: "Amount already paid" },
  { tag: "{{remaining_balance}}", description: "Balance due on arrival" },
  { tag: "{{booking_details}}", description: "Full booking breakdown table" },
  { tag: "{{studio_address}}", description: "Studio location address" },
  { tag: "{{studio_directions}}", description: "How to get there info" },
  { tag: "{{discount_code}}", description: "Discount code (for promo emails)" },
  { tag: "{{discount_description}}", description: "Discount description (e.g., 10% off)" },
  { tag: "{{expiry_date}}", description: "Discount code expiry date" },
];

export default function CampaignsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [contacts, setContacts] = useState<CustomerContact[]>([]);
  const [activeTab, setActiveTab] = useState<'templates' | 'campaigns' | 'contacts'>('campaigns');
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  // New template form
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateSubject, setNewTemplateSubject] = useState("");
  const [newTemplateBody, setNewTemplateBody] = useState("");

  // New campaign form
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignDescription, setNewCampaignDescription] = useState("");
  const [newCampaignTemplateId, setNewCampaignTemplateId] = useState("");
  const [newCampaignTrigger, setNewCampaignTrigger] = useState("after_booking");
  const [newCampaignDelayValue, setNewCampaignDelayValue] = useState(1);
  const [newCampaignDelayUnit, setNewCampaignDelayUnit] = useState<'hours' | 'days'>('days');
  const [newCampaignAudience, setNewCampaignAudience] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [templatesRes, campaignsRes, contactsRes] = await Promise.all([
        supabase.from('email_templates').select('*').order('created_at', { ascending: false }),
        supabase.from('email_campaigns').select('*').order('created_at', { ascending: false }),
        supabase.from('customer_contacts').select('*').order('created_at', { ascending: false }).limit(100)
      ]);

      if (templatesRes.data) setTemplates(templatesRes.data);
      if (campaignsRes.data) setCampaigns(campaignsRes.data);
      if (contactsRes.data) setContacts(contactsRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function resetTemplateForm() {
    setNewTemplateName("");
    setNewTemplateSubject("");
    setNewTemplateBody("");
    setEditingTemplate(null);
    setShowTemplateForm(false);
  }

  function editTemplate(template: EmailTemplate) {
    setEditingTemplate(template);
    setNewTemplateName(template.name);
    setNewTemplateSubject(template.subject);
    setNewTemplateBody(template.body_html);
    setShowTemplateForm(true);
  }

  async function saveTemplate() {
    if (!newTemplateName || !newTemplateSubject || !newTemplateBody) {
      alert('Please fill in all template fields');
      return;
    }

    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from('email_templates')
          .update({
            name: newTemplateName,
            subject: newTemplateSubject,
            body_html: newTemplateBody,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingTemplate.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('email_templates')
          .insert({
            name: newTemplateName,
            subject: newTemplateSubject,
            body_html: newTemplateBody,
            template_type: 'custom',
          });
        if (error) throw error;
      }

      resetTemplateForm();
      loadData();
      alert(editingTemplate ? 'Template updated!' : 'Template created!');
    } catch (err) {
      console.error('Error saving template:', err);
      alert('Failed to save template');
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm('Delete this template? Any campaigns using it will stop working.')) return;

    try {
      await supabase.from('email_templates').delete().eq('id', id);
      loadData();
    } catch (err) {
      console.error('Error deleting template:', err);
    }
  }

  function insertMergeTag(tag: string) {
    setNewTemplateBody(prev => prev + tag);
  }

  async function createCampaign() {
    if (!newCampaignName || !newCampaignTemplateId) {
      alert('Please fill in campaign name and select a template');
      return;
    }

    const delayHours = newCampaignDelayUnit === 'days'
      ? newCampaignDelayValue * 24
      : newCampaignDelayValue;

    try {
      const { error } = await supabase
        .from('email_campaigns')
        .insert({
          name: newCampaignName,
          description: newCampaignDescription,
          template_id: newCampaignTemplateId,
          trigger_type: newCampaignTrigger,
          trigger_delay_hours: delayHours,
          target_audience: newCampaignAudience,
          is_active: true,
        });

      if (error) throw error;

      setNewCampaignName("");
      setNewCampaignDescription("");
      setNewCampaignTemplateId("");
      setShowCampaignForm(false);
      loadData();
      alert('Campaign created!');
    } catch (err) {
      console.error('Error creating campaign:', err);
      alert('Failed to create campaign');
    }
  }

  async function toggleCampaign(id: string, isActive: boolean) {
    try {
      await supabase.from('email_campaigns').update({ is_active: !isActive }).eq('id', id);
      loadData();
    } catch (err) {
      console.error('Error toggling campaign:', err);
    }
  }

  async function deleteCampaign(id: string) {
    if (!confirm('Delete this campaign?')) return;
    try {
      await supabase.from('email_campaigns').delete().eq('id', id);
      loadData();
    } catch (err) {
      console.error('Error deleting campaign:', err);
    }
  }

  function formatDelay(hours: number): string {
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''}`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''}`;
  }

  function getTriggerLabel(trigger: string): string {
    const labels: Record<string, string> = {
      'after_booking': 'After Booking',
      'after_deposit': 'After Deposit',
      'after_enquiry': 'After Enquiry',
      'before_booking': 'Before Booking Date',
      'after_discount_used': 'After Discount Used',
      'inactive_customer': 'Inactive Customer',
      'first_booking': 'First-Time Booking',
      'manual': 'Manual Send',
    };
    return labels[trigger] || trigger;
  }

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
          <p className="text-sm tracking-[0.3em] text-black/60 mb-2">MARKETING AUTOMATION</p>
          <h1 className="text-4xl font-light text-black">Email Campaigns</h1>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-3 gap-6 mb-8"
      >
        <div className="bg-white p-6 border border-black/10">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-black/40" />
            <span className="text-sm text-black/60">Customer Contacts</span>
          </div>
          <p className="text-3xl font-light">{contacts.length}</p>
        </div>
        <div className="bg-white p-6 border border-black/10">
          <div className="flex items-center gap-3 mb-2">
            <Send className="w-5 h-5 text-green-500" />
            <span className="text-sm text-black/60">Active Campaigns</span>
          </div>
          <p className="text-3xl font-light">{campaigns.filter(c => c.is_active).length}</p>
        </div>
        <div className="bg-white p-6 border border-black/10">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-5 h-5 text-black/40" />
            <span className="text-sm text-black/60">Email Templates</span>
          </div>
          <p className="text-3xl font-light">{templates.length}</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="flex gap-2 mb-6"
      >
        {(['campaigns', 'templates', 'contacts'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm tracking-widest transition-colors ${
              activeTab === tab
                ? 'bg-black text-white'
                : 'bg-white border border-black/20 hover:border-black'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </motion.div>

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Create Campaign Button */}
          {!showCampaignForm && (
            <button
              onClick={() => setShowCampaignForm(true)}
              className="w-full py-4 border-2 border-dashed border-black/20 hover:border-black transition-colors flex items-center justify-center gap-2 text-black/60 hover:text-black"
            >
              <Plus className="w-5 h-5" />
              Create New Campaign
            </button>
          )}

          {/* Campaign Form */}
          {showCampaignForm && (
            <div className="bg-white border border-black/10 p-6">
              <h3 className="text-lg font-medium mb-6">Create Automated Email Campaign</h3>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <TextInput
                    label="Campaign Name"
                    value={newCampaignName}
                    onChange={setNewCampaignName}
                    placeholder="e.g., Post-Session Follow-up"
                  />
                  <div>
                    <label className="block text-sm font-medium text-black/70 mb-2">Email Template</label>
                    <select
                      value={newCampaignTemplateId}
                      onChange={(e) => setNewCampaignTemplateId(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-black/20 focus:outline-none focus:border-black"
                    >
                      <option value="">Select template...</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <TextInput
                  label="Description (optional)"
                  value={newCampaignDescription}
                  onChange={setNewCampaignDescription}
                  placeholder="What this campaign does..."
                />

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black/70 mb-2">Trigger Event</label>
                    <select
                      value={newCampaignTrigger}
                      onChange={(e) => setNewCampaignTrigger(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-black/20 focus:outline-none focus:border-black"
                    >
                      <option value="after_booking">After Booking Confirmed</option>
                      <option value="after_deposit">After Deposit Paid</option>
                      <option value="before_booking">Before Booking Date (Reminder)</option>
                      <option value="after_enquiry">After Enquiry Submitted</option>
                      <option value="after_discount_used">After Discount Code Used</option>
                      <option value="inactive_customer">Inactive Customer (Re-engagement)</option>
                      <option value="first_booking">First-Time Booking Welcome</option>
                      <option value="manual">Manual Send Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black/70 mb-2">
                      {newCampaignTrigger === 'before_booking' ? 'Send Before' : 'Send After'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={newCampaignDelayValue}
                        onChange={(e) => setNewCampaignDelayValue(parseInt(e.target.value) || 0)}
                        className="w-24 px-4 py-3 bg-white border border-black/20 focus:outline-none focus:border-black"
                        min="0"
                      />
                      <select
                        value={newCampaignDelayUnit}
                        onChange={(e) => setNewCampaignDelayUnit(e.target.value as 'hours' | 'days')}
                        className="flex-1 px-4 py-3 bg-white border border-black/20 focus:outline-none focus:border-black"
                      >
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black/70 mb-2">Target Audience</label>
                    <select
                      value={newCampaignAudience}
                      onChange={(e) => setNewCampaignAudience(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-black/20 focus:outline-none focus:border-black"
                    >
                      <option value="all">All Customers</option>
                      <option value="e16_bookings">Studio Dock One Only</option>
                      <option value="e20_bookings">Studio Dock Two Only</option>
                      <option value="lux_bookings">Studio Wharf Only</option>
                      <option value="deposit_customers">Deposit Payers Only</option>
                      <option value="full_payment">Full Payment Only</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={createCampaign}
                    className="px-6 py-3 bg-black text-white text-sm tracking-widest hover:bg-black/80 transition-colors"
                  >
                    CREATE CAMPAIGN
                  </button>
                  <button
                    onClick={() => setShowCampaignForm(false)}
                    className="px-6 py-3 border border-black/20 text-sm tracking-widest hover:border-black transition-colors"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Campaign List */}
          {campaigns.length === 0 ? (
            <div className="text-center py-12 bg-white border border-black/10">
              <Send className="w-12 h-12 mx-auto text-black/20 mb-4" />
              <p className="text-black/60">No campaigns yet. Create your first automated email campaign above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map(campaign => {
                const template = templates.find(t => t.id === campaign.template_id);
                return (
                  <div key={campaign.id} className="bg-white border border-black/10 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium">{campaign.name}</h3>
                          <span className={`text-xs px-3 py-1 rounded-full ${
                            campaign.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {campaign.is_active ? 'Active' : 'Paused'}
                          </span>
                        </div>
                        {campaign.description && (
                          <p className="text-sm text-black/60 mb-3">{campaign.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {getTriggerLabel(campaign.trigger_type)}
                          </span>
                          <span className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {campaign.trigger_type === 'before_booking' ? 'Before: ' : 'After: '}
                            {formatDelay(campaign.trigger_delay_hours)}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {campaign.target_audience === 'all' ? 'All Customers' : campaign.target_audience.replace('_', ' ')}
                          </span>
                          {template && (
                            <span className="text-xs bg-black/5 text-black/70 px-3 py-1 rounded-full flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {template.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleCampaign(campaign.id, campaign.is_active)}
                          className={`p-2 rounded transition-colors ${
                            campaign.is_active
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-400 hover:bg-gray-50'
                          }`}
                          title={campaign.is_active ? 'Pause' : 'Activate'}
                        >
                          {campaign.is_active ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => deleteCampaign(campaign.id)}
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

          {/* Campaign Ideas */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-6 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-3">Suggested Campaign Ideas</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white/50 p-4 rounded">
                <p className="font-medium text-blue-800">Booking Reminder</p>
                <p className="text-blue-600">Send 1 day before booking with directions and what to bring</p>
              </div>
              <div className="bg-white/50 p-4 rounded">
                <p className="font-medium text-blue-800">Follow-up & Review Request</p>
                <p className="text-blue-600">Send 3 days after session asking for feedback</p>
              </div>
              <div className="bg-white/50 p-4 rounded">
                <p className="font-medium text-blue-800">Return Offer</p>
                <p className="text-blue-600">Send 2 weeks after with a discount code</p>
              </div>
              <div className="bg-white/50 p-4 rounded">
                <p className="font-medium text-blue-800">Deposit Reminder</p>
                <p className="text-blue-600">Remind deposit customers about remaining balance</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Create Template Button */}
          {!showTemplateForm && (
            <button
              onClick={() => setShowTemplateForm(true)}
              className="w-full py-4 border-2 border-dashed border-black/20 hover:border-black transition-colors flex items-center justify-center gap-2 text-black/60 hover:text-black"
            >
              <Plus className="w-5 h-5" />
              Create New Template
            </button>
          )}

          {/* Template Form */}
          {showTemplateForm && (
            <div className="bg-white border border-black/10 p-6">
              <h3 className="text-lg font-medium mb-6">
                {editingTemplate ? 'Edit Template' : 'Create Email Template'}
              </h3>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <TextInput
                    label="Template Name"
                    value={newTemplateName}
                    onChange={setNewTemplateName}
                    placeholder="e.g., Post-Session Follow-up"
                  />
                  <TextInput
                    label="Email Subject"
                    value={newTemplateSubject}
                    onChange={setNewTemplateSubject}
                    placeholder="e.g., Thank you for visiting East Dock Studios!"
                  />
                </div>

                {/* Merge Tags */}
                <div>
                  <label className="block text-sm font-medium text-black/70 mb-2">
                    Insert Booking Details (click to add)
                  </label>
                  <div className="flex flex-wrap gap-2 p-4 bg-black/5 rounded mb-4">
                    {MERGE_TAGS.map(({ tag, description }) => (
                      <button
                        key={tag}
                        onClick={() => insertMergeTag(tag)}
                        className="text-xs bg-white px-3 py-2 rounded border border-black/10 hover:border-black hover:bg-black hover:text-white transition-colors"
                        title={description}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black/70 mb-2">
                    Email Body (HTML supported)
                  </label>
                  <textarea
                    value={newTemplateBody}
                    onChange={(e) => setNewTemplateBody(e.target.value)}
                    placeholder={`<h2>Thank you for your booking!</h2>

<p>Hi {{customer_name}},</p>

<p>We're excited to see you at {{studio_name}} on {{booking_date}} at {{booking_time}}.</p>

<h3>Your Booking Details:</h3>
{{booking_details}}

<p><strong>Total:</strong> {{total_amount}}</p>
<p><strong>Paid:</strong> {{amount_paid}}</p>
<p><strong>Balance Due:</strong> {{remaining_balance}}</p>

<h3>How to Find Us:</h3>
<p>{{studio_address}}</p>
{{studio_directions}}

<p>See you soon!</p>
<p>The East Dock Studios Team</p>`}
                    rows={16}
                    className="w-full px-4 py-3 bg-white border border-black/20 focus:outline-none focus:border-black font-mono text-sm"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={saveTemplate}
                    className="px-6 py-3 bg-black text-white text-sm tracking-widest hover:bg-black/80 transition-colors"
                  >
                    {editingTemplate ? 'UPDATE TEMPLATE' : 'CREATE TEMPLATE'}
                  </button>
                  <button
                    onClick={resetTemplateForm}
                    className="px-6 py-3 border border-black/20 text-sm tracking-widest hover:border-black transition-colors"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Template List */}
          {templates.length === 0 ? (
            <div className="text-center py-12 bg-white border border-black/10">
              <Mail className="w-12 h-12 mx-auto text-black/20 mb-4" />
              <p className="text-black/60">No templates yet. Create your first email template above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map(template => (
                <div key={template.id} className="bg-white border border-black/10">
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => setExpandedTemplate(expandedTemplate === template.id ? null : template.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-medium">{template.name}</h3>
                          <span className="text-xs bg-black/5 px-2 py-1 rounded">{template.template_type}</span>
                        </div>
                        <p className="text-sm text-black/60">Subject: {template.subject}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); editTemplate(template); }}
                          className="p-2 text-black/40 hover:text-black hover:bg-black/5 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteTemplate(template.id); }}
                          className="p-2 text-black/40 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {expandedTemplate === template.id ? (
                          <ChevronUp className="w-5 h-5 text-black/40" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-black/40" />
                        )}
                      </div>
                    </div>
                  </div>
                  {expandedTemplate === template.id && (
                    <div className="px-6 pb-6 border-t border-black/10">
                      <p className="text-xs text-black/40 mt-4 mb-2">PREVIEW:</p>
                      <div
                        className="bg-gray-50 p-4 rounded text-sm prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: template.body_html }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Contacts Tab */}
      {activeTab === 'contacts' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="bg-white border border-black/10">
            {contacts.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-black/20 mb-4" />
                <p className="text-black/60">No contacts yet.</p>
                <p className="text-sm text-black/40">Contacts are automatically added when customers book or enquire.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/5">
                    <tr>
                      <th className="text-left text-xs font-medium text-black/60 py-4 px-6 uppercase tracking-wider">Name</th>
                      <th className="text-left text-xs font-medium text-black/60 py-4 px-6 uppercase tracking-wider">Email</th>
                      <th className="text-left text-xs font-medium text-black/60 py-4 px-6 uppercase tracking-wider">Source</th>
                      <th className="text-left text-xs font-medium text-black/60 py-4 px-6 uppercase tracking-wider">Studio</th>
                      <th className="text-left text-xs font-medium text-black/60 py-4 px-6 uppercase tracking-wider">Bookings</th>
                      <th className="text-left text-xs font-medium text-black/60 py-4 px-6 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {contacts.map(contact => (
                      <tr key={contact.id} className="hover:bg-black/[0.02]">
                        <td className="py-4 px-6 font-medium">{contact.name || '-'}</td>
                        <td className="py-4 px-6 text-sm text-black/70">{contact.email}</td>
                        <td className="py-4 px-6">
                          <span className="text-xs bg-black/5 px-2 py-1 rounded capitalize">{contact.source}</span>
                        </td>
                        <td className="py-4 px-6 text-sm">{contact.studio || '-'}</td>
                        <td className="py-4 px-6 text-sm">{contact.total_bookings}</td>
                        <td className="py-4 px-6">
                          <span className={`text-xs px-2 py-1 rounded ${
                            contact.subscribed
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {contact.subscribed ? 'Subscribed' : 'Unsubscribed'}
                          </span>
                        </td>
                      </tr>
                    ))}
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

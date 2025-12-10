"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Send, Users, Clock, Loader2, Play, Pause } from "lucide-react";
import Link from "next/link";
import Section from "@/components/admin/Section";
import TextInput from "@/components/admin/TextInput";
import SaveButton from "@/components/admin/SaveButton";
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

export default function CampaignsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [contacts, setContacts] = useState<CustomerContact[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // New template form
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateSubject, setNewTemplateSubject] = useState("");
  const [newTemplateBody, setNewTemplateBody] = useState("");

  // New campaign form
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignDescription, setNewCampaignDescription] = useState("");
  const [newCampaignTemplateId, setNewCampaignTemplateId] = useState("");
  const [newCampaignTrigger, setNewCampaignTrigger] = useState("after_booking");
  const [newCampaignDelay, setNewCampaignDelay] = useState(24);
  const [newCampaignAudience, setNewCampaignAudience] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Load templates
      const { data: templatesData } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (templatesData) setTemplates(templatesData);

      // Load campaigns
      const { data: campaignsData } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (campaignsData) setCampaigns(campaignsData);

      // Load contacts
      const { data: contactsData } = await supabase
        .from('customer_contacts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (contactsData) setContacts(contactsData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function createTemplate() {
    if (!newTemplateName || !newTemplateSubject || !newTemplateBody) {
      alert('Please fill in all template fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('email_templates')
        .insert({
          name: newTemplateName,
          subject: newTemplateSubject,
          body_html: newTemplateBody,
          template_type: 'custom',
        });

      if (error) throw error;

      setNewTemplateName("");
      setNewTemplateSubject("");
      setNewTemplateBody("");
      loadData();
      alert('Template created successfully!');
    } catch (err) {
      console.error('Error creating template:', err);
      alert('Failed to create template');
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (err) {
      console.error('Error deleting template:', err);
      alert('Failed to delete template');
    }
  }

  async function createCampaign() {
    if (!newCampaignName || !newCampaignTemplateId) {
      alert('Please fill in campaign name and select a template');
      return;
    }

    try {
      const { error } = await supabase
        .from('email_campaigns')
        .insert({
          name: newCampaignName,
          description: newCampaignDescription,
          template_id: newCampaignTemplateId,
          trigger_type: newCampaignTrigger,
          trigger_delay_hours: newCampaignDelay,
          target_audience: newCampaignAudience,
          is_active: true,
        });

      if (error) throw error;

      setNewCampaignName("");
      setNewCampaignDescription("");
      setNewCampaignTemplateId("");
      loadData();
      alert('Campaign created successfully!');
    } catch (err) {
      console.error('Error creating campaign:', err);
      alert('Failed to create campaign');
    }
  }

  async function toggleCampaign(id: string, isActive: boolean) {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (err) {
      console.error('Error toggling campaign:', err);
    }
  }

  async function deleteCampaign(id: string) {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (err) {
      console.error('Error deleting campaign:', err);
      alert('Failed to delete campaign');
    }
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
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm tracking-[0.3em] text-black/60 mb-2">MARKETING</p>
            <h1 className="text-4xl font-light text-black">Email Campaigns</h1>
          </div>
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
            <span className="text-sm text-black/60">Contacts</span>
          </div>
          <p className="text-3xl font-light">{contacts.length}</p>
        </div>
        <div className="bg-white p-6 border border-black/10">
          <div className="flex items-center gap-3 mb-2">
            <Send className="w-5 h-5 text-black/40" />
            <span className="text-sm text-black/60">Active Campaigns</span>
          </div>
          <p className="text-3xl font-light">{campaigns.filter(c => c.is_active).length}</p>
        </div>
        <div className="bg-white p-6 border border-black/10">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-black/40" />
            <span className="text-sm text-black/60">Templates</span>
          </div>
          <p className="text-3xl font-light">{templates.length}</p>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* Email Templates */}
        <Section title="Email Templates" description="Create reusable email templates for your campaigns">
          {/* Existing Templates */}
          {templates.length > 0 && (
            <div className="mb-6 space-y-3">
              {templates.map(template => (
                <div key={template.id} className="flex items-center justify-between p-4 bg-black/5 rounded">
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-sm text-black/60">{template.subject}</p>
                    <span className="text-xs bg-black/10 px-2 py-1 rounded mt-1 inline-block">{template.template_type}</span>
                  </div>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="p-2 text-black/40 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New Template Form */}
          <div className="border-t border-black/10 pt-6">
            <h4 className="text-sm font-medium mb-4">Create New Template</h4>
            <div className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <TextInput
                  label="Template Name"
                  value={newTemplateName}
                  onChange={setNewTemplateName}
                  placeholder="e.g., Follow-up Email"
                />
                <TextInput
                  label="Email Subject"
                  value={newTemplateSubject}
                  onChange={setNewTemplateSubject}
                  placeholder="e.g., Thank you for visiting!"
                />
              </div>
              <TextInput
                label="Email Body (HTML supported)"
                value={newTemplateBody}
                onChange={setNewTemplateBody}
                placeholder="<p>Your email content here...</p>"
                multiline
                rows={6}
              />
              <button
                onClick={createTemplate}
                className="self-start px-6 py-3 bg-black text-white text-sm tracking-widest hover:bg-black/80 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                CREATE TEMPLATE
              </button>
            </div>
          </div>
        </Section>

        {/* Campaigns */}
        <Section title="Automated Campaigns" description="Set up automated emails triggered by customer actions">
          {/* Existing Campaigns */}
          {campaigns.length > 0 && (
            <div className="mb-6 space-y-3">
              {campaigns.map(campaign => (
                <div key={campaign.id} className="flex items-center justify-between p-4 bg-black/5 rounded">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{campaign.name}</p>
                      <span className={`text-xs px-2 py-1 rounded ${campaign.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {campaign.is_active ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <p className="text-sm text-black/60">{campaign.description}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-black/10 px-2 py-1 rounded">Trigger: {campaign.trigger_type}</span>
                      <span className="text-xs bg-black/10 px-2 py-1 rounded">Delay: {campaign.trigger_delay_hours}h</span>
                      <span className="text-xs bg-black/10 px-2 py-1 rounded">Audience: {campaign.target_audience}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleCampaign(campaign.id, campaign.is_active)}
                      className={`p-2 transition-colors ${campaign.is_active ? 'text-green-600 hover:text-yellow-600' : 'text-gray-400 hover:text-green-600'}`}
                      title={campaign.is_active ? 'Pause campaign' : 'Activate campaign'}
                    >
                      {campaign.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => deleteCampaign(campaign.id)}
                      className="p-2 text-black/40 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* New Campaign Form */}
          <div className="border-t border-black/10 pt-6">
            <h4 className="text-sm font-medium mb-4">Create New Campaign</h4>
            <div className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <TextInput
                  label="Campaign Name"
                  value={newCampaignName}
                  onChange={setNewCampaignName}
                  placeholder="e.g., Post-Booking Follow-up"
                />
                <div>
                  <label className="block text-sm font-medium text-black/70 mb-2">Email Template</label>
                  <select
                    value={newCampaignTemplateId}
                    onChange={(e) => setNewCampaignTemplateId(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-black/20 text-black focus:outline-none focus:border-black"
                  >
                    <option value="">Select a template...</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <TextInput
                label="Description"
                value={newCampaignDescription}
                onChange={setNewCampaignDescription}
                placeholder="What this campaign does..."
              />
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black/70 mb-2">Trigger</label>
                  <select
                    value={newCampaignTrigger}
                    onChange={(e) => setNewCampaignTrigger(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-black/20 text-black focus:outline-none focus:border-black"
                  >
                    <option value="after_booking">After Booking</option>
                    <option value="after_deposit">After Deposit</option>
                    <option value="after_enquiry">After Enquiry</option>
                    <option value="manual">Manual Send</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black/70 mb-2">Delay (hours)</label>
                  <input
                    type="number"
                    value={newCampaignDelay}
                    onChange={(e) => setNewCampaignDelay(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-white border border-black/20 text-black focus:outline-none focus:border-black"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black/70 mb-2">Target Audience</label>
                  <select
                    value={newCampaignAudience}
                    onChange={(e) => setNewCampaignAudience(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-black/20 text-black focus:outline-none focus:border-black"
                  >
                    <option value="all">All Customers</option>
                    <option value="e16_bookings">Studio Dock One Bookings</option>
                    <option value="e20_bookings">Studio Dock Two Bookings</option>
                    <option value="lux_bookings">Studio Wharf Bookings</option>
                    <option value="deposit_customers">Deposit Customers Only</option>
                  </select>
                </div>
              </div>
              <button
                onClick={createCampaign}
                className="self-start px-6 py-3 bg-black text-white text-sm tracking-widest hover:bg-black/80 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                CREATE CAMPAIGN
              </button>
            </div>
          </div>
        </Section>

        {/* Customer Contacts */}
        <Section title="Customer Contacts" description="View customers who have booked or enquired">
          {contacts.length === 0 ? (
            <p className="text-black/60 text-center py-8">No contacts yet. Contacts are automatically added when customers book or enquire.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/10">
                    <th className="text-left text-sm font-medium text-black/60 py-3 px-2">Name</th>
                    <th className="text-left text-sm font-medium text-black/60 py-3 px-2">Email</th>
                    <th className="text-left text-sm font-medium text-black/60 py-3 px-2">Source</th>
                    <th className="text-left text-sm font-medium text-black/60 py-3 px-2">Studio</th>
                    <th className="text-left text-sm font-medium text-black/60 py-3 px-2">Bookings</th>
                    <th className="text-left text-sm font-medium text-black/60 py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map(contact => (
                    <tr key={contact.id} className="border-b border-black/5">
                      <td className="py-3 px-2">{contact.name || '-'}</td>
                      <td className="py-3 px-2 text-sm">{contact.email}</td>
                      <td className="py-3 px-2">
                        <span className="text-xs bg-black/5 px-2 py-1 rounded">{contact.source}</span>
                      </td>
                      <td className="py-3 px-2 text-sm">{contact.studio || '-'}</td>
                      <td className="py-3 px-2 text-sm">{contact.total_bookings}</td>
                      <td className="py-3 px-2">
                        <span className={`text-xs px-2 py-1 rounded ${contact.subscribed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {contact.subscribed ? 'Subscribed' : 'Unsubscribed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="p-6 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <h3 className="font-medium text-blue-900 mb-2">How Automated Campaigns Work</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>After Booking:</strong> Email sent X hours after a customer completes a booking</li>
            <li>• <strong>After Deposit:</strong> Email sent X hours after a deposit payment is received</li>
            <li>• <strong>After Enquiry:</strong> Email sent X hours after a membership/service enquiry</li>
            <li>• <strong>Manual Send:</strong> Manually trigger emails to selected contacts</li>
          </ul>
          <p className="text-sm text-blue-700 mt-3">
            Customer contacts are automatically saved when they make a booking or submit an enquiry.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Code, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/api';

interface TrackingScript {
  id: string;
  name: string;
  type: string;
  provider?: string;
  position: 'head' | 'body';
  script_code: string;
  is_active: boolean;
  load_strategy: 'sync' | 'async' | 'defer';
  pages: string[];
  priority: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export default function TrackingScriptsPage() {
  const [scripts, setScripts] = useState<TrackingScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingScript, setEditingScript] = useState<TrackingScript | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'custom',
    provider: '',
    position: 'head' as 'head' | 'body',
    script_code: '',
    is_active: true,
    load_strategy: 'sync' as 'sync' | 'async' | 'defer',
    pages: ['all'],
    priority: 0,
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl('/tracking-scripts'), {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch tracking scripts');

      const data = await response.json();
      setScripts(data.data || []);
    } catch (error: any) {
      console.error('Failed to fetch tracking scripts:', error);
      toast.error(error.message || 'Failed to load tracking scripts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const response = await fetch(buildApiUrl(`/tracking-scripts/${id}`), {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete tracking script');

      toast.success('Tracking script deleted successfully');
      fetchScripts();
    } catch (error) {
      console.error('Failed to delete tracking script:', error);
      toast.error('Failed to delete tracking script');
    }
  };

  const handleToggleActive = async (script: TrackingScript) => {
    try {
      const response = await fetch(buildApiUrl(`/tracking-scripts/${script.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_active: !script.is_active }),
      });

      if (!response.ok) throw new Error('Failed to update tracking script');

      toast.success(`Tracking script ${!script.is_active ? 'activated' : 'deactivated'}`);
      fetchScripts();
    } catch (error) {
      console.error('Failed to update tracking script:', error);
      toast.error('Failed to update tracking script');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.script_code) {
      toast.error('Name and script code are required');
      return;
    }

    try {
      setSubmitting(true);
      const url = editingScript
        ? buildApiUrl(`/tracking-scripts/${editingScript.id}`)
        : buildApiUrl('/tracking-scripts');

      const method = editingScript ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          provider: formData.provider || null,
          description: formData.description || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save tracking script');
      }

      toast.success(editingScript ? 'Tracking script updated successfully' : 'Tracking script created successfully');
      setShowModal(false);
      setEditingScript(null);
      setFormData({
        name: '',
        type: 'custom',
        provider: '',
        position: 'head',
        script_code: '',
        is_active: true,
        load_strategy: 'sync',
        pages: ['all'],
        priority: 0,
        description: '',
      });
      fetchScripts();
    } catch (error: any) {
      console.error('Failed to save tracking script:', error);
      toast.error(error.message || 'Failed to save tracking script');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (script: TrackingScript) => {
    setEditingScript(script);
    setFormData({
      name: script.name,
      type: script.type,
      provider: script.provider || '',
      position: script.position,
      script_code: script.script_code,
      is_active: script.is_active,
      load_strategy: script.load_strategy,
      pages: script.pages,
      priority: script.priority,
      description: script.description || '',
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Tracking Scripts</h1>
          <p className="text-muted-foreground">Quản lý các tracking scripts (Google Analytics, Facebook Pixel, etc.)</p>
        </div>
        <button
          onClick={() => {
            setEditingScript(null);
            setFormData({
              name: '',
              type: 'custom',
              provider: '',
              position: 'head',
              script_code: '',
              is_active: true,
              load_strategy: 'sync',
              pages: ['all'],
              priority: 0,
              description: '',
            });
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Thêm Script
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading tracking scripts...</p>
        </div>
      ) : scripts.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-card-foreground mb-2">No tracking scripts yet</h3>
          <p className="text-sm text-muted-foreground mb-6">Create your first tracking script to start tracking visitors.</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Tracking Script
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scripts.map((script) => (
            <div
              key={script.id}
              className="rounded-lg border border-border bg-card p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-foreground">{script.name}</h3>
                    {script.is_active ? (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {script.type} • {script.position} • Priority: {script.priority}
                  </p>
                  {script.description && (
                    <p className="text-xs text-muted-foreground mt-2">{script.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(script)}
                    className="p-1 hover:bg-accent rounded transition-colors"
                    title={script.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {script.is_active ? (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(script)}
                    className="p-1 hover:bg-accent rounded transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(script.id, script.name)}
                    className="p-1 hover:bg-accent rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Pages: {script.pages.join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              setEditingScript(null);
            }
          }}
        >
          <div className="bg-card rounded-lg p-6 max-w-3xl w-full my-8 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-foreground mb-6">
              {editingScript ? 'Edit Tracking Script' : 'Add Tracking Script'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-foreground mb-2">
                    Type
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="analytics">Analytics</option>
                    <option value="pixel">Pixel</option>
                    <option value="custom">Custom</option>
                    <option value="tag-manager">Tag Manager</option>
                    <option value="heatmap">Heatmap</option>
                    <option value="live-chat">Live Chat</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="script_code" className="block text-sm font-medium text-foreground mb-2">
                  Script Code <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="script_code"
                  value={formData.script_code}
                  onChange={(e) => setFormData({ ...formData, script_code: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  rows={8}
                  required
                  placeholder="<script>...</script>"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-foreground mb-2">
                    Position
                  </label>
                  <select
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value as 'head' | 'body' })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="head">Head</option>
                    <option value="body">Body</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="load_strategy" className="block text-sm font-medium text-foreground mb-2">
                    Load Strategy
                  </label>
                  <select
                    id="load_strategy"
                    value={formData.load_strategy}
                    onChange={(e) => setFormData({ ...formData, load_strategy: e.target.value as 'sync' | 'async' | 'defer' })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="sync">Sync</option>
                    <option value="async">Async</option>
                    <option value="defer">Defer</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-2">
                    Priority
                  </label>
                  <input
                    type="number"
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-primary/50"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-foreground">
                  Active
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingScript(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-input bg-background hover:bg-accent transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingScript ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

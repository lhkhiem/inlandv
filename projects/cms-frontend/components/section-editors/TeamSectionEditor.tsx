'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import MediaPicker from '@/components/MediaPicker';
import { getAssetUrl } from '@/lib/api';

export interface TeamMember {
  id?: string;
  name: string;
  position: string;
  description: string;
  image_url?: string;
  image_id?: string; // Store image ID directly from MediaPicker
}

export interface TeamSectionData {
  members: TeamMember[];
}

interface TeamSectionEditorProps {
  data: TeamSectionData;
  onChange: (data: TeamSectionData) => void;
}

export default function TeamSectionEditor({ data, onChange }: TeamSectionEditorProps) {
  const [memberImageIds, setMemberImageIds] = useState<Record<number, string>>({});

  // Initialize image IDs from data when component loads or data changes
  useEffect(() => {
    const imageIds: Record<number, string> = {};
    data.members.forEach((member, index) => {
      if (member.image_id) {
        imageIds[index] = member.image_id;
      } else if (member.image_url) {
        // Extract ID from URL if image_id is not available
        const match = member.image_url.match(/\/uploads\/([^\/\?]+)/) || 
                      member.image_url.match(/\/assets\/([^\/\?]+)/) ||
                      member.image_url.match(/\/([^\/\?]+)$/);
        if (match && match[1]) {
          imageIds[index] = match[1];
        } else if (!member.image_url.includes('/') && !member.image_url.includes('http')) {
          // If it's already an ID
          imageIds[index] = member.image_url;
        } else if (member.image_url.startsWith('http://') || member.image_url.startsWith('https://')) {
          const parts = member.image_url.split('/');
          const lastPart = parts[parts.length - 1];
          if (lastPart && !lastPart.includes('.')) {
            imageIds[index] = lastPart;
          }
        }
      }
    });
    setMemberImageIds(imageIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.members.length, JSON.stringify(data.members.map(m => ({ image_id: m.image_id, image_url: m.image_url })))]); // Re-run when members count or image data changes

  const addMember = () => {
    onChange({
      ...data,
      members: [
        ...data.members,
        {
          name: '',
          position: '',
          description: '',
          image_url: '',
          image_id: '',
        },
      ],
    });
  };

  const removeMember = (index: number) => {
    const newMembers = data.members.filter((_, i) => i !== index);
    onChange({ ...data, members: newMembers });
    
    // Clean up image IDs
    const newImageIds: Record<number, string> = {};
    Object.keys(memberImageIds).forEach((key) => {
      const idx = parseInt(key);
      if (idx < index) {
        newImageIds[idx] = memberImageIds[idx];
      } else if (idx > index) {
        newImageIds[idx - 1] = memberImageIds[idx];
      }
    });
    setMemberImageIds(newImageIds);
  };

  const updateMember = (index: number, field: keyof TeamMember, value: string) => {
    const newMembers = [...data.members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    onChange({ ...data, members: newMembers });
  };

  const handleImageChange = (index: number, value: string | string[]) => {
    const ids = Array.isArray(value) ? value : [value];
    const imageId = ids[0] || '';
    setMemberImageIds(prev => ({ ...prev, [index]: imageId }));
    
    const newMembers = [...data.members];
    newMembers[index] = {
      ...newMembers[index],
      image_url: imageId ? getAssetUrl(imageId) : '',
      image_id: imageId, // Store ID directly for saving to JSON
    };
    onChange({ ...data, members: newMembers });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-foreground">
          Thành viên đội ngũ
        </label>
        <button
          type="button"
          onClick={addMember}
          className="inline-flex items-center gap-2 rounded-lg border border-input bg-background text-foreground px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        >
          <Plus className="h-4 w-4" />
          Thêm thành viên
        </button>
      </div>

      {data.members.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Chưa có thành viên nào. Click "Thêm thành viên" để bắt đầu.
        </p>
      ) : (
        <div className="space-y-4">
          {data.members.map((member, index) => (
            <div key={index} className="p-4 border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">
                  Thành viên {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeMember(index)}
                  className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Hình ảnh
                </label>
                <MediaPicker
                  value={memberImageIds[index] ? [memberImageIds[index]] : []}
                  onChange={(value) => handleImageChange(index, value)}
                  multiple={false}
                  previewSize={80}
                />
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Tên <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => updateMember(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Ms Lisa Nghia"
                />
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Chức vụ <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={member.position}
                  onChange={(e) => updateMember(index, 'position', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="CEO & Founder"
                />
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Giới thiệu
                </label>
                <textarea
                  value={member.description}
                  onChange={(e) => updateMember(index, 'description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Giới thiệu:...."
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper functions
export function parseTeamHTML(html: string): TeamSectionData {
  // Check if content is JSON format (for about page)
  if (html.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(html);
      const members = (parsed.members || []).map((m: any) => {
        // Extract image ID from image field (can be URL or ID)
        let imageId = '';
        let imageUrl = '';
        const imageValue = m.image || '';
        
        if (imageValue) {
          if (imageValue.startsWith('/')) {
            // Relative path like "/5" or "/uploads/5/filename"
            const pathParts = imageValue.split('/').filter(Boolean);
            if (pathParts.length > 0) {
              if (pathParts[0] === 'uploads' || pathParts[0] === 'assets') {
                imageId = pathParts[1] || '';
              } else {
                imageId = pathParts[0] || '';
              }
            }
          } else if (imageValue.startsWith('http://') || imageValue.startsWith('https://')) {
            // Full URL
            try {
              const url = new URL(imageValue);
              const pathParts = url.pathname.split('/').filter(Boolean);
              if (pathParts.length > 0) {
                if (pathParts[0] === 'uploads' || pathParts[0] === 'assets') {
                  imageId = pathParts[1] || '';
                } else {
                  imageId = pathParts[pathParts.length - 1] || '';
                }
              }
            } catch (e) {
              // Invalid URL, treat as ID
              imageId = imageValue;
            }
          } else {
            // Just an ID
            imageId = imageValue;
          }
          
          if (imageId) {
            imageUrl = getAssetUrl(imageId);
          }
        }
        
        return {
          id: m.id?.toString() || '',
          name: m.name || '',
          position: m.position || '',
          description: m.description || '',
          image_url: imageUrl,
          image_id: imageId,
        };
      });
      return { members };
    } catch (e) {
      // If JSON parse fails, fall through to HTML parsing
      console.warn('Failed to parse as JSON, trying HTML:', e);
    }
  }
  
  const members: TeamMember[] = [];
  
  if (typeof window === 'undefined') {
    // Server-side parsing with regex
    const memberMatches = html.matchAll(/<div[^>]*class=["'][^"']*team-member[^"']*["'][^>]*>([\s\S]*?)<\/div>/g);
    for (const match of memberMatches) {
      const memberHTML = match[1];
      const nameMatch = memberHTML.match(/<h3[^>]*>([^<]+)<\/h3>/);
      const positionMatch = memberHTML.match(/<p[^>]*class=["'][^"']*position[^"']*["'][^>]*>([^<]+)<\/p>/);
      const descMatch = memberHTML.match(/<p[^>]*class=["'][^"']*description[^"']*["'][^>]*>([^<]+)<\/p>/);
      const imgMatch = memberHTML.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/);
      
      members.push({
        name: nameMatch ? nameMatch[1].trim() : '',
        position: positionMatch ? positionMatch[1].trim() : '',
        description: descMatch ? descMatch[1].trim() : '',
        image_url: imgMatch ? imgMatch[1] : '',
      });
    }
  } else {
    // Client-side parsing
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const memberElements = doc.querySelectorAll('.team-member, [class*="team-member"]');
    memberElements.forEach((el) => {
      const name = el.querySelector('h3, .member-name')?.textContent?.trim() || '';
      const position = el.querySelector('.member-position, .position')?.textContent?.trim() || '';
      const description = el.querySelector('.member-bio, .description')?.textContent?.trim() || '';
      const img = el.querySelector('img');
      const imageUrl = img?.getAttribute('src') || '';
      
      if (name || position) {
        members.push({ name, position, description, image_url: imageUrl });
      }
    });
  }
  
  return {
    members: members.length > 0 ? members : [
      { name: '', position: '', description: '', image_url: '' },
    ],
  };
}

// Generate JSON format for team section (for about page)
export function generateTeamJSON(data: TeamSectionData): string {
  const members = (data.members || []).map(member => {
    // Use image_id if available, otherwise extract from image_url
    let imageValue = '';
    if (member.image_id) {
      imageValue = `/${member.image_id}`;
    } else if (member.image_url) {
      // Extract ID from URL
      const match = member.image_url.match(/\/uploads\/([^\/\?]+)/) || 
                    member.image_url.match(/\/assets\/([^\/\?]+)/) ||
                    member.image_url.match(/\/([^\/\?]+)$/);
      if (match && match[1]) {
        imageValue = `/${match[1]}`;
      } else if (!member.image_url.includes('/') && !member.image_url.includes('http')) {
        imageValue = `/${member.image_url}`;
      } else {
        // Fallback to full URL if can't extract ID
        imageValue = member.image_url;
      }
    }
    
    return {
      id: member.id || 0,
      name: member.name || '',
      position: member.position || '',
      description: member.description || '',
      image: imageValue,
    };
  });
  
  return JSON.stringify({ members });
}

export function generateTeamHTML(data: TeamSectionData): string {
  const membersHTML = data.members
    .filter(m => m.name || m.position)
    .map(
      (member) => `
        <div class="team-member">
          <div class="member-image">
            ${member.image_url ? `<img src="${member.image_url}" alt="${member.name}" />` : '<div class="placeholder"></div>'}
          </div>
          <h3 class="member-name">${member.name || ''}</h3>
          <p class="member-position">${member.position || ''}</p>
          <p class="member-bio">${member.description || 'Giới thiệu:....'}</p>
        </div>
      `
    )
    .join('');

  return `<div id="doi-ngu" class="team-section">
    <h2 class="section-title">Đội ngũ lãnh đạo</h2>
    <div class="team-carousel">
      ${membersHTML}
    </div>
  </div>`;
}



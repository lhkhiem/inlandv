'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Plus, Edit2, GripVertical, X } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import TinyMCEEditor from '@/components/TinyMCEEditor';
import MediaPicker from '@/components/MediaPicker';
import HeroSectionEditor, { parseHeroHTML, generateHeroHTML, generateHeroJSON, HeroSectionData } from '@/components/section-editors/HeroSectionEditor';
import StorySectionEditor, { parseStoryHTML, generateStoryHTML, generateStoryJSON, StorySectionData } from '@/components/section-editors/StorySectionEditor';
import TeamSectionEditor, { parseTeamHTML, generateTeamHTML, generateTeamJSON, TeamSectionData } from '@/components/section-editors/TeamSectionEditor';
import WhyChooseSectionEditor, { parseWhyChooseHTML, generateWhyChooseHTML, generateWhyChooseJSON, WhyChooseSectionData } from '@/components/section-editors/WhyChooseSectionEditor';
import ClientsSectionEditor, { parseClientsHTML, generateClientsHTML, generateClientsJSON, ClientsSectionData } from '@/components/section-editors/ClientsSectionEditor';
import ServicesHeroEditor, { parseServicesHeroHTML, generateServicesHeroHTML, ServicesHeroData } from '@/components/section-editors/ServicesHeroEditor';
import BrokerageSectionEditor, { parseBrokerageHTML, generateBrokerageHTML, BrokerageSectionData } from '@/components/section-editors/BrokerageSectionEditor';
import LegalInvestmentSectionEditor, { parseLegalInvestmentHTML, generateLegalInvestmentHTML, LegalInvestmentSectionData } from '@/components/section-editors/LegalInvestmentSectionEditor';
import FDISupportSectionEditor, { parseFDISupportHTML, generateFDISupportHTML, FDISupportSectionData } from '@/components/section-editors/FDISupportSectionEditor';
import DesignConstructionSectionEditor, { parseDesignConstructionHTML, generateDesignConstructionHTML, DesignConstructionSectionData } from '@/components/section-editors/DesignConstructionSectionEditor';
import { useAuthStore } from '@/store/authStore';
import { buildApiUrl, getAssetUrl } from '@/lib/api';
import { generateSlug } from '@/lib/slug';
import { toast } from 'sonner';

interface PageFormData {
  title: string;
  slug: string;
  page_type: string;
  published: boolean;
  meta_title: string;
  meta_description: string;
}

interface PageSection {
  id?: string;
  section_key: string;
  name: string;
  section_type: string;
  display_order: number;
  content: string;
  images: string[];
  published: boolean;
}

const sectionTypes = [
  { value: 'hero', label: 'Hero' },
  { value: 'content', label: 'Nội dung' },
  { value: 'team', label: 'Đội ngũ' },
  { value: 'clients', label: 'Khách hàng' },
  { value: 'service', label: 'Dịch vụ' },
  { value: 'form', label: 'Form' },
  { value: 'info', label: 'Thông tin' },
];

export default function PageFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const isNew = !id || id === 'new';
  const { user, hydrate } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [sectionImageIds, setSectionImageIds] = useState<Record<string, string[]>>({});
  const [heroSectionData, setHeroSectionData] = useState<HeroSectionData>({
    logo_url: '',
    logo_alt: '',
    description: '',
    stats: [
      { number: '', label: '' },
      { number: '', label: '' },
      { number: '', label: '' },
      { number: '', label: '' },
    ],
  });
  const [storySectionData, setStorySectionData] = useState<StorySectionData>({
    paragraphs: ['', '', ''],
    vision: { title: 'Tầm nhìn:', content: '' },
    mission: { title: 'Sứ mệnh:', content: '' },
    coreValues: { title: 'Giá trị cốt lõi:', content: '' },
  });
  const [teamSectionData, setTeamSectionData] = useState<TeamSectionData>({
    members: [],
  });
  const [whyChooseSectionData, setWhyChooseSectionData] = useState<WhyChooseSectionData>({
    badge: 'UY TÍN & CHẤT LƯỢNG',
    title: 'Tại sao nên chọn Inlandv',
    subtitle: '',
    features: [],
  });
  const [clientsSectionData, setClientsSectionData] = useState<ClientsSectionData>({
    badge: 'KHÁCH HÀNG & ĐỐI TÁC',
    title: 'Khách hàng Tiêu biểu',
    subtitle: '',
    stats: [
      { icon: 'building', number: '', label: '' },
      { icon: 'users', number: '', label: '' },
      { icon: 'award', number: '', label: '' },
      { icon: 'star', number: '', label: '' },
    ],
    categories: [],
    footer_note: '',
  });
  const [servicesHeroData, setServicesHeroData] = useState<ServicesHeroData>({
    badge: 'Giải pháp toàn diện',
    title: 'Giải Pháp Bất Động Sản Công Nghiệp',
    title_highlight: 'Toàn Diện Cho Doanh Nghiệp FDI.',
    subtitle: '',
    button_text: 'Tải Brochure',
    button_link: '/brochures/dich-vu.pdf',
  });
  const [brokerageSectionData, setBrokerageSectionData] = useState<BrokerageSectionData>({
    badge: 'Môi giới BĐS Công nghiệp',
    title: 'Thuê / Mua',
    title_highlight: 'Hiệu Quả',
    subtitle: '',
    advantages: [],
    process: [],
    diverse_areas: [],
    categories: [],
  });
  const [legalInvestmentSectionData, setLegalInvestmentSectionData] = useState<LegalInvestmentSectionData>({
    badge: 'Tư vấn Pháp lý & Đầu tư',
    title: 'An Toàn',
    title_highlight: 'Pháp Lý',
    subtitle: '',
    services: [],
    benefits: [],
    summary_title: 'Kết quả mang lại',
    summary_description: '',
    stats: [
      { value: '', label: '' },
      { value: '', label: '' },
      { value: '', label: '' },
    ],
  });
  const [fdiSupportSectionData, setFDISupportSectionData] = useState<FDISupportSectionData>({
    badge: 'Hỗ trợ FDI',
    title: 'Vận Hành Ổn Định Ngay Từ Ngày Đầu',
    title_highlight: '',
    subtitle: '',
    pillars: [],
    services: [],
    outcomes: [
      { value: '', label: '' },
      { value: '', label: '' },
      { value: '', label: '' },
      { value: '', label: '' },
    ],
    summary_title: 'Tại sao quan trọng',
    summary_description: '',
    stats: [
      { value: '', label: '' },
      { value: '', label: '' },
      { value: '', label: '' },
    ],
  });
  const [designConstructionSectionData, setDesignConstructionSectionData] = useState<DesignConstructionSectionData>({
    badge: 'Thiết kế & Thi công',
    title: 'Triển Khai',
    title_highlight: 'Chuẩn Hoá',
    subtitle: '',
    phases: [],
    advantages: [],
    quality_title: 'Kiểm soát chất lượng',
    quality_description: '',
    quality_stats: [
      { value: '', label: '' },
      { value: '', label: '' },
      { value: '', label: '' },
      { value: '', label: '' },
    ],
    interlink_title: 'Kết nối INTERLINK',
    interlink_description: '',
    interlink_items: [],
  });

  const [formData, setFormData] = useState<PageFormData>({
    title: '',
    slug: '',
    page_type: 'static',
    published: true,
    meta_title: '',
    meta_description: '',
  });

  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      if (!user) {
        await hydrate();
        if (!isMounted) return;
        if (!useAuthStore.getState().user) {
          window.location.href = '/login';
          return;
        }
      }
      
      if (isMounted) {
        setIsInitialized(true);
      }
    };
    
    init();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isInitialized || isNew || !id) return;

    const fetchPage = async () => {
      try {
        setLoading(true);
        const [pageResponse, sectionsResponse] = await Promise.all([
          axios.get(buildApiUrl(`/pages/${id}`), { withCredentials: true }),
          axios.get(buildApiUrl(`/page-sections/${id}`), { withCredentials: true }),
        ]);
        
        const pageData = pageResponse.data;
        setFormData({
          title: pageData.title || '',
          slug: pageData.slug || '',
          page_type: pageData.page_type || 'static',
          published: pageData.published !== false,
          meta_title: pageData.meta_title || '',
          meta_description: pageData.meta_description || '',
        });

        const sectionsData = sectionsResponse.data?.data || [];
        setSections(sectionsData);
        
        // Load image IDs for sections
        const imageIdsMap: Record<string, string[]> = {};
        for (const section of sectionsData) {
          if (section.images && section.images.length > 0) {
            // Extract asset IDs from URLs - try multiple patterns
            const ids = section.images.map((url: string) => {
              // Try /uploads/pattern
              let match = url.match(/\/uploads\/([^\/\?]+)/);
              if (match) return match[1];
              // Try /assets/pattern
              match = url.match(/\/assets\/([^\/\?]+)/);
              if (match) return match[1];
              // If URL is already an ID, use it
              if (!url.includes('/') && !url.includes('http')) return url;
              return '';
            }).filter(Boolean);
            if (ids.length > 0) {
              imageIdsMap[section.id || section.section_key] = ids;
            }
          }
        }
        setSectionImageIds(imageIdsMap);
      } catch (error: any) {
        console.error('Failed to fetch page:', error);
        toast.error('Không thể tải thông tin trang');
        router.push('/dashboard/pages');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [id, isNew, isInitialized, router]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && formData.title && isNew) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(prev.title),
      }));
    }
  }, [formData.title, slugManuallyEdited, isNew]);

  const updateField = (field: keyof PageFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const [sectionFormData, setSectionFormData] = useState<PageSection>({
    section_key: '',
    name: '',
    section_type: 'content',
    display_order: 0,
    content: '',
    images: [],
    published: true,
  });

  const handleOpenAddSection = () => {
    setSectionFormData({
      section_key: '',
      name: '',
      section_type: 'content',
      display_order: sections.length,
      content: '',
      images: [],
      published: true,
    });
    // Reset all section data
    setHeroSectionData({
      logo_url: '',
      logo_alt: '',
      description: '',
      stats: [
        { number: '', label: '' },
        { number: '', label: '' },
        { number: '', label: '' },
        { number: '', label: '' },
      ],
    });
    setStorySectionData({
      paragraphs: ['', '', ''],
      vision: { title: 'Tầm nhìn:', content: '' },
      mission: { title: 'Sứ mệnh:', content: '' },
      coreValues: { title: 'Giá trị cốt lõi:', content: '' },
    });
    setTeamSectionData({ members: [] });
    setWhyChooseSectionData({
      badge: 'UY TÍN & CHẤT LƯỢNG',
      title: 'Tại sao nên chọn Inlandv',
      subtitle: '',
      features: [],
    });
    setClientsSectionData({
      badge: 'KHÁCH HÀNG & ĐỐI TÁC',
      title: 'Khách hàng Tiêu biểu',
      subtitle: '',
      stats: [
        { icon: 'building', number: '', label: '' },
        { icon: 'users', number: '', label: '' },
        { icon: 'award', number: '', label: '' },
        { icon: 'star', number: '', label: '' },
      ],
      categories: [],
      footer_note: '',
    });
    setServicesHeroData({
      badge: 'Giải pháp toàn diện',
      title: 'Giải Pháp Bất Động Sản Công Nghiệp',
      title_highlight: 'Toàn Diện Cho Doanh Nghiệp FDI.',
      subtitle: '',
      button_text: 'Tải Brochure',
      button_link: '/brochures/dich-vu.pdf',
    });
    setBrokerageSectionData({
      badge: 'Môi giới BĐS Công nghiệp',
      title: 'Thuê / Mua',
      title_highlight: 'Hiệu Quả',
      subtitle: '',
      advantages: [],
      process: [],
      diverse_areas: [],
      categories: [],
    });
    setLegalInvestmentSectionData({
      badge: 'Tư vấn Pháp lý & Đầu tư',
      title: 'An Toàn',
      title_highlight: 'Pháp Lý',
      subtitle: '',
      services: [],
      benefits: [],
      summary_title: 'Kết quả mang lại',
      summary_description: '',
      stats: [
        { value: '', label: '' },
        { value: '', label: '' },
        { value: '', label: '' },
      ],
    });
    setFDISupportSectionData({
      badge: 'Hỗ trợ FDI',
      title: 'Vận Hành Ổn Định Ngay Từ Ngày Đầu',
      title_highlight: '',
      subtitle: '',
      pillars: [],
      services: [],
      outcomes: [
        { value: '', label: '' },
        { value: '', label: '' },
        { value: '', label: '' },
        { value: '', label: '' },
      ],
      summary_title: 'Tại sao quan trọng',
      summary_description: '',
      stats: [
        { value: '', label: '' },
        { value: '', label: '' },
        { value: '', label: '' },
      ],
    });
    setDesignConstructionSectionData({
      badge: 'Thiết kế & Thi công',
      title: 'Triển Khai',
      title_highlight: 'Chuẩn Hoá',
      subtitle: '',
      phases: [],
      advantages: [],
      quality_title: 'Kiểm soát chất lượng',
      quality_description: '',
      quality_stats: [
        { value: '', label: '' },
        { value: '', label: '' },
        { value: '', label: '' },
        { value: '', label: '' },
      ],
      interlink_title: 'Kết nối INTERLINK',
      interlink_description: '',
      interlink_items: [],
    });
    setEditingSection(null);
    setShowSectionModal(true);
  };

  const handleOpenEditSection = (section: PageSection) => {
    setSectionFormData({
      ...section,
      images: section.images || [],
    });
    
    // Parse structured data based on section type
    if (section.content) {
      try {
        if (section.section_type === 'hero') {
          // Check if it's services hero or about hero
          if (section.section_key === 'hero' && section.content.includes('services-hero')) {
            const parsed = parseServicesHeroHTML(section.content);
            setServicesHeroData(parsed);
          } else {
            const parsed = parseHeroHTML(section.content);
            setHeroSectionData(parsed);
          }
        } else if (section.section_key === 'cau-chuyen') {
          const parsed = parseStoryHTML(section.content);
          setStorySectionData(parsed);
        } else if (section.section_type === 'team') {
          const parsed = parseTeamHTML(section.content);
          setTeamSectionData(parsed);
        } else if (section.section_key === 'tai-sao-chon-inlandv' || section.section_key === 'tai-sao') {
          const parsed = parseWhyChooseHTML(section.content);
          setWhyChooseSectionData(parsed);
        } else if (section.section_type === 'clients' || section.section_key === 'khach-hang-doi-tac' || section.section_key === 'khach-hang') {
          const parsed = parseClientsHTML(section.content);
          setClientsSectionData(parsed);
        } else if (section.section_key === 'moi-gioi') {
          const parsed = parseBrokerageHTML(section.content);
          setBrokerageSectionData(parsed);
        } else if (section.section_key === 'phap-ly') {
          const parsed = parseLegalInvestmentHTML(section.content);
          setLegalInvestmentSectionData(parsed);
        } else if (section.section_key === 'fdi') {
          const parsed = parseFDISupportHTML(section.content);
          setFDISupportSectionData(parsed);
        } else if (section.section_key === 'thiet-ke-thi-cong') {
          const parsed = parseDesignConstructionHTML(section.content);
          setDesignConstructionSectionData(parsed);
        }
      } catch (error) {
        console.error('Failed to parse section:', error);
      }
    }
    
    setEditingSection(section);
    setShowSectionModal(true);
  };

  const handleSaveSection = () => {
    if (!sectionFormData.section_key || !sectionFormData.name) {
      toast.error('Vui lòng điền đầy đủ thông tin section');
      return;
    }

    // Generate HTML from structured data based on section type
    let finalContent = sectionFormData.content;
    
    if (sectionFormData.section_type === 'hero') {
      // Check if it's services hero or about hero
      if (sectionFormData.section_key === 'hero' && formData.slug === 'dich-vu') {
        finalContent = generateServicesHeroHTML(servicesHeroData);
      } else {
        // For about page (gioi-thieu), use JSON format instead of HTML
        if (formData.slug === 'gioi-thieu') {
          // Get background image from section images (from MediaPicker) if available
          // Use the same key logic as when saving to database
          const sectionKey = editingSection?.id || editingSection?.section_key || sectionFormData.section_key;
          const imageIds = sectionImageIds[sectionKey] || [];
          const backgroundImage = imageIds.length > 0 ? getAssetUrl(imageIds[0]) : undefined;
          
          // Use logo_id directly from heroSectionData if available
          const logoId = heroSectionData.logo_id || undefined;
          console.log('[handleSaveSection] Saving hero section:', {
            logo_id: logoId,
            logo_url: heroSectionData.logo_url,
            backgroundImage
          });
          
          finalContent = generateHeroJSON(heroSectionData, backgroundImage, logoId);
        } else {
          finalContent = generateHeroHTML(heroSectionData);
        }
      }
    } else if (sectionFormData.section_key === 'cau-chuyen') {
      // For about page (gioi-thieu), use JSON format
      if (formData.slug === 'gioi-thieu') {
        finalContent = generateStoryJSON(storySectionData);
      } else {
        finalContent = generateStoryHTML(storySectionData);
      }
    } else if (sectionFormData.section_type === 'team') {
      // For about page (gioi-thieu), use JSON format
      if (formData.slug === 'gioi-thieu') {
        finalContent = generateTeamJSON(teamSectionData);
      } else {
        finalContent = generateTeamHTML(teamSectionData);
      }
    } else if (sectionFormData.section_key === 'tai-sao-chon-inlandv' || sectionFormData.section_key === 'tai-sao') {
      // For about page (gioi-thieu), use JSON format
      if (formData.slug === 'gioi-thieu') {
        const backgroundImage = sectionFormData.images && sectionFormData.images.length > 0 
          ? sectionFormData.images[0] 
          : undefined;
        finalContent = generateWhyChooseJSON(whyChooseSectionData, backgroundImage);
      } else {
        finalContent = generateWhyChooseHTML(whyChooseSectionData);
      }
    } else if (sectionFormData.section_type === 'clients' || sectionFormData.section_key === 'khach-hang-doi-tac' || sectionFormData.section_key === 'khach-hang') {
      // For about page (gioi-thieu), use JSON format
      if (formData.slug === 'gioi-thieu') {
        const backgroundImage = sectionFormData.images && sectionFormData.images.length > 0 
          ? sectionFormData.images[0] 
          : undefined;
        finalContent = generateClientsJSON(clientsSectionData, backgroundImage);
      } else {
        finalContent = generateClientsHTML(clientsSectionData);
      }
    } else if (sectionFormData.section_key === 'moi-gioi') {
      finalContent = generateBrokerageHTML(brokerageSectionData);
    } else if (sectionFormData.section_key === 'phap-ly') {
      finalContent = generateLegalInvestmentHTML(legalInvestmentSectionData);
    } else if (sectionFormData.section_key === 'fdi') {
      finalContent = generateFDISupportHTML(fdiSupportSectionData);
    } else if (sectionFormData.section_key === 'thiet-ke-thi-cong') {
      finalContent = generateDesignConstructionHTML(designConstructionSectionData);
    }

    const sectionToSave: PageSection = {
      ...sectionFormData,
      content: finalContent,
    };

    console.log('[handleSaveSection] Section to save:', {
      section_key: sectionToSave.section_key,
      content_preview: finalContent.substring(0, 200),
      content_length: finalContent.length
    });

    if (editingSection) {
      // Update existing section
      setSections(sections.map(s => 
        s.id === editingSection.id || s.section_key === editingSection.section_key
          ? { ...sectionToSave, id: editingSection.id }
          : s
      ));
    } else {
      // Add new section
      const newSection: PageSection = {
        ...sectionToSave,
        display_order: sections.length,
      };
      setSections([...sections, newSection]);
    }
    setShowSectionModal(false);
    setEditingSection(null);
  };

  // Delete section function disabled - sections can only be updated, not deleted
  // const handleDeleteSection = (index: number) => {
  //   if (!confirm('Bạn có chắc chắn muốn xóa section này?')) return;
  //   const newSections = sections.filter((_, i) => i !== index);
  //   setSections(newSections);
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }

    try {
      setSaving(true);

      // Save page first
      const pageData: any = {
        ...formData,
      };

      const pageUrl = isNew ? buildApiUrl('/pages') : buildApiUrl(`/pages/${id}`);
      const pageMethod = isNew ? 'post' : 'put';
      
      const pageResponse = await axios[pageMethod](pageUrl, pageData, {
        withCredentials: true,
      });

      const pageId = pageResponse.data.id || id;

      // Save sections
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sectionKey = section.id || section.section_key;
        const imageIds = sectionImageIds[sectionKey] || [];
        const imageUrls = imageIds.map(id => getAssetUrl(id));
        
        // For hero section on about page, extract background image from JSON content and ensure it's in images array
        let finalImages = imageUrls;
        if (formData.slug === 'gioi-thieu' && section.section_key === 'hero' && section.content) {
          try {
            const parsed = JSON.parse(section.content);
            if (parsed.backgroundImage) {
              // Ensure background image is the first in images array
              const bgImageUrl = parsed.backgroundImage;
              // Remove background image from array if it exists elsewhere
              finalImages = imageUrls.filter(url => url !== bgImageUrl);
              // Add background image as first element
              finalImages = [bgImageUrl, ...finalImages];
            }
          } catch (e) {
            // Not JSON, use imageUrls as is
          }
        }
        
        const sectionData: any = {
          page_id: pageId,
          section_key: section.section_key,
          name: section.name,
          section_type: section.section_type,
          display_order: i,
          content: section.content || null,
          images: finalImages,
          published: section.published !== false,
        };

        // Debug log for hero section
        if (section.section_key === 'hero' && formData.slug === 'gioi-thieu') {
          console.log('[handleSubmit] Saving hero section to DB:', {
            section_key: section.section_key,
            content_preview: section.content?.substring(0, 200),
            content_length: section.content?.length,
            images: finalImages
          });
          try {
            const parsed = JSON.parse(section.content || '{}');
            console.log('[handleSubmit] Parsed JSON content:', {
              logo: parsed.logo,
              hasDescription: !!parsed.description,
              statsCount: parsed.stats?.length
            });
          } catch (e) {
            console.warn('[handleSubmit] Failed to parse section content as JSON:', e);
          }
        }

        if (section.id) {
          // Update existing section
          await axios.put(buildApiUrl(`/page-sections/${section.id}`), sectionData, {
            withCredentials: true,
          });
        } else {
          // Create new section
          await axios.post(buildApiUrl('/page-sections'), sectionData, {
            withCredentials: true,
          });
        }
      }

      toast.success(isNew ? 'Đã tạo trang' : 'Đã cập nhật trang');
      router.push('/dashboard/pages');
    } catch (error: any) {
      console.error('Failed to save page:', error);
      toast.error(error.response?.data?.error || 'Không thể lưu trang');
    } finally {
      setSaving(false);
    }
  };

  if (!isInitialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isNew ? 'Tạo trang' : 'Chỉnh sửa trang'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isNew ? 'Thêm trang mới' : 'Cập nhật thông tin trang'}
          </p>
        </div>
        <Link
          href="/dashboard/pages"
          className="inline-flex items-center gap-2 rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-medium text-card-foreground">Thông tin cơ bản</h3>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tiêu đề <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  updateField('title', e.target.value);
                }}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, slug: e.target.value }));
                  setSlugManuallyEdited(true);
                }}
                onBlur={() => {
                  if (!formData.slug && formData.title) {
                    setFormData((prev) => ({ ...prev, slug: generateSlug(prev.title) }));
                    setSlugManuallyEdited(false);
                  }
                }}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={formData.title ? generateSlug(formData.title) : "tự-động-tạo-từ-tiêu-đề"}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Phiên bản thân thiện với URL của tiêu đề. Tự động tạo nếu để trống.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Loại trang
                </label>
                <select
                  value={formData.page_type}
                  onChange={(e) => updateField('page_type', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="static">Trang tĩnh</option>
                  <option value="homepage">Trang chủ</option>
                </select>
              </div>
              <div className="flex items-center pt-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => updateField('published', e.target.checked)}
                    className="rounded border-input"
                  />
                  <span className="text-sm text-foreground">Xuất bản</span>
                </label>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-card-foreground">Sections</h3>
              <button
                type="button"
                onClick={handleOpenAddSection}
                className="inline-flex items-center gap-2 rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <Plus className="h-4 w-4" />
                Thêm Section
              </button>
            </div>

            {sections.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Chưa có section nào. Click "Thêm Section" để bắt đầu.
              </p>
            ) : (
              <div className="space-y-4">
                {sections.map((section, index) => (
                  <div key={section.id || index} className="rounded-lg border border-border p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{section.name}</span>
                        <span className="text-xs text-muted-foreground">({section.section_type})</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditSection(section)}
                          className="p-1 rounded hover:bg-muted transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {/* Delete button removed - sections can only be updated, not deleted */}
                      </div>
                    </div>
                    {section.content && (
                      <div 
                        className="text-sm text-muted-foreground line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: section.content.substring(0, 100) + '...' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* SEO */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-medium text-card-foreground">SEO</h3>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) => updateField('meta_title', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Meta Description
              </label>
              <textarea
                value={formData.meta_description}
                onChange={(e) => updateField('meta_description', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-lg border border-border bg-card p-6">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Đang lưu...' : isNew ? 'Tạo mới' : 'Cập nhật'}
            </button>
          </div>
        </div>
      </form>

      {/* Section Modal */}
      {showSectionModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSectionModal(false);
              setEditingSection(null);
            }
          }}
        >
          <div 
            className="bg-card rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {editingSection ? 'Sửa Section' : 'Thêm Section mới'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowSectionModal(false);
                  setEditingSection(null);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Section Key <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={sectionFormData.section_key}
                    onChange={(e) => setSectionFormData(prev => ({ ...prev, section_key: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="hero, about, services"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tên Section <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={sectionFormData.name}
                    onChange={(e) => setSectionFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Hero Section"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Loại Section <span className="text-destructive">*</span>
                </label>
                <select
                  value={sectionFormData.section_type}
                  onChange={(e) => setSectionFormData(prev => ({ ...prev, section_type: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {sectionTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Conditional rendering based on section type */}
              {sectionFormData.section_type === 'hero' && sectionFormData.section_key === 'hero' && formData.slug === 'dich-vu' ? (
                <ServicesHeroEditor
                  data={servicesHeroData}
                  onChange={setServicesHeroData}
                />
              ) : sectionFormData.section_type === 'hero' ? (
                <HeroSectionEditor
                  data={heroSectionData}
                  onChange={setHeroSectionData}
                />
              ) : sectionFormData.section_key === 'cau-chuyen' ? (
                <StorySectionEditor
                  data={storySectionData}
                  onChange={setStorySectionData}
                />
              ) : sectionFormData.section_type === 'team' ? (
                <TeamSectionEditor
                  data={teamSectionData}
                  onChange={setTeamSectionData}
                />
              ) : sectionFormData.section_key === 'tai-sao-chon-inlandv' || sectionFormData.section_key === 'tai-sao' ? (
                <WhyChooseSectionEditor
                  data={whyChooseSectionData}
                  onChange={setWhyChooseSectionData}
                />
              ) : sectionFormData.section_type === 'clients' || sectionFormData.section_key === 'khach-hang-doi-tac' || sectionFormData.section_key === 'khach-hang' ? (
                <ClientsSectionEditor
                  data={clientsSectionData}
                  onChange={setClientsSectionData}
                />
              ) : sectionFormData.section_key === 'moi-gioi' ? (
                <BrokerageSectionEditor
                  data={brokerageSectionData}
                  onChange={setBrokerageSectionData}
                />
              ) : sectionFormData.section_key === 'phap-ly' ? (
                <LegalInvestmentSectionEditor
                  data={legalInvestmentSectionData}
                  onChange={setLegalInvestmentSectionData}
                />
              ) : sectionFormData.section_key === 'fdi' ? (
                <FDISupportSectionEditor
                  data={fdiSupportSectionData}
                  onChange={setFDISupportSectionData}
                />
              ) : sectionFormData.section_key === 'thiet-ke-thi-cong' ? (
                <DesignConstructionSectionEditor
                  data={designConstructionSectionData}
                  onChange={setDesignConstructionSectionData}
                />
              ) : (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nội dung
                  </label>
                  <TinyMCEEditor
                    value={sectionFormData.content}
                    onChange={(content) => setSectionFormData(prev => ({ ...prev, content }))}
                    height={300}
                  />
                </div>
              )}

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sectionFormData.published}
                    onChange={(e) => setSectionFormData(prev => ({ ...prev, published: e.target.checked }))}
                    className="rounded border-input"
                  />
                  <span className="text-sm text-foreground">Xuất bản</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleSaveSection}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                >
                  {editingSection ? 'Cập nhật' : 'Thêm mới'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSectionModal(false);
                    setEditingSection(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-input bg-background text-foreground hover:bg-muted transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


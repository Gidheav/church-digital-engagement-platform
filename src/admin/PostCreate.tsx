/**
 * PostCreate Component - Desktop-Optimized Edition
 * Professional 2-column form with collapsible right sidebar
 * Desktop-first responsive design
 * WITH AUTO-SAVE FUNCTIONALITY
 */

import React, { useState, useEffect } from 'react';
import postService, { PostCreateData } from '../services/post.service';
import contentTypeService, { ContentType } from '../services/contentType.service';
import seriesService, { Series } from '../services/series.service';
import RichTextEditor from '../components/RichTextEditor';
import { useAutoSave } from '../hooks/useAutoSave';
import { useAuth } from '../auth/AuthContext';
import draftService, { Draft } from '../services/draft.service';
import { 
  XIcon, 
  TypeIcon, 
  ImageIcon, 
  MessageSquareIcon,
  HeartIcon,
  SendIcon,
  SaveIcon,
  AlertCircleIcon,
  FolderIcon,
  PlusIcon,
  ChevronDownIcon,
} from './components/Icons';
import './styles/PostForm.desktop.css';
import ImageUploadInput from './components/ImageUploadInput';

interface PostCreateProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialDraft?: Draft | null;
}

const PostCreate: React.FC<PostCreateProps> = ({ onSuccess, onCancel, initialDraft = null }) => {
  // Immediate diagnostic log when component renders
  console.log('[MOUNT] PostCreate component rendered at:', new Date().toISOString());
  console.log('[MOUNT] initialDraft prop:', initialDraft);
  console.log('[MOUNT] initialDraft ID:', initialDraft?.id);
  console.log('[MOUNT] initialDraft.draft_data:', initialDraft?.draft_data);
  
  // Get user from auth context
  const { user } = useAuth();
  
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  // Start sidebar closed on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth > 1024 : true);
  const [formData, setFormData] = useState<PostCreateData>({
    title: '',
    content: '',
    content_type: '',
    status: 'DRAFT',
    comments_enabled: true,
    reactions_enabled: true,
    featured_image: '',
    video_url: '',
    audio_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Series state
  const [availableSeries, setAvailableSeries] = useState<Series[]>([]);
  const [isPartOfSeries, setIsPartOfSeries] = useState(false);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('');
  const [seriesOrder, setSeriesOrder] = useState<number>(1);
  const [showQuickCreateSeries, setShowQuickCreateSeries] = useState(false);
  const [seriesContentTypeId, setSeriesContentTypeId] = useState<string>('');
  const [previousContentType, setPreviousContentType] = useState<string>('');
  const initialDraftId = initialDraft?.id || null;
  
  // Auto-save state - use user ID from auth context
  const [userId, setUserId] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [draftCreated, setDraftCreated] = useState(false);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  // Get user ID from auth context
  useEffect(() => {
    console.log('[AUTH] Getting user ID from auth context');
    if (user && user.id) {
      console.log('[AUTH] Successfully got user_id:', user.id);
      setUserId(user.id);
    } else {
      console.log('[AUTH] No user in auth context');
      setUserId('');
    }
  }, [user]);

  // Initialize auto-save hook
  const {
    status: autoSaveStatus,
    lastSaved,
    saveDraft,
    forceSave,
    deleteDraft,
    currentDraftId,
    setCurrentDraftId,
  } = useAutoSave({
    userId,
    postId: null, // null for new post
    enabled: !!userId, // Enable when user is authenticated
    debounceDelay: 10000, // 10 seconds per specification
    initialDraftId,
    onSaveSuccess: (draft) => {
      console.log('Draft saved successfully:', draft.id);
      setLastSavedTime(new Date());
    },
    onSaveError: (err) => {
      console.error('Draft save error:', err);
    },
  });

  useEffect(() => {
    console.log('📝 [LOAD DRAFT] useEffect triggered');
    console.log('📝 [LOAD DRAFT] initialDraft:', initialDraft);
    console.log('📝 [LOAD DRAFT] initialDraft?.draft_data:', initialDraft?.draft_data);
    
    if (!initialDraft || !initialDraft.draft_data) {
      console.log('📝 [LOAD DRAFT] EARLY RETURN: No initial draft or draft data');
      return;
    }

    const draftData = initialDraft.draft_data;
    console.log('📝 [LOAD DRAFT] Loading draft data:', draftData);
    console.log('📝 [LOAD DRAFT] Title:', draftData.title);
    console.log('📝 [LOAD DRAFT] Content length:', draftData.content?.length || 0);
    console.log('📝 [LOAD DRAFT] Content preview:', draftData.content?.substring(0, 100));
    console.log('📝 [LOAD DRAFT] Content type from draft object:', initialDraft.content_type);
    
    const loadedFormData = {
      title: draftData.title || '',
      content: draftData.content || '',
      content_type: initialDraft.content_type || '', // FIX: content_type is at top level, not in draft_data
      status: draftData.status || 'DRAFT',
      comments_enabled: draftData.comments_enabled ?? true,
      reactions_enabled: draftData.reactions_enabled ?? true,
      featured_image: draftData.featured_image || '',
      video_url: draftData.video_url || '',
      audio_url: draftData.audio_url || '',
    };
    
    console.log('📝 [LOAD DRAFT] Setting formData:', loadedFormData);
    setFormData(loadedFormData);

    if (draftData.series) {
      console.log('📝 [LOAD DRAFT] Setting series:', draftData.series);
      setIsPartOfSeries(true);
      setSelectedSeriesId(draftData.series);
      setSeriesOrder(draftData.series_order || 1);
    }
    
    console.log('📝 [LOAD DRAFT] Draft loading complete!');
    
    // Mark draft as created since we're loading an existing draft
    if (initialDraft?.id) {
      console.log('📝 [LOAD DRAFT] Setting draftCreated to true for initialDraft:', initialDraft.id);
      setDraftCreated(true);
    }
  }, [initialDraft]);

  useEffect(() => {
    const loadContentTypes = async () => {
      try {
        const types = await contentTypeService.getEnabled();
        setContentTypes(types);
        
        // Find and store Series content type ID
        const seriesType = types.find(t => t.slug === 'series');
        if (seriesType) {
          setSeriesContentTypeId(seriesType.id);
        }
        
        if (types.length > 0 && !formData.content_type) {
          setFormData(prev => ({ ...prev, content_type: types[0].id }));
          setPreviousContentType(types[0].id);
        }
      } catch (err) {
        console.error('Failed to load content types:', err);
      } finally {
        setLoadingTypes(false);
      }
    };
    
    const loadSeries = async () => {
      try {
        const series = await seriesService.getAllSeries();
        setAvailableSeries(Array.isArray(series) ? series : []);
      } catch (err) {
        console.error('Failed to load series:', err);
      }
    };
    
    loadContentTypes();
    loadSeries();
  }, []);

  // Clean up old localStorage backups on mount - NO recovery prompt
  // If user wants to recover drafts, they should use the Drafts tab
  useEffect(() => {
    const cleanupOldBackups = () => {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('draft_backup_'));
      if (keys.length > 0) {
        console.log(`🧹 [CLEANUP] Removing ${keys.length} old localStorage backups`);
        keys.forEach(k => localStorage.removeItem(k));
      }
    };
    cleanupOldBackups();
  }, []);

  // Handle series toggle - automatically set/restore content type
  useEffect(() => {
    if (isPartOfSeries && seriesContentTypeId) {
      // Store current content type before switching
      if (!previousContentType && formData.content_type) {
        setPreviousContentType(formData.content_type);
      }
      // Set content type to Series
      setFormData(prev => ({ ...prev, content_type: seriesContentTypeId }));
    } else if (!isPartOfSeries && previousContentType) {
      // Restore previous content type
      setFormData(prev => ({ ...prev, content_type: previousContentType }));
    }
  }, [isPartOfSeries]);

  // Tooltip positioning effect
  useEffect(() => {
    const handleTooltipPosition = () => {
      const triggers = document.querySelectorAll('.tooltip-trigger');
      triggers.forEach((trigger) => {
        const rect = trigger.getBoundingClientRect();
        const tooltip = trigger.querySelector('.tooltip-content') as HTMLElement;
        if (tooltip) {
          tooltip.style.setProperty('top', `${rect.top}px`);
          tooltip.style.setProperty('left', `${rect.left + rect.width / 2}px`);
        }
      });
    };

    const handleMouseEnter = (e: Event) => {
      const trigger = (e.currentTarget as HTMLElement);
      const rect = trigger.getBoundingClientRect();
      const tooltip = trigger.querySelector('.tooltip-content') as HTMLElement;
      if (tooltip) {
        tooltip.style.setProperty('top', `${rect.top}px`);
        tooltip.style.setProperty('left', `${rect.left + rect.width / 2}px`);
      }
    };

    // Position on mount and scroll
    handleTooltipPosition();
    window.addEventListener('scroll', handleTooltipPosition, true);
    window.addEventListener('resize', handleTooltipPosition);

    // Add hover listeners to all tooltip triggers
    const triggers = document.querySelectorAll('.tooltip-trigger');
    triggers.forEach(trigger => {
      trigger.addEventListener('mouseenter', handleMouseEnter);
    });

    return () => {
      window.removeEventListener('scroll', handleTooltipPosition, true);
      window.removeEventListener('resize', handleTooltipPosition);
      triggers.forEach(trigger => {
        trigger.removeEventListener('mouseenter', handleMouseEnter);
      });
    };
  }, []);

  // FIX #2: Auto-save when form data changes - NO validation gate
  // WITH DIAGNOSTIC LOGGING
  useEffect(() => {
    console.log('🔵 [AUTO-SAVE] Form changed');
    console.log('   currentDraftId:', currentDraftId);
    console.log('   auto-save enabled:', !!currentDraftId);
    
    if (!currentDraftId) {
      console.log('⏸️  [AUTO-SAVE] Waiting for draft to be created...');
      return;
    }
    
    console.log('💾 [AUTO-SAVE] Scheduling debounced auto-save (10 seconds)');
    console.log('💾 [AUTO-SAVE] formData.content length:', formData.content?.length || 0);
    console.log('💾 [AUTO-SAVE] formData.content preview:', formData.content?.substring(0, 100));
    
    const draftData = {
      title: formData.title || 'Untitled Draft',
      content: formData.content || '',
      status: formData.status,
      comments_enabled: formData.comments_enabled,
      reactions_enabled: formData.reactions_enabled,
      featured_image: formData.featured_image,
      video_url: formData.video_url,
      audio_url: formData.audio_url,
      series: isPartOfSeries ? selectedSeriesId : null,
      series_order: isPartOfSeries ? seriesOrder : undefined,
    };

    console.log('💾 [AUTO-SAVE] draftData.content length:', draftData.content?.length || 0);
    console.log('💾 [AUTO-SAVE] draftData.content preview:', draftData.content?.substring(0, 100));
    console.log('💾 [AUTO-SAVE] Will save:', {title: draftData.title, contentLength: draftData.content.length});
    saveDraft(draftData, formData.content_type || null);
  }, [formData, isPartOfSeries, selectedSeriesId, seriesOrder, saveDraft, currentDraftId]);

  // FIX #3: Use sendBeacon() for page unload - CRITICAL FIX
  // WITH DIAGNOSTIC LOGGING
  // Updated: Only warn if there are unsaved changes (last save > 15 seconds ago or currently saving)
  useEffect(() => {
    const handleBeforeUnload = (_e: BeforeUnloadEvent) => {
      console.log('⚠️  [UNLOAD] beforeunload event triggered');
      console.log('   currentDraftId:', currentDraftId);
      console.log('   autoSaveStatus:', autoSaveStatus);
      console.log('   lastSavedTime:', lastSavedTime);
      
      if (!currentDraftId) {
        console.log('⏭️  [UNLOAD] No draft ID, nothing to save');
        return;
      }
      
      // Check if we have recently saved changes
      const now = Date.now();
      const timeSinceLastSave = lastSavedTime ? now - lastSavedTime.getTime() : Infinity;
      const hasRecentlySaved = timeSinceLastSave < 15000; // within last 15 seconds
      const isCurrentlySaving = autoSaveStatus === 'saving';
      
      console.log('   Time since last save:', timeSinceLastSave, 'ms');
      console.log('   Has recently saved:', hasRecentlySaved);
      console.log('   Is currently saving:', isCurrentlySaving);
      
      // Only prompt if there might be unsaved changes
      if (hasRecentlySaved || !isCurrentlySaving) {
        console.log('✅ [UNLOAD] Auto-save is working, no warning needed');
        return;
      }
      
      // Send final save attempt via sendBeacon
      console.log('📤 [UNLOAD] Sending final save via sendBeacon()');
      
      const draftData = {
        title: formData.title || 'Untitled Draft',
        content: formData.content || '',
        status: formData.status,
        comments_enabled: formData.comments_enabled,
        reactions_enabled: formData.reactions_enabled,
        featured_image: formData.featured_image,
        video_url: formData.video_url,
        audio_url: formData.audio_url,
      };
      
      try {
        const payload = JSON.stringify({
          draft_data: draftData,
          content_type: formData.content_type || null
        });
        
        console.log('   Payload size:', payload.length, 'bytes');
        
        const blob = new Blob([payload], { type: 'application/json' });
        const beaconResponse = navigator.sendBeacon(
          `http://localhost:8000/api/v1/admin/content/drafts/${currentDraftId}/`,
          blob
        );
        
        console.log('✅ [UNLOAD] sendBeacon response:', beaconResponse);
      } catch (err) {
        console.error('❌ [UNLOAD] sendBeacon failed:', err);
      }
      
      // Also save to localStorage as backup
      console.log('💾 [UNLOAD] Also saving to localStorage backup');
      saveToLocalStorage({
        id: currentDraftId,
        draft_data: draftData,
        timestamp: Date.now()
      });
      
      // No confirmation prompt - auto-save handles everything
    };

    console.log('📌 [UNLOAD] Registering beforeunload handler');
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      console.log('🗑️  [UNLOAD] Cleaning up beforeunload handler');
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentDraftId, formData, autoSaveStatus, lastSavedTime]);

  // FIX #4: Add localStorage fallback
  const saveToLocalStorage = (data: any) => {
    try {
      const key = `draft_backup_${currentDraftId || 'new'}_${Date.now()}`;
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now(),
        userId
      }));
      
      const keys = Object.keys(localStorage).filter(k => k.startsWith('draft_backup_'));
      if (keys.length > 10) {
        keys.sort().slice(0, keys.length - 10).forEach(k => localStorage.removeItem(k));
      }
      
      console.log('💾 [AUTO-SAVE] Saved to localStorage');
    } catch (e) {
      console.error('[AUTO-SAVE] localStorage error:', e);
    }
  };

  // Create the initial draft on first user interaction (keystroke)
  const createInitialDraft = async (overrides?: Partial<PostCreateData>) => {
    // Don't create if already creating, already created, or draft already exists
    if (isCreatingDraft || draftCreated || currentDraftId || !userId) {
      console.log('[FIRST-KEYSTROKE] SKIPPED - already creating or draft exists');
      return;
    }

    setIsCreatingDraft(true);
    console.log('[FIRST-KEYSTROKE] Creating initial draft on first user input');
    console.log('[FIRST-KEYSTROKE] formData:', formData);
    console.log('[FIRST-KEYSTROKE] overrides:', overrides);

    try {
      const draftState = { ...formData, ...overrides };
      console.log('[FIRST-KEYSTROKE] draftState after merge:', draftState);
      console.log('[FIRST-KEYSTROKE] draftState.content length:', draftState.content?.length || 0);
      console.log('[FIRST-KEYSTROKE] draftState.content preview:', draftState.content?.substring(0, 100));
      
      const draftPayload = {
        draft_data: {
          title: draftState.title || 'Untitled Draft',
          content: draftState.content || '',
          status: draftState.status || 'DRAFT',
          comments_enabled: draftState.comments_enabled ?? true,
          reactions_enabled: draftState.reactions_enabled ?? true,
          featured_image: draftState.featured_image || '',
          video_url: draftState.video_url || '',
          audio_url: draftState.audio_url || '',
        },
        content_type: draftState.content_type || null,
        post: null
      };
      
      console.log('[FIRST-KEYSTROKE] draftPayload.draft_data.content length:', draftPayload.draft_data.content?.length || 0);
      console.log('[FIRST-KEYSTROKE] draftPayload.draft_data.content preview:', draftPayload.draft_data.content?.substring(0, 100));

      const newDraft = await draftService.createDraft(draftPayload);
      console.log('[FIRST-KEYSTROKE] Draft created successfully:', newDraft.id);
      
      setCurrentDraftId(newDraft.id);
      setDraftCreated(true);
      setLastSavedTime(new Date());
    } catch (error: any) {
      console.error('[FIRST-KEYSTROKE] Failed to create initial draft:', error);
      setError('Failed to create draft. Your changes may not be saved.');
    } finally {
      setIsCreatingDraft(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      // Create draft on first interaction if needed
      if (!currentDraftId && !isCreatingDraft && !initialDraftId) {
        createInitialDraft({ [name]: checked } as Partial<PostCreateData>);
      }
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      // Create draft on first interaction if needed
      if (!currentDraftId && !isCreatingDraft && !initialDraftId) {
        createInitialDraft({ [name]: value } as Partial<PostCreateData>);
      }
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle rich text editor content change
  const handleContentChange = (content: string) => {
    console.log('📝 [CONTENT-CHANGE] handleContentChange called');
    console.log('📝 [CONTENT-CHANGE] Content length:', content?.length || 0);
    console.log('📝 [CONTENT-CHANGE] Content preview:', content?.substring(0, 100));
    console.log('📝 [CONTENT-CHANGE] currentDraftId:', currentDraftId);
    console.log('📝 [CONTENT-CHANGE] isCreatingDraft:', isCreatingDraft);
    console.log('📝 [CONTENT-CHANGE] initialDraftId:', initialDraftId);
    
    // Create draft on first interaction if needed
    if (!currentDraftId && !isCreatingDraft && !initialDraftId) {
      console.log('📝 [CONTENT-CHANGE] Triggering createInitialDraft with content');
      createInitialDraft({ content });
    } else {
      console.log('📝 [CONTENT-CHANGE] NOT creating draft (already exists or creating)');
    }
    
    console.log('📝 [CONTENT-CHANGE] Updating formData with content');
    setFormData((prev) => {
      console.log('📝 [CONTENT-CHANGE] Previous formData.content length:', prev.content?.length || 0);
      console.log('📝 [CONTENT-CHANGE] New content length:', content?.length || 0);
      return { ...prev, content };
    });
  };

  // Handle image upload for the rich text editor
  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      // TODO: Implement actual image upload to your backend
      // For now, return a placeholder or convert to base64
      
      // Example implementation (replace with actual API call):
      // const formData = new FormData();
      // formData.append('image', file);
      // const response = await axios.post('/api/v1/upload/image', formData);
      // return response.data.url;

      // Temporary base64 conversion (not recommended for production)
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    if (!formData.content_type) {
      setError('Please select a content type');
      return;
    }

    if (formData.status === 'PUBLISHED') {
      formData.published_at = new Date().toISOString();
    }

    // Add series data if selected
    const postData: any = { ...formData };
    if (isPartOfSeries && selectedSeriesId) {
      postData.series = selectedSeriesId;
      postData.series_order = seriesOrder;
    }

    setLoading(true);
    setError('');

    try {
      if (initialDraft?.post) {
        const draftData = {
          ...postData,
          status: 'DRAFT',
        };
        await forceSave(draftData, formData.content_type || null);
        await draftService.publishDraft(initialDraft.id);
      } else {
        await postService.createPost(postData);
        // Delete draft after successful creation
        await deleteDraft();
      }
      onSuccess();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.detail || 'Failed to create post';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePublish = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    if (!formData.content_type) {
      setError('Please select a content type');
      return;
    }

    const postData: any = { 
      ...formData, 
      status: 'PUBLISHED',
      published_at: new Date().toISOString()
    };
    
    // Add series data if selected
    if (isPartOfSeries && selectedSeriesId) {
      postData.series = selectedSeriesId;
      postData.series_order = seriesOrder;
    }

    setLoading(true);
    setError('');

    try {
      if (initialDraft?.post) {
        const draftData = {
          ...postData,
          status: 'PUBLISHED',
          published_at: new Date().toISOString(),
        };
        await forceSave(draftData, formData.content_type || null);
        await draftService.publishDraft(initialDraft.id);
      } else {
        await postService.createPost(postData);
        // Delete draft after successful publish
        await deleteDraft();
      }
      onSuccess();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.detail || 'Failed to publish post';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  
  const handleQuickCreateSeries = async (title: string, visibility: string) => {
    try {
      const newSeries = await seriesService.createSeries({ title, visibility } as any);
      setAvailableSeries(prev => [...prev, newSeries]);
      setSelectedSeriesId(newSeries.id);
      setShowQuickCreateSeries(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create series');
    }
  };
  
  // Manual save draft handler
  const handleManualSaveDraft = async () => {
    const hasContent = formData.title.trim().length > 0 || formData.content.trim().length >= 5;
    
    if (!hasContent) {
      alert('Please type at least 5 characters to save a draft');
      return;
    }
    
    try {
      const draftData = {
        title: formData.title || 'Untitled Draft',
        content: formData.content,
        status: formData.status,
        comments_enabled: formData.comments_enabled,
        reactions_enabled: formData.reactions_enabled,
        featured_image: formData.featured_image,
        video_url: formData.video_url,
        audio_url: formData.audio_url,
        series: isPartOfSeries ? selectedSeriesId : null,
        series_order: isPartOfSeries ? seriesOrder : undefined,
      };
      
      await forceSave(draftData, formData.content_type || null);
      alert('✅ Draft saved successfully!');
    } catch (err) {
      console.error('Failed to save draft:', err);
      alert('❌ Failed to save draft');
    }
  };

  return (
    <div className="post-form-wrapper-desktop">
      {/* Main Content Area */}
      <div className="post-form-content-desktop">
        {/* Left Column - Main Form */}
        <div className="post-form-main-desktop">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Content */}
            <div className="form-section-desktop">
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquareIcon className="icon" />
                  Content
                </h3>
                
                {/* Save Status Indicator */}
                <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {autoSaveStatus === 'saving' && (
                    <span style={{ color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{
                        animation: 'spin 1s linear infinite',
                        borderRadius: '50%',
                        height: '12px',
                        width: '12px',
                        border: '2px solid transparent',
                        borderTop: '2px solid currentColor'
                      }}></div>
                      Saving...
                    </span>
                  )}
                  
                  {autoSaveStatus === 'saved' && lastSaved && (
                    <span style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg style={{ height: '12px', width: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      All changes saved (just now)
                    </span>
                  )}
                  
                  {autoSaveStatus === 'error' && (
                    <span style={{ color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg style={{ height: '12px', width: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Save failed
                    </span>
                  )}
                </div>
              </div>

              <RichTextEditor
                key={initialDraftId || 'new-content'}
                value={formData.content}
                onChange={handleContentChange}
                placeholder="Write your content here..."
                disabled={loading}
                minHeight={400}
                onImageUpload={handleImageUpload}
              />
            </div>
        </form>
        </div>

        {/* Right Sidebar */}
        <div className="post-form-sidebar-desktop">
          {/* Sidebar Header - Show on tablet/mobile */}
          <div className="post-form-sidebar-header">
            <h3>
              <ChevronDownIcon className="icon" style={{ width: '16px', height: '16px' }} />
              Additional Settings
            </h3>
            <button
              className="post-form-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
              type="button"
            >
              <ChevronDownIcon style={{ width: '18px', height: '18px', transform: sidebarOpen ? 'rotate(0)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
            </button>
          </div>

          {/* Sidebar Content */}
          <div className={`post-form-sidebar-content ${!sidebarOpen ? 'hidden' : ''}`}>
            {/* Basic Information Section */}
            <div className="sidebar-section">
              <h4 className="sidebar-section-title">
                <TypeIcon className="icon" />
                Basic Information
              </h4>

              {error && (
                <div style={{ padding: '12px', background: '#fee2e2', borderRadius: '6px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#991b1b' }}>
                  <AlertCircleIcon size={16} style={{ flexShrink: 0 }} />
                  <span>{error.length > 60 ? error.substring(0, 57) + '...' : error}</span>
                </div>
              )}

              <div className="sidebar-form-group">
                <label htmlFor="title">
                  Post Title <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter a compelling title"
                  disabled={loading}
                  className="form-input-desktop"
                />
              </div>

              <div className="sidebar-form-group">
                <label htmlFor="content_type">
                  Content Type <span className="required">*</span>
                  {isPartOfSeries && (
                    <span className="tooltip-trigger">
                      <span className="tooltip-icon">?</span>
                      <span className="tooltip-content">Automatically set to 'Series' when post is part of a series</span>
                    </span>
                  )}
                </label>
                <select
                  id="content_type"
                  name="content_type"
                  value={formData.content_type}
                  onChange={handleChange}
                  required
                  disabled={loading || loadingTypes || isPartOfSeries}
                  className="form-select-desktop"
                >
                  {loadingTypes && <option value="">Loading types...</option>}
                  {!loadingTypes && contentTypes.length === 0 && <option value="">No types available</option>}
                  {contentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Media & Resources Section */}
            <div className="sidebar-section">
              <h4 className="sidebar-section-title">
                <ImageIcon className="icon" />
                Media & Resources
              </h4>

              <div className="sidebar-form-group">
                <label>Featured Image</label>
                <ImageUploadInput
                  value={formData.featured_image || ''}
                  onChange={(url) => setFormData(prev => ({ ...prev, featured_image: url }))}
                  disabled={loading}
                />
              </div>

              <div className="sidebar-form-group">
                <label htmlFor="video_url">
                  Video URL
                  <span className="tooltip-trigger">
                    <span className="tooltip-icon">?</span>
                    <span className="tooltip-content">YouTube or video link</span>
                  </span>
                </label>
                <input
                  type="url"
                  id="video_url"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleChange}
                  placeholder="https://youtube.com/watch?v=..."
                  disabled={loading}
                  className="form-input-desktop"
                />
              </div>

              <div className="sidebar-form-group">
                <label htmlFor="audio_url">
                  Audio URL
                  <span className="tooltip-trigger">
                    <span className="tooltip-icon">?</span>
                    <span className="tooltip-content">Audio file or podcast link</span>
                  </span>
                </label>
                <input
                  type="url"
                  id="audio_url"
                  name="audio_url"
                  value={formData.audio_url}
                  onChange={handleChange}
                  placeholder="https://example.com/audio.mp3"
                  disabled={loading}
                  className="form-input-desktop"
                />
              </div>
            </div>

            {/* Series Section */}
            <div className="sidebar-section">
              <h4 className="sidebar-section-title">
                <FolderIcon className="icon" />
                Series
              </h4>

              <label className="sidebar-checkbox">
                <input
                  type="checkbox"
                  checked={isPartOfSeries}
                  onChange={(e) => setIsPartOfSeries(e.target.checked)}
                  disabled={loading}
                />
                <div className="sidebar-checkbox-label">
                  <span className="sidebar-checkbox-text">Part of a series</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    Group related posts
                  </span>
                </div>
              </label>

              {isPartOfSeries && (
                <div className="conditional-section show">
                  <div className="sidebar-form-group">
                    <label htmlFor="series">
                      Series
                      <span className="tooltip-trigger">
                        <span className="tooltip-icon">?</span>
                        <span className="tooltip-content">Select which series this post belongs to</span>
                      </span>
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select
                        id="series"
                        value={selectedSeriesId}
                        onChange={(e) => setSelectedSeriesId(e.target.value)}
                        className="form-select-desktop"
                        disabled={loading}
                        style={{ flex: 1 }}
                      >
                        <option value="">Choose series...</option>
                        {availableSeries.map((series) => (
                          <option key={series.id} value={series.id}>
                            {series.title}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowQuickCreateSeries(true)}
                        className="btn-secondary-desktop"
                        disabled={loading}
                        title="Create new series"
                      >
                        <PlusIcon style={{ width: '14px', height: '14px' }} />
                      </button>
                    </div>
                  </div>

                  <div className="sidebar-form-group">
                    <label htmlFor="series_order">
                      Part #
                      <span className="tooltip-trigger">
                        <span className="tooltip-icon">?</span>
                        <span className="tooltip-content">Order in series</span>
                      </span>
                    </label>
                    <input
                      type="number"
                      id="series_order"
                      value={seriesOrder}
                      onChange={(e) => setSeriesOrder(parseInt(e.target.value) || 1)}
                      min="1"
                      disabled={loading}
                      className="form-input-desktop"
                      style={{ maxWidth: '80px' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Engagement Settings */}
            <div className="sidebar-section">
              <h4 className="sidebar-section-title">
                <HeartIcon className="icon" />
                Engagement
              </h4>

              <label className="sidebar-checkbox">
                <input
                  type="checkbox"
                  name="comments_enabled"
                  checked={formData.comments_enabled}
                  onChange={handleChange}
                  disabled={loading}
                />
                <div className="sidebar-checkbox-label">
                  <span className="sidebar-checkbox-text">Allow Comments</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    Users can comment
                  </span>
                </div>
              </label>

              <label className="sidebar-checkbox">
                <input
                  type="checkbox"
                  name="reactions_enabled"
                  checked={formData.reactions_enabled}
                  onChange={handleChange}
                  disabled={loading}
                />
                <div className="sidebar-checkbox-label">
                  <span className="sidebar-checkbox-text">Allow Reactions</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    Users can react
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions - Footer */}
      <div className="form-actions-desktop">
        <button
          type="button"
          className="btn-cancel"
          onClick={onCancel}
          disabled={loading}
        >
          <XIcon size={18} />
          Cancel
        </button>
        
        <button
          type="button"
          className="btn-save"
          onClick={handleManualSaveDraft}
          disabled={loading}
          style={{
            background: '#10b981',
            color: 'white'
          }}
          title="Manually save draft (auto-save also runs automatically)"
        >
          <SaveIcon size={18} />
          Save Draft Now
        </button>
        
        <button
          type="button"
          className="btn-save"
          onClick={handlePublish}
          disabled={loading || !formData.title?.trim()}
          style={{
            background: 'var(--primary-600)',
            color: 'white'
          }}
        >
          <SendIcon size={18} />
          Publish Now
        </button>
        <button
          type="submit"
          className="btn-save"
          disabled={loading || !formData.title?.trim()}
          onClick={handleSubmit}
        >
          {loading ? (
            <>
              <SaveIcon size={18} className="spinning" />
              Creating...
            </>
          ) : (
            <>
              <SaveIcon size={18} />
              Create Post
            </>
          )}
        </button>
      </div>

      {/* Quick Create Series Modal */}
      {showQuickCreateSeries && (
        <QuickCreateSeriesModal
          onClose={() => setShowQuickCreateSeries(false)}
          onCreate={handleQuickCreateSeries}
        />
      )}
    </div>
  );
};

// Quick Create Series Modal Component
interface QuickCreateSeriesModalProps {
  onClose: () => void;
  onCreate: (title: string, visibility: string) => void;
}

const QuickCreateSeriesModal: React.FC<QuickCreateSeriesModalProps> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      alert('Please enter a series title');
      return;
    }
    setLoading(true);
    await onCreate(title, visibility);
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h3>Quick Create Series</h3>
          <button className="btn-icon" onClick={onClose}>
            <XIcon size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group-pro">
            <label htmlFor="quickSeriesTitle" className="form-label-pro">
              Series Title
            </label>
            <input
              type="text"
              id="quickSeriesTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter series title..."
              className="form-input-pro"
              autoFocus
            />
          </div>

          <div className="form-group-pro">
            <label htmlFor="quickSeriesVisibility" className="form-label-pro">
              Visibility
            </label>
            <select
              id="quickSeriesVisibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="form-select-pro"
            >
              <option value="PUBLIC">Public</option>
              <option value="MEMBERS_ONLY">Members Only</option>
              <option value="HIDDEN">Hidden</option>
            </select>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary-pro" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn-primary-pro" onClick={handleCreate} disabled={!title.trim() || loading}>
            <PlusIcon />
            {loading ? 'Creating...' : 'Create Series'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCreate;

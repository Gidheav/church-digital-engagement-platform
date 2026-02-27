import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  PlusCircle,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  Heading,
  ChevronDown,
  Link,
  Image,
  Table,
  SeparatorHorizontal,
  BookOpen
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
// SacredEditor.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import postService from '../services/post.service';
import draftService from '../services/draft.service';
import seriesService from '../services/series.service';
import ImageUploadInput from './components/ImageUploadInput';

interface PostMetadata {
  title: string;
  contentType: string;
  series: string;
  tags: string[];
  featuredImage: string | null;
  videoUrl: string;
  allowComments: boolean;
  allowReactions: boolean;
  featuredOnHomepage: boolean;
}

interface SacredEditorProps {
  mode?: 'create' | 'edit';
  postId?: string;
  draftId?: string;
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Formatting Toolbar Button Component
const ToolbarButton: React.FC<{
  icon: LucideIcon;
  active?: boolean;
  onClick: () => void;
  title: string;
}> = ({ icon: Icon, active, onClick, title }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-2 rounded-lg transition-all ${
      active 
        ? 'bg-primary text-white' 
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
    }`}
  >
    <Icon className="w-5 h-5" />
  </button>
);


// Text Color Picker
const TextColorPicker: React.FC<{
  value: string;
  onChange: (color: string) => void;
}> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const colors = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff',
    '#9900ff', '#ff00ff', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3',
    '#d9d2e9', '#ead1dc', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8',
    '#b4a7d6', '#d5a6bd', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6fa8dc',
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
        title="Text color"
      >
        <div className="w-5 h-5 rounded-full border border-slate-300" style={{ backgroundColor: value }} />
        <ChevronDown className="w-4 h-4" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
          <div className="grid grid-cols-8 gap-1">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => {
                  onChange(color);
                  setIsOpen(false);
                }}
                className="w-6 h-6 rounded-full border border-slate-200 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-8 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Background Color Picker
const BgColorPicker: React.FC<{
  value: string;
  onChange: (color: string) => void;
}> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const colors = [
    '#ffffff', '#f2f2f2', '#d9d9d9', '#bfbfbf', '#8c8c8c', '#737373', '#595959', '#404040',
    '#fff2cc', '#ffe599', '#ffd966', '#f1c232', '#bf9000', '#7f6000', '#3c2f00', '#1a1400',
    '#d9ead3', '#b6d7a8', '#93c47d', '#6aa84f', '#38761d', '#274e13', '#163a0c', '#0b2608',
    '#cfe2f3', '#9fc5e8', '#6fa8dc', '#3d85c6', '#0b5394', '#073763', '#03203a', '#01101f',
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
        title="Background color"
      >
        <div className="w-5 h-5 rounded-full border border-slate-300" style={{ backgroundColor: value }} />
        <ChevronDown className="w-4 h-4" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
          <div className="grid grid-cols-8 gap-1">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => {
                  onChange(color);
                  setIsOpen(false);
                }}
                className="w-6 h-6 rounded-full border border-slate-200 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-8 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Link Insert Modal
const LinkModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string, text: string) => void;
}> = ({ isOpen, onClose, onInsert }) => {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Insert Link</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Link Text (optional)
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Click here"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onInsert(url, text || url);
              onClose();
            }}
            disabled={!url}
            className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Insert Link
          </button>
        </div>
      </div>
    </div>
  );
};

const SacredEditor: React.FC<SacredEditorProps> = ({ 
  mode = 'create',
  postId,
  draftId,
  initialData 
}) => {
  const navigate = useNavigate();
  // const params = useParams();
  
  // Determine mode
  const isCreateMode = mode === 'create' || (!postId && !draftId);
  const isEditMode = mode === 'edit' || !!postId;
  const isDraftMode = !!draftId;

  // State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('<p class="mb-6 opacity-40">Start your sermon or article...</p>');
  const [autoSaveTime, setAutoSaveTime] = useState('just now');
  const [metadata, setMetadata] = useState<PostMetadata>({
    title: '',
    contentType: 'Sermon Note',
    series: '',
    tags: [],
    featuredImage: null,
    videoUrl: '',
    allowComments: true,
    allowReactions: true,
    featuredOnHomepage: false
  });
  const [newTag, setNewTag] = useState('');
  const [isDraft, setIsDraft] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [series, setSeries] = useState<Array<{ id: string; title: string }>>([]);
  const [showScriptureLookup, setShowScriptureLookup] = useState(false);
  const [scriptureQuery, setScriptureQuery] = useState('');
  const [scriptureResults, setScriptureResults] = useState<any[]>([]);
  const [showLinkModal, setShowLinkModal] = useState(false);

  // Rich text formatting state
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSize, setFontSize] = useState(16);
  const [textColor, setTextColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [formats, setFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    h1: false,
    h2: false,
    h3: false,
    alignLeft: true,
    alignCenter: false,
    alignRight: false,
    alignJustify: false,
    bulletList: false,
    numberList: false,
    blockquote: false,
    code: false,
    subscript: false,
    superscript: false,
  });
  const CurrentAlignIcon: LucideIcon = formats.alignLeft 
    ? AlignLeft 
    : formats.alignCenter 
      ? AlignCenter 
      : formats.alignRight 
        ? AlignRight 
        : AlignJustify;

  // Refs
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const titleTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Load series for dropdown
  useEffect(() => {
    const loadSeries = async () => {
      try {
        const data = await seriesService.getAllSeries();
        setSeries(data);
      } catch (err) {
        console.error('Failed to load series:', err);
      }
    };
    loadSeries();
  }, []);

  // Load post/draft data if in edit mode
  useEffect(() => {
    const loadPostData = async () => {
      if (isEditMode && postId) {
        setLoading(true);
        try {
          const post = await postService.getPost(postId);
          setTitle(post.title || '');
          setContent(post.content || '<p class="mb-6 opacity-40">Start your sermon or article...</p>');
          setMetadata({
            title: post.title || '',
            contentType: post.content_type || 'Sermon Note',
            series: post.series || '',
            tags: (post as any).tags || [],
            featuredImage: post.featured_image || null,
            videoUrl: post.video_url || '',
            allowComments: post.comments_enabled ?? true,
            allowReactions: post.reactions_enabled ?? true,
            featuredOnHomepage: (post as any).is_featured || false
          });
          setIsDraft(post.status !== 'PUBLISHED');
        } catch (err) {
          console.error('Failed to load post:', err);
        } finally {
          setLoading(false);
        }
      } else if (isDraftMode && draftId) {
        setLoading(true);
        try {
          const draft = await draftService.getDraft(draftId);
          const draftData = draft.draft_data || {};
          setTitle(draftData.title || '');
          setContent(draftData.content || '<p class="mb-6 opacity-40">Start your sermon or article...</p>');
          setMetadata({
            title: draftData.title || '',
            contentType: draft.content_type || 'Sermon Note',
            series: draftData.series || '',
            tags: (draftData as any).tags || [],
            featuredImage: draftData.featured_image || null,
            videoUrl: draftData.video_url || '',
            allowComments: draftData.comments_enabled ?? true,
            allowReactions: draftData.reactions_enabled ?? true,
            featuredOnHomepage: (draftData as any).is_featured || false
          });
          setIsDraft(true);
        } catch (err) {
          console.error('Failed to load draft:', err);
        } finally {
          setLoading(false);
        }
      } else if (initialData) {
        setTitle(initialData.title || '');
        setContent(initialData.content || '<p class="mb-6 opacity-40">Start your sermon or article...</p>');
        setMetadata(prev => ({
          ...prev,
          ...initialData,
          title: initialData.title || '',
        }));
      }
    };

    loadPostData();
  }, [isEditMode, isDraftMode, postId, draftId, initialData]);

  // Auto-resize title textarea
  useEffect(() => {
    if (titleTextareaRef.current) {
      titleTextareaRef.current.style.height = 'auto';
      titleTextareaRef.current.style.height = `${titleTextareaRef.current.scrollHeight}px`;
    }
  }, [title]);

  // Auto-save draft
  useEffect(() => {
    if (!isCreateMode && !isEditMode && !isDraftMode) return;

    const autoSaveTimer = setTimeout(() => {
      handleAutoSave();
    }, 30000);

    return () => clearTimeout(autoSaveTimer);
  }, [title, content, metadata]);

  const handleAutoSave = async () => {
    if (!title.trim() && !content.trim()) return;

    setSaving(true);
    try {
      const draftData = {
        title,
        content,
        content_type: metadata.contentType,
        series: metadata.series,
        tags: metadata.tags,
        featured_image: metadata.featuredImage === null ? undefined : metadata.featuredImage,
        video_url: metadata.videoUrl,
        comments_enabled: metadata.allowComments,
        reactions_enabled: metadata.allowReactions,
        is_featured: metadata.featuredOnHomepage,
      };

      if (isDraftMode && draftId) {
        await draftService.updateDraft(draftId, { draft_data: draftData });
      } else {
        await draftService.createDraft({
          draft_data: draftData,
          content_type: metadata.contentType,
          post: isEditMode && postId ? postId : undefined,
        });
      }
      setAutoSaveTime('just now');
    } catch (err) {
      console.error('Auto-save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = () => {
    if (contentEditableRef.current) {
      setContent(contentEditableRef.current.innerHTML);
    }
  };

  // Rich text formatting functions
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleContentChange();
  };

  const handleFormat = (format: keyof typeof formats) => {
    switch (format) {
      case 'bold':
        execCommand('bold');
        setFormats(prev => ({ ...prev, bold: !prev.bold }));
        break;
      case 'italic':
        execCommand('italic');
        setFormats(prev => ({ ...prev, italic: !prev.italic }));
        break;
      case 'underline':
        execCommand('underline');
        setFormats(prev => ({ ...prev, underline: !prev.underline }));
        break;
      case 'strikethrough':
        execCommand('strikeThrough');
        setFormats(prev => ({ ...prev, strikethrough: !prev.strikethrough }));
        break;
      case 'h1':
        execCommand('formatBlock', '<h1>');
        setFormats(prev => ({ ...prev, h1: !prev.h1, h2: false, h3: false }));
        break;
      case 'h2':
        execCommand('formatBlock', '<h2>');
        setFormats(prev => ({ ...prev, h2: !prev.h2, h1: false, h3: false }));
        break;
      case 'h3':
        execCommand('formatBlock', '<h3>');
        setFormats(prev => ({ ...prev, h3: !prev.h3, h1: false, h2: false }));
        break;
      case 'alignLeft':
        execCommand('justifyLeft');
        setFormats(prev => ({ ...prev, alignLeft: true, alignCenter: false, alignRight: false, alignJustify: false }));
        break;
      case 'alignCenter':
        execCommand('justifyCenter');
        setFormats(prev => ({ ...prev, alignLeft: false, alignCenter: true, alignRight: false, alignJustify: false }));
        break;
      case 'alignRight':
        execCommand('justifyRight');
        setFormats(prev => ({ ...prev, alignLeft: false, alignCenter: false, alignRight: true, alignJustify: false }));
        break;
      case 'alignJustify':
        execCommand('justifyFull');
        setFormats(prev => ({ ...prev, alignLeft: false, alignCenter: false, alignRight: false, alignJustify: true }));
        break;
      case 'bulletList':
        execCommand('insertUnorderedList');
        setFormats(prev => ({ ...prev, bulletList: !prev.bulletList }));
        break;
      case 'numberList':
        execCommand('insertOrderedList');
        setFormats(prev => ({ ...prev, numberList: !prev.numberList }));
        break;
      case 'blockquote':
        execCommand('formatBlock', '<blockquote>');
        setFormats(prev => ({ ...prev, blockquote: !prev.blockquote }));
        break;
      case 'code':
        execCommand('formatBlock', '<pre>');
        setFormats(prev => ({ ...prev, code: !prev.code }));
        break;
      case 'subscript':
        execCommand('subscript');
        setFormats(prev => ({ ...prev, subscript: !prev.subscript }));
        break;
      case 'superscript':
        execCommand('superscript');
        setFormats(prev => ({ ...prev, superscript: !prev.superscript }));
        break;
    }
  };

  const handleFontFamilyChange = (font: string) => {
    setFontFamily(font);
    execCommand('fontName', font);
  };

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    execCommand('fontSize', size.toString());
  };

  const handleTextColorChange = (color: string) => {
    setTextColor(color);
    execCommand('foreColor', color);
  };

  const handleBgColorChange = (color: string) => {
    setBgColor(color);
    execCommand('hiliteColor', color);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!metadata.tags.includes(newTag.trim())) {
        setMetadata({
          ...metadata,
          tags: [...metadata.tags, newTag.trim()]
        });
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setMetadata({
      ...metadata,
      tags: metadata.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const toggleSwitch = (field: keyof Pick<PostMetadata, 'allowComments' | 'allowReactions' | 'featuredOnHomepage'>) => {
    setMetadata({
      ...metadata,
      [field]: !metadata[field]
    });
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      alert('Please enter a title before publishing.');
      return;
    }

    setSaving(true);
    try {
      const postData = {
        title,
        content,
        content_type: metadata.contentType,
        series: metadata.series,
        tags: metadata.tags,
        featured_image: metadata.featuredImage === null ? undefined : metadata.featuredImage,
        video_url: metadata.videoUrl,
        comments_enabled: metadata.allowComments,
        reactions_enabled: metadata.allowReactions,
        is_featured: metadata.featuredOnHomepage,
        status: 'PUBLISHED' as 'PUBLISHED',
      };

      if (isEditMode && postId) {
        await postService.updatePost(postId, postData);
        if (draftId) {
          await draftService.deleteDraft(draftId);
        }
      } else if (isDraftMode && draftId) {
        await draftService.publishDraft(draftId);
      } else {
        await postService.createPost(postData);
      }
      
      navigate('/admin/content');
    } catch (err) {
      console.error('Publish failed:', err);
      alert('Failed to publish. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    await handleAutoSave();
  };

  const handlePreview = () => {
    const previewData = {
      title,
      content,
      metadata,
    };
    localStorage.setItem('preview_data', JSON.stringify(previewData));
    window.open('/preview', '_blank');
  };

  const handleScriptureLookup = async () => {
    if (!scriptureQuery.trim()) return;
    
    setShowScriptureLookup(true);
    setScriptureResults([
      { reference: 'Psalm 23:1-3', text: 'The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul.' },
      { reference: 'Isaiah 40:31', text: 'But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.' },
      { reference: 'Philippians 4:6-7', text: 'Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus.' },
      { reference: 'Romans 8:28', text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
      { reference: 'Jeremiah 29:11', text: 'For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.' },
    ]);
  };

  const insertScripture = (reference: string, text: string) => {
    const scriptureBlock = `
      <div class="my-10 border-l-4 border-primary/40 pl-8 py-2 bg-primary/5 rounded-r-lg relative group">
        <span class="material-symbols-outlined absolute -left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 text-primary text-sm shadow-sm">menu_book</span>
        <p class="italic text-2xl text-slate-700 font-serif leading-relaxed">"${text}"</p>
        <cite class="block mt-3 font-display not-italic font-bold text-sm text-primary uppercase tracking-wider">${reference}</cite>
      </div>
    `;

    if (contentEditableRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const div = document.createElement('div');
        div.innerHTML = scriptureBlock;
        const fragment = document.createDocumentFragment();
        while (div.firstChild) {
          fragment.appendChild(div.firstChild);
        }
        range.insertNode(fragment);
      } else {
        contentEditableRef.current.innerHTML += scriptureBlock;
      }
      handleContentChange();
    }
    setShowScriptureLookup(false);
    setScriptureQuery('');
  };

  const handleInsertLink = (url: string, text: string) => {
    if (!url) return;
    
    if (contentEditableRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
        // If text is selected, wrap it in a link
        execCommand('createLink', url);
      } else {
        // If no text selected, insert a new link with the provided text
        const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary underline">${text || url}</a>`;
        execCommand('insertHTML', linkHtml);
      }
      handleContentChange();
    }
  };

  const handleMoveToTrash = async () => {
    if (!window.confirm('Move this post to trash? It can be restored later.')) return;
    
    try {
      if (isEditMode && postId) {
        await postService.deletePost(postId);
      } else if (isDraftMode && draftId) {
        await draftService.deleteDraft(draftId);
      }
      navigate('/admin/content');
    } catch (err) {
      console.error('Failed to move to trash:', err);
      alert('Failed to move to trash. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
          <p className="text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased overflow-hidden h-screen flex flex-col">
      {/* Header / Navigation Bar */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 z-30 shrink-0" style={{ fontFamily: 'Times New Roman, Times, serif' }}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-3xl">auto_stories</span>
            <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">Sacred Editor</h2>
          </div>
          <nav className="hidden md:flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm font-medium">
            <button onClick={() => navigate('/admin/content')} className="hover:text-primary transition-colors px-2">
              Content
            </button>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-slate-900 dark:text-white">
              {isCreateMode ? 'New Post' : isEditMode ? 'Edit Post' : 'Edit Draft'}
            </span>
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePreview}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-xl">visibility</span>
            Preview
          </button>
          <button 
            onClick={handleSaveDraft}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                Saving...
              </>
            ) : (
              'Save as Draft'
            )}
          </button>
          <div className="h-8 w-[1px] bg-slate-200 dark:border-slate-700 mx-2"></div>
          <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
            <img 
              alt="User Profile" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXL7WBL-u4dR6h6BciTvdrauYfLmiLMlfCfkX6FGolltXhn7ZQ9iLizTazM_R1w1OOauD-SUDYeIt2w1xM1d2Zfy5z8rUiBbRXURoXm_Ph1fynNlwVBsO9iSSnx851XSUWDRBOw8JyXNXX5-xYuS8eRtOl8C33VDWtGxvLz0DjbFxwllTZbhSJJSyHReBC2GSREMijeS353R2uw1bQFnpiJr0kNcAPv68fQ3G-V4T2ClCXx5t7RWjCPDm8jAJnG4h8_hLkXd6YxbQ"
            />
          </div>
        </div>
      </header>

      {/* Main Content Area: Split Pane */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Pane: Writing Canvas (75%) */}
        <section className="writing-canvas flex-1 overflow-y-auto relative flex justify-center py-8 px-6">
          <div className="max-w-[800px] w-full relative">
            {/* Auto-save indicator */}
            <div className="absolute top-0 right-0 flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-medium uppercase tracking-widest z-10">
              <span className="material-symbols-outlined text-xs">
                {saving ? 'sync' : 'sync_saved_locally'}
              </span>
              {saving ? 'Saving...' : `Auto-saved ${autoSaveTime}`}
            </div>

            {/* Post Title */}
            <textarea
              ref={titleTextareaRef}
              value={title}
              onChange={handleTitleChange}
              className="fraunces-title w-full bg-transparent border-none focus:ring-0 text-5xl font-bold text-slate-900 dark:text-slate-800 placeholder-slate-300 resize-none leading-tight mb-8 mt-8"
              placeholder="Enter a soulful title..."
              rows={1}
            />

            {/* Rich Text Toolbar */}
            {/* Rich Text Toolbar - Redesigned */}
            {/* Rich Text Toolbar - Compact Single Row */}
            <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl mb-6 p-1.5 shadow-sm flex flex-wrap items-center justify-between gap-1">
              {/* Left side - Core formatting */}
              <div className="flex items-center gap-1">
                {/* Font controls grouped in dropdown */}
                <div className="flex items-center gap-1 mr-1">
                  <select
                    value={fontFamily}
                    onChange={(e) => handleFontFamilyChange(e.target.value)}
                    className="text-sm bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                    title="Font Family"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Fraunces">Fraunces</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                  </select>
                  
                  <select
                    value={fontSize}
                    onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                    className="text-sm bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 w-16 focus:outline-none focus:ring-1 focus:ring-primary"
                    title="Font Size"
                  >
                    {[12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map(size => (
                      <option key={size} value={size}>{size}px</option>
                    ))}
                  </select>
                </div>

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

                {/* Text formatting buttons */}
                <ToolbarButton icon={Bold} active={formats.bold} onClick={() => handleFormat('bold')} title="Bold (Ctrl+B)" />
                <ToolbarButton icon={Italic} active={formats.italic} onClick={() => handleFormat('italic')} title="Italic (Ctrl+I)" />
                <ToolbarButton icon={Underline} active={formats.underline} onClick={() => handleFormat('underline')} title="Underline (Ctrl+U)" />
                <ToolbarButton icon={Strikethrough} active={formats.strikethrough} onClick={() => handleFormat('strikethrough')} title="Strikethrough" />

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

                {/* Color pickers as dropdowns */}
                <TextColorPicker value={textColor} onChange={handleTextColorChange} />
                <BgColorPicker value={bgColor} onChange={handleBgColorChange} />

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

                {/* Headings dropdown */}
                <div className="relative group">
                  <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1" title="Headings">
                    <Heading className="w-5 h-5" />
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="absolute top-full left-0 mt-1 hidden group-hover:block hover:block bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 min-w-[120px] z-50">
                    <button onClick={() => handleFormat('h1')} className="w-full text-left px-4 py-2 text-lg font-bold hover:bg-slate-100 dark:hover:bg-slate-700">H1</button>
                    <button onClick={() => handleFormat('h2')} className="w-full text-left px-4 py-2 text-base font-bold hover:bg-slate-100 dark:hover:bg-slate-700">H2</button>
                    <button onClick={() => handleFormat('h3')} className="w-full text-left px-4 py-2 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700">H3</button>
                  </div>
                </div>

                {/* Alignment dropdown */}
                <div className="relative group">
                  <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1" title="Alignment">
                    <CurrentAlignIcon className="w-5 h-5" />
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="absolute top-full left-0 mt-1 hidden group-hover:block hover:block bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-1 z-50">
                    <button onClick={() => handleFormat('alignLeft')} className={`p-2 rounded ${formats.alignLeft ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`} title="Align Left">
                      <AlignLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleFormat('alignCenter')} className={`p-2 rounded ${formats.alignCenter ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`} title="Align Center">
                      <AlignCenter className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleFormat('alignRight')} className={`p-2 rounded ${formats.alignRight ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`} title="Align Right">
                      <AlignRight className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleFormat('alignJustify')} className={`p-2 rounded ${formats.alignJustify ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`} title="Justify">
                      <AlignJustify className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Lists */}
                <ToolbarButton icon={List} active={formats.bulletList} onClick={() => handleFormat('bulletList')} title="Bullet List" />
                <ToolbarButton icon={ListOrdered} active={formats.numberList} onClick={() => handleFormat('numberList')} title="Numbered List" />
              </div>

              {/* Right side - Insert & utilities */}
              <div className="flex items-center gap-1">
                <ToolbarButton icon={Quote} active={formats.blockquote} onClick={() => handleFormat('blockquote')} title="Blockquote" />
                <ToolbarButton icon={Code} active={formats.code} onClick={() => handleFormat('code')} title="Code Block" />
                
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

                {/* Insert dropdown */}
                <div className="relative group">
                  <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1" title="Insert">
                    <PlusCircle className="w-5 h-5" />
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="absolute top-full right-0 mt-1 hidden group-hover:block hover:block bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-1 min-w-[160px] z-50">
                    <button onClick={() => setShowLinkModal(true)} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded flex items-center gap-2">
                      <Link className="w-4 h-4" /> Link
                    </button>
                    <button onClick={() => document.getElementById('image-upload')?.click()} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded flex items-center gap-2">
                      <Image className="w-4 h-4" /> Image
                    </button>
                    <button onClick={() => execCommand('insertHTML', '<table border="1" cellpadding="5" style="border-collapse: collapse;"><tr><td>Cell 1</td><td>Cell 2</td></tr><tr><td>Cell 3</td><td>Cell 4</td></tr></table>')} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded flex items-center gap-2">
                      <Table className="w-4 h-4" /> Table
                    </button>
                    <button onClick={() => execCommand('insertHorizontalRule')} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded flex items-center gap-2">
                      <SeparatorHorizontal className="w-4 h-4" /> Horizontal Rule
                    </button>
                  </div>
                </div>

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

                <ToolbarButton icon={Undo} onClick={() => { document.execCommand('undo'); handleContentChange(); }} title="Undo (Ctrl+Z)" />
                <ToolbarButton icon={Redo} onClick={() => { document.execCommand('redo'); handleContentChange(); }} title="Redo (Ctrl+Y)" />

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

                <ToolbarButton icon={BookOpen} onClick={() => setShowScriptureLookup(true)} title="Scripture Lookup" />
              </div>

              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      execCommand('insertImage', reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>

            {/* Rich Text Editor Zone */}
            <div className="prose prose-slate prose-lg max-w-none text-slate-800 dark:text-slate-700">
              <div
                ref={contentEditableRef}
                className="rich-editor min-h-[400px] text-xl leading-relaxed font-serif"
                contentEditable
                dir="ltr"
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{ __html: content }}
                onInput={handleContentChange}
                onBlur={handleContentChange}
                style={{
                  fontFamily: fontFamily === 'Inter' ? 'Inter, sans-serif' : 
                             fontFamily === 'Fraunces' ? 'Fraunces, serif' : 
                             fontFamily,
                  fontSize: `${fontSize}px`,
                  color: textColor,
                  backgroundColor: bgColor,
                  direction: 'ltr',
                  unicodeBidi: 'normal',
                  textAlign: 'left',
                }}
              />
            </div>

            {/* Inline Scripture Lookup Trigger */}
            <div className="mt-8 flex justify-center">
              <button 
                onClick={() => setShowScriptureLookup(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-primary hover:text-white text-primary border border-primary/20 rounded-full shadow-sm transition-all font-medium text-sm"
              >
                <PlusCircle className="w-5 h-5" />
                Scripture Lookup
              </button>
            </div>
          </div>
        </section>

        {/* Right Pane: Sidebar Properties (25%) */}
        <aside className="sidebar-panel w-80 sidebar-scroll overflow-y-auto shrink-0 z-20 flex flex-col p-6 gap-8">
          {/* Section 1: Publishing Status */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Publishing</h3>
              <span className={`px-2 py-0.5 ${isDraft ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'} text-[10px] font-bold rounded uppercase`}>
                {isDraft ? 'Draft' : 'Published'}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handlePublish}
                disabled={saving}
                className="w-full bg-primary-dark hover:bg-primary-dark/90 text-white font-bold py-3 rounded-lg shadow-lg shadow-primary-dark/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-lg">rocket_launch</span>
                Publish Now
              </button>
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span>Schedule for later</span>
              </div>
            </div>
          </section>

          {/* Section 2: Content Details */}
          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Post Metadata</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Content Type</label>
                <div className="relative">
                  <select 
                    value={metadata.contentType}
                    onChange={(e) => setMetadata({...metadata, contentType: e.target.value})}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary text-slate-700"
                  >
                    <option>Sermon Note</option>
                    <option>Article / Essay</option>
                    <option>Devotional</option>
                    <option>Announcement</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-600">Series</label>
                  <button className="text-[10px] font-bold text-primary flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-xs">add</span> NEW
                  </button>
                </div>
                <div className="relative">
                  <select 
                    value={metadata.series}
                    onChange={(e) => setMetadata({...metadata, series: e.target.value})}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary text-slate-700"
                  >
                    <option value="">None</option>
                    {series.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Tags</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {metadata.tags.map((tag) => (
                    <span key={tag} className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                      {tag} 
                      <span 
                        className="material-symbols-outlined text-[10px] cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      >close</span>
                    </span>
                  ))}
                </div>
                <input 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary" 
                  placeholder="Add tag and press Enter..." 
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleAddTag}
                />
              </div>
            </div>
          </section>

          {/* Section 3: Media */}
          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Media Assets</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Featured Image</label>
                <ImageUploadInput
                  value={metadata.featuredImage || ''}
                  onChange={(url) => setMetadata({...metadata, featuredImage: url})}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Video Link</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-lg">play_circle</span>
                  <input 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-primary focus:border-primary" 
                    placeholder="YouTube or Vimeo URL" 
                    type="text"
                    value={metadata.videoUrl}
                    onChange={(e) => setMetadata({...metadata, videoUrl: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Engagement */}
          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Engagement</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">Allow Comments</span>
                <button 
                  onClick={() => toggleSwitch('allowComments')}
                  className={`w-10 h-5 rounded-full relative transition-colors ${
                    metadata.allowComments ? 'bg-primary' : 'bg-slate-200'
                  }`}
                >
                  <span className={`absolute top-0.5 size-4 bg-white rounded-full shadow-sm transition-all ${
                    metadata.allowComments ? 'right-0.5' : 'left-0.5'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">Emoji Reactions</span>
                <button 
                  onClick={() => toggleSwitch('allowReactions')}
                  className={`w-10 h-5 rounded-full relative transition-colors ${
                    metadata.allowReactions ? 'bg-primary' : 'bg-slate-200'
                  }`}
                >
                  <span className={`absolute top-0.5 size-4 bg-white rounded-full shadow-sm transition-all ${
                    metadata.allowReactions ? 'right-0.5' : 'left-0.5'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">Feature on Homepage</span>
                <button 
                  onClick={() => toggleSwitch('featuredOnHomepage')}
                  className={`w-10 h-5 rounded-full relative transition-colors ${
                    metadata.featuredOnHomepage ? 'bg-primary' : 'bg-slate-200'
                  }`}
                >
                  <span className={`absolute top-0.5 size-4 bg-white rounded-full shadow-sm transition-all ${
                    metadata.featuredOnHomepage ? 'right-0.5' : 'left-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </section>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <button 
              onClick={handleMoveToTrash}
              className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 py-2 rounded-lg text-xs font-bold transition-all"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
              Move to Trash
            </button>
          </div>
        </aside>
      </main>

      {/* Scripture Lookup Modal */}
      {showScriptureLookup && (
        <div 
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowScriptureLookup(false); }}
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-xl shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-xl">menu_book</span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Scripture Lookup</h2>
              </div>
              <button
                onClick={() => setShowScriptureLookup(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <span className="material-symbols-outlined text-lg">search</span>
                </span>
                <input
                  className="w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Search by reference or keyword (e.g., Psalm 23, love, grace)"
                  value={scriptureQuery}
                  onChange={e => setScriptureQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleScriptureLookup()}
                  autoFocus
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {scriptureResults.length > 0 ? (
                <div className="space-y-4">
                  {scriptureResults.map((result, index) => (
                    <div 
                      key={index}
                      className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary hover:bg-primary/5 cursor-pointer transition-all"
                      onClick={() => insertScripture(result.reference, result.text)}
                    >
                      <p className="text-sm font-bold text-primary">{result.reference}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{result.text}</p>
                      <button className="mt-2 text-xs text-primary font-semibold">Insert</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <span className="material-symbols-outlined text-4xl text-slate-200 dark:text-slate-700">menu_book</span>
                  <p className="mt-2 text-sm font-medium">Enter a reference to search</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Link Insert Modal */}
      <LinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onInsert={handleInsertLink}
      />

      <style>{`
        .writing-canvas {
          background-color: #F7F4F0;
        }
        .sidebar-panel {
          background-color: #FFFFFF;
          border-left: 1px solid #E5E7EB;
        }
        .rich-editor:focus {
          outline: none;
        }
        .fraunces-title {
          font-family: 'Fraunces', serif;
        }
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .dark .sidebar-scroll::-webkit-scrollbar-thumb {
          background: #334155;
        }
      `}</style>
    </div>
  );
};

export default SacredEditor;

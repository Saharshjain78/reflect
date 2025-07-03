import React, { useState, useRef, useCallback, useEffect } from 'react';
import Card, { CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  Image, 
  Film, 
  Plus, 
  RotateCw, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Trash2,
  Save,
  Download,
  Palette,
  Square,
  Circle,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface ScrapbookItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  position: { x: number; y: number };
  rotation: number;
  scale: number;
  zIndex: number;
  frameStyle: 'none' | 'square' | 'rounded' | 'circle' | 'vintage' | 'polaroid';
  borderColor: string;
  originalSize: boolean;
  originalDimensions?: { width: number; height: number };
}

// Mobile swipe tips component for touch gesture instructions
const MobileSwipeTips: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-blue-50 dark:bg-blue-900/50 backdrop-blur-sm border border-blue-200 dark:border-blue-700 rounded-lg p-3 shadow-sm xs:hidden">
      <div className="flex items-start gap-2">
        <div className="text-blue-600 dark:text-blue-400 text-sm">
          📱 <span className="font-medium">Touch gestures:</span> Swipe left/right to rotate, up/down to resize
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-blue-400 hover:text-blue-600 ml-auto"
        >
          ×
        </button>
      </div>
    </div>
  );
};

const ScrapbookPage: React.FC = () => {  const [scrapbookItems, setScrapbookItems] = useState<ScrapbookItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);  const [scrapbookOrientation, setScrapbookOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [scrapbookAspectRatio, setScrapbookAspectRatio] = useState<'16:9' | '4:3' | '1:1' | '9:16' | '3:4'>('16:9');
  const [scrapbookProportion, setScrapbookProportion] = useState(0.8);
  const [isSaving, setIsSaving] = useState(false);
  const [scrapbookTitle, setScrapbookTitle] = useState('My Scrapbook');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [scrapbookBackground, setScrapbookBackground] = useState('#f9fafb');
  const [useOriginalRatio, setUseOriginalRatio] = useState(false);
  
  // Touch gesture state
  const [touchStartPos, setTouchStartPos] = useState<{ x: number, y: number } | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrapbookRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Touch gesture handlers
  const handleTouchStart = useCallback((e: React.TouchEvent, itemId: string) => {
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setActiveItemId(itemId);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartPos || !activeItemId) return;
    
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartPos.x;
    const dy = touch.clientY - touchStartPos.y;
    
    // Only apply gestures for significant movement
    if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
      const rotationChange = dx * 0.2; // Horizontal swipe for rotation
      const scaleChange = dy * -0.001; // Vertical swipe for scale (negative for intuitive direction)
      
      setScrapbookItems(items =>
        items.map(item =>
          item.id === activeItemId
            ? { 
                ...item, 
                rotation: item.rotation + rotationChange,
                scale: Math.max(0.1, Math.min(3, item.scale + scaleChange))
              }
            : item
        )
      );
    }
  }, [touchStartPos, activeItemId]);
  const handleTouchEnd = useCallback(() => {
    setTouchStartPos(null);
    setActiveItemId(null);
  }, []);
  // Save functionality
  const handleSaveScrapbook = useCallback(async () => {
    try {
      setIsSaving(true);      const scrapbookData = {
        title: scrapbookTitle,
        items: scrapbookItems,
        orientation: scrapbookOrientation,
        aspectRatio: scrapbookAspectRatio,
        proportion: scrapbookProportion,
        background: scrapbookBackground,
        useOriginalRatio: useOriginalRatio,
        savedAt: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem('scrapbook_data', JSON.stringify(scrapbookData));
      setLastSaved(new Date());
      
      // Optional: If you have a backend API, you can save there too
      // await fetch('/api/scrapbook', { method: 'POST', body: JSON.stringify(scrapbookData) });
      
      console.log('Scrapbook saved successfully');
    } catch (error) {
      console.error('Error saving scrapbook:', error);
    } finally {
      setIsSaving(false);
    }
  }, [scrapbookTitle, scrapbookItems, scrapbookOrientation, scrapbookAspectRatio, scrapbookProportion, scrapbookBackground, useOriginalRatio]);  const handleDownloadScrapbook = useCallback(async () => {
    if (!scrapbookRef.current || !canvasRef.current) return;
    
    try {
      setIsSaving(true);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
        // Define proper aspect ratios
      const aspectRatios = {
        '16:9': { width: 16, height: 9 },
        '4:3': { width: 4, height: 3 },
        '1:1': { width: 1, height: 1 },
        '9:16': { width: 9, height: 16 },
        '3:4': { width: 3, height: 4 }
      };
      
      const ratio = aspectRatios[scrapbookAspectRatio];
      const baseSize = 1080; // High quality base size
      
      // Calculate canvas dimensions maintaining aspect ratio
      let canvasWidth, canvasHeight;
      if (ratio.width >= ratio.height) {
        // Landscape or square
        canvasWidth = baseSize * (ratio.width / Math.max(ratio.width, ratio.height));
        canvasHeight = baseSize * (ratio.height / Math.max(ratio.width, ratio.height));
      } else {
        // Portrait
        canvasWidth = baseSize * (ratio.width / Math.max(ratio.width, ratio.height));
        canvasHeight = baseSize * (ratio.height / Math.max(ratio.width, ratio.height));
      }
      
      // Set high-resolution canvas
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      // Get current scrapbook dimensions for scaling
      const scrapbookEl = scrapbookRef.current;
      const rect = scrapbookEl.getBoundingClientRect();
      const scaleX = canvasWidth / rect.width;
      const scaleY = canvasHeight / rect.height;
      
      // Fill background
      ctx.fillStyle = scrapbookBackground;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // Draw each item with proper scaling
      for (const item of scrapbookItems) {
        try {
          if (item.type === 'image') {            await new Promise<void>((resolve) => {
              const img = document.createElement('img');
              img.crossOrigin = 'anonymous';
              
              img.onload = () => {
                try {
                  ctx.save();
                  
                  // Get the actual rendered dimensions from the DOM element
                  const renderedElement = document.querySelector(`img[src="${item.url}"]`) as HTMLImageElement;
                  let displayWidth = 100;
                  let displayHeight = 100;
                  
                  if (renderedElement) {
                    const computedStyle = window.getComputedStyle(renderedElement);
                    displayWidth = parseFloat(computedStyle.width) || 100;
                    displayHeight = parseFloat(computedStyle.height) || 100;
                  } else if (item.originalSize && item.originalDimensions) {
                    // Fallback to calculated dimensions
                    const maxSize = 250;
                    const aspectRatio = item.originalDimensions.width / item.originalDimensions.height;
                    
                    if (aspectRatio > 1) {
                      displayWidth = Math.min(item.originalDimensions.width, maxSize);
                      displayHeight = displayWidth / aspectRatio;
                    } else {
                      displayHeight = Math.min(item.originalDimensions.height, maxSize);
                      displayWidth = displayHeight * aspectRatio;
                    }
                  }
                  
                  // Scale dimensions for high-res canvas
                  const scaledWidth = displayWidth * scaleX;
                  const scaledHeight = displayHeight * scaleY;
                  
                  // Apply transformations with proper scaling
                  ctx.translate(
                    (item.position.x + displayWidth/2) * scaleX,
                    (item.position.y + displayHeight/2) * scaleY
                  );
                  ctx.rotate((item.rotation * Math.PI) / 180);
                  ctx.scale(item.scale, item.scale);
                  
                  // Draw image maintaining aspect ratio
                  ctx.drawImage(img, -scaledWidth/2, -scaledHeight/2, scaledWidth, scaledHeight);
                  
                  ctx.restore();
                  resolve();
                } catch (drawError) {
                  console.error('Error drawing image:', drawError);
                  resolve();
                }
              };
              
              img.onerror = () => {
                console.error('Failed to load image for download');
                resolve();
              };
              
              img.src = item.url;
            });
          } else if (item.type === 'video') {
            // For videos, draw a placeholder maintaining aspect ratio
            ctx.save();
            
            // Get video dimensions
            let displayWidth = 100;
            let displayHeight = 100;
            
            if (item.originalSize && item.originalDimensions) {
              const maxSize = 250;
              const aspectRatio = item.originalDimensions.width / item.originalDimensions.height;
              
              if (aspectRatio > 1) {
                displayWidth = Math.min(item.originalDimensions.width, maxSize);
                displayHeight = displayWidth / aspectRatio;
              } else {
                displayHeight = Math.min(item.originalDimensions.height, maxSize);
                displayWidth = displayHeight * aspectRatio;
              }
            }
            
            const scaledWidth = displayWidth * scaleX;
            const scaledHeight = displayHeight * scaleY;
            
            ctx.translate(
              (item.position.x + displayWidth/2) * scaleX,
              (item.position.y + displayHeight/2) * scaleY
            );
            ctx.rotate((item.rotation * Math.PI) / 180);
            ctx.scale(item.scale, item.scale);
            
            // Draw video placeholder
            ctx.fillStyle = '#374151';
            ctx.fillRect(-scaledWidth/2, -scaledHeight/2, scaledWidth, scaledHeight);
            
            // Draw play icon (scale with video size)
            const iconSize = Math.min(scaledWidth, scaledHeight) * 0.3;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(-iconSize/2, -iconSize/3);
            ctx.lineTo(iconSize/2, 0);
            ctx.lineTo(-iconSize/2, iconSize/3);
            ctx.closePath();
            ctx.fill();
            
            // Add "VIDEO" text
            ctx.fillStyle = '#ffffff';
            ctx.font = `${Math.max(12, scaledHeight * 0.08)}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('VIDEO', 0, scaledHeight/3);
            
            ctx.restore();
          } else if (item.type === 'audio') {
            // For audio, draw a placeholder
            ctx.save();
            
            const displaySize = 100;
            const scaledSize = displaySize * Math.min(scaleX, scaleY);
            
            ctx.translate(
              (item.position.x + displaySize/2) * scaleX,
              (item.position.y + displaySize/2) * scaleY
            );
            ctx.rotate((item.rotation * Math.PI) / 180);
            ctx.scale(item.scale, item.scale);
            
            // Draw audio placeholder
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(-scaledSize/2, -scaledSize/2, scaledSize, scaledSize);
            
            // Draw audio waves
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = Math.max(2, scaledSize * 0.03);
            const waveSpacing = scaledSize * 0.1;
            for (let i = -scaledSize/3; i <= scaledSize/3; i += waveSpacing) {
              ctx.beginPath();
              ctx.moveTo(i, -scaledSize/3);
              ctx.lineTo(i, scaledSize/3);
              ctx.stroke();
            }
            
            // Add "AUDIO" text
            ctx.fillStyle = '#ffffff';
            ctx.font = `${Math.max(12, scaledSize * 0.12)}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('AUDIO', 0, scaledSize/3);
            
            ctx.restore();
          }
        } catch (itemError) {
          console.error(`Error processing ${item.type} item:`, itemError);
        }
      }
        // Download the canvas as image
      const link = document.createElement('a');
      const aspectRatioLabel = scrapbookAspectRatio.replace(':', 'x');
      link.download = `${scrapbookTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${aspectRatioLabel}.png`;
      link.href = canvas.toDataURL('image/png', 0.95);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`Scrapbook downloaded successfully (${aspectRatioLabel})`);
      
    } catch (error) {
      console.error('Error downloading scrapbook:', error);
      alert('Failed to download scrapbook. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [scrapbookItems, scrapbookTitle, scrapbookBackground, scrapbookAspectRatio]);

  // Load saved scrapbook on mount
  useEffect(() => {
    const savedData = localStorage.getItem('scrapbook_data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);        setScrapbookTitle(data.title || 'My Scrapbook');        setScrapbookItems(data.items || []);
        setScrapbookOrientation(data.orientation || 'landscape');
        setScrapbookAspectRatio(data.aspectRatio || '16:9');
        setScrapbookProportion(data.proportion || 0.8);
        setScrapbookBackground(data.background || '#f9fafb');
        setUseOriginalRatio(data.useOriginalRatio || false);
        setLastSaved(new Date(data.savedAt));
        console.log('Loaded saved scrapbook data');
      } catch (error) {
        console.error('Error loading saved scrapbook:', error);
      }
    }
  }, []);

  // Auto-save every 30 seconds when there are changes
  useEffect(() => {
    if (scrapbookItems.length > 0) {
      const autoSaveTimer = setTimeout(() => {
        handleSaveScrapbook();
      }, 30000);
      
      return () => clearTimeout(autoSaveTimer);
    }
  }, [scrapbookItems, scrapbookTitle, handleSaveScrapbook]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleFileUpload called', event.target.files);
    const files = event.target.files;
    if (!files) return;

    setIsSaving(true);
    console.log('Processing', files.length, 'files');
      for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      console.log('Created URL for file:', file.name, url);
        // Get original dimensions for images and videos
      let originalDimensions: { width: number; height: number } | undefined;
      if (file.type.startsWith('image/')) {
        try {
          originalDimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
            const img = document.createElement('img');
            img.onload = () => {
              console.log(`Image dimensions: ${img.naturalWidth}x${img.naturalHeight}`);
              resolve({ width: img.naturalWidth, height: img.naturalHeight });
            };
            img.onerror = reject;
            img.src = url;
          });
        } catch (error) {
          console.error('Error loading image dimensions:', error);
          // Fallback dimensions for images when detection fails
          if (useOriginalRatio) {
            originalDimensions = { width: 300, height: 200 }; // Default landscape aspect
          }
        }
      } else if (file.type.startsWith('video/')) {
        try {
          originalDimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
            const video = document.createElement('video');
            video.onloadedmetadata = () => {
              console.log(`Video dimensions: ${video.videoWidth}x${video.videoHeight}`);
              resolve({ width: video.videoWidth, height: video.videoHeight });
            };
            video.onerror = reject;
            video.src = url;
          });
        } catch (error) {
          console.error('Error loading video dimensions:', error);
          // Fallback dimensions for videos when detection fails
          if (useOriginalRatio) {
            originalDimensions = { width: 400, height: 300 }; // Default video aspect
          }
        }
      }
        const newItem: ScrapbookItem = {
        id: `${Date.now()}-${i}`,
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' : 'audio',
        url,
        position: { x: Math.random() * 300, y: Math.random() * 200 },
        rotation: 0,
        scale: 1,
        zIndex: Math.max(0, ...scrapbookItems.map(i => i.zIndex)) + 1,
        frameStyle: 'none',
        borderColor: '#000000',
        originalSize: useOriginalRatio,
        originalDimensions
      };
      
      console.log('Adding new item:', newItem);
      setScrapbookItems(prev => [...prev, newItem]);
    }
      setIsSaving(false);
    if (event.target) event.target.value = '';
    console.log('File upload completed');
  }, [scrapbookItems, useOriginalRatio]);

  const handleDeleteItem = (id: string) => {
    setScrapbookItems(prev => prev.filter(item => item.id !== id));
  };

  const handleRotateItem = (id: string, direction: 'left' | 'right') => {
    setScrapbookItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, rotation: item.rotation + (direction === 'right' ? 15 : -15) }
        : item
    ));
  };

  const handleScaleItem = (id: string, direction: 'up' | 'down') => {
    setScrapbookItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, scale: Math.max(0.1, Math.min(3, item.scale + (direction === 'up' ? 0.1 : -0.1))) }
        : item
    ));
  };

  // New customization functions
  const handleFrameStyleChange = (id: string, frameStyle: ScrapbookItem['frameStyle']) => {
    setScrapbookItems(prev => prev.map(item => 
      item.id === id ? { ...item, frameStyle } : item
    ));
  };

  const handleBorderColorChange = (id: string, borderColor: string) => {
    setScrapbookItems(prev => prev.map(item => 
      item.id === id ? { ...item, borderColor } : item
    ));
  };

  const handleOriginalSizeToggle = (id: string) => {
    setScrapbookItems(prev => prev.map(item => 
      item.id === id ? { ...item, originalSize: !item.originalSize } : item
    ));
  };
  const handleMouseDown = (_e: React.MouseEvent, id: string) => {
    setDraggedItem(id);
    setIsDragging(true);
    setSelectedItemId(id);
    
    // Bring item to front
    setScrapbookItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, zIndex: Math.max(0, ...prev.map(i => i.zIndex)) + 1 }
        : item
    ));
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !draggedItem || !scrapbookRef.current) return;
    
    const rect = scrapbookRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setScrapbookItems(prev => prev.map(item => 
      item.id === draggedItem 
        ? { ...item, position: { x: Math.max(0, Math.min(rect.width - 100, x - 50)), y: Math.max(0, Math.min(rect.height - 100, y - 50)) } }
        : item
    ));
  }, [isDragging, draggedItem]);

  const handleMouseUp = useCallback(() => {
    setDraggedItem(null);
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);  const renderItem = (item: ScrapbookItem) => {    const getFrameStyles = () => {
      let width = '100px';
      let height = '100px';
      let objectFit: 'cover' | 'contain' = 'cover';
      
      if (item.originalSize && item.originalDimensions) {
        // Calculate dimensions maintaining aspect ratio within max bounds
        const maxSize = 250; // Increased max size for better visibility
        const aspectRatio = item.originalDimensions.width / item.originalDimensions.height;
        
        if (aspectRatio > 1) {
          // Landscape image - width is larger
          width = Math.min(item.originalDimensions.width, maxSize) + 'px';
          height = Math.min(item.originalDimensions.width / aspectRatio, maxSize) + 'px';
        } else {
          // Portrait or square image - height is larger or equal
          width = Math.min(item.originalDimensions.height * aspectRatio, maxSize) + 'px';
          height = Math.min(item.originalDimensions.height, maxSize) + 'px';
        }
        
        // Use 'contain' to show full image without cropping when using original size
        objectFit = 'contain';
      } else if (item.originalSize) {
        // If originalSize is true but no dimensions available, use reasonable defaults
        width = '200px';
        height = 'auto';
        objectFit = 'contain';
      }

      const baseStyles = {
        width,
        height,
        maxWidth: item.originalSize ? '250px' : '100px',
        maxHeight: item.originalSize ? '250px' : '100px',
        objectFit,
        touchAction: 'manipulation' as const
      };

      switch (item.frameStyle) {
        case 'circle':
          return {
            ...baseStyles,
            borderRadius: '50%',
            border: `3px solid ${item.borderColor}`
          };
        case 'rounded':
          return {
            ...baseStyles,
            borderRadius: '12px',
            border: `2px solid ${item.borderColor}`
          };
        case 'square':
          return {
            ...baseStyles,
            borderRadius: '0',
            border: `2px solid ${item.borderColor}`
          };
        case 'vintage':
          return {
            ...baseStyles,
            borderRadius: '4px',
            border: `4px solid ${item.borderColor}`,
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.2)'
          };        case 'polaroid':
          return {
            ...baseStyles,
            borderRadius: '2px',
            border: `8px solid white`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            padding: '0 0 20px 0'
          };
        default:
          return {
            ...baseStyles,
            border: 'none',
            borderRadius: '0',
            boxShadow: 'none'
          };
      }
    };

    const commonProps = {
      style: getFrameStyles()
    };

    switch (item.type) {
      case 'image':
        return <img src={item.url} alt="Scrapbook item" {...commonProps} />;
      case 'video':
        return (
          <video 
            src={item.url} 
            controls 
            {...commonProps}
            style={{
              ...commonProps.style,
              touchAction: 'manipulation'
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              const target = e.currentTarget as HTMLElement;
              target.classList.add('scale-90');
              setTimeout(() => target.classList.remove('scale-90'), 150);
            }}
          />
        );
      case 'audio':
        return (
          <div className="bg-gray-200 rounded-lg p-4 flex items-center justify-center" style={{ width: '100px', height: '100px' }}>
            <audio src={item.url} controls className="w-full" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <MobileSwipeTips />
      <div className="max-w-4xl mx-auto px-4 sm:px-6">        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* Title Section */}
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={scrapbookTitle}
                  onChange={(e) => setScrapbookTitle(e.target.value)}
                  className="text-2xl font-bold bg-transparent border-none outline-none focus:bg-gray-50 dark:focus:bg-gray-800 rounded px-2 py-1 w-full"
                  placeholder="My Scrapbook"
                />
                <p className="text-gray-600 dark:text-gray-400">Create your personal memory collage</p>
                {lastSaved && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </div>
                )}
              </div>
              
              {/* Save and Download Actions */}
              <div className="flex gap-2 mb-2 sm:mb-0">
                <Button
                  variant="outline"
                  onClick={handleSaveScrapbook}
                  disabled={isSaving}
                  size="sm"
                  className="py-2 px-3 text-sm active:scale-95 transform transition-transform"
                >
                  <Save size={16} className="mr-1" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>                <Button
                  variant="outline"
                  onClick={handleDownloadScrapbook}
                  disabled={scrapbookItems.length === 0 || isSaving}
                  size="sm"
                  className="py-2 px-3 text-sm active:scale-95 transform transition-transform"
                >
                  <Download size={16} className="mr-1" />
                  {isSaving ? 'Downloading...' : 'Download'}
                </Button>
              </div>
                {/* Aspect Ratio Controls */}
              <div className="flex flex-wrap gap-2">
                {/* Landscape ratios */}
                <Button
                  variant={scrapbookAspectRatio === '16:9' ? 'primary' : 'outline'}
                  onClick={() => {
                    setScrapbookAspectRatio('16:9');
                    setScrapbookOrientation('landscape');
                  }}
                  size="sm"
                  className="py-2 px-3 text-xs active:scale-95 transform transition-transform touch-manipulation"
                >
                  16:9
                </Button>
                <Button
                  variant={scrapbookAspectRatio === '4:3' ? 'primary' : 'outline'}
                  onClick={() => {
                    setScrapbookAspectRatio('4:3');
                    setScrapbookOrientation('landscape');
                  }}
                  size="sm"
                  className="py-2 px-3 text-xs active:scale-95 transform transition-transform touch-manipulation"
                >
                  4:3
                </Button>
                <Button
                  variant={scrapbookAspectRatio === '1:1' ? 'primary' : 'outline'}
                  onClick={() => {
                    setScrapbookAspectRatio('1:1');
                    setScrapbookOrientation('landscape');
                  }}
                  size="sm"
                  className="py-2 px-3 text-xs active:scale-95 transform transition-transform touch-manipulation"
                >
                  1:1
                </Button>
                {/* Portrait ratios */}
                <Button
                  variant={scrapbookAspectRatio === '9:16' ? 'primary' : 'outline'}
                  onClick={() => {
                    setScrapbookAspectRatio('9:16');
                    setScrapbookOrientation('portrait');
                  }}
                  size="sm"
                  className="py-2 px-3 text-xs active:scale-95 transform transition-transform touch-manipulation"
                >
                  9:16
                </Button>
                <Button
                  variant={scrapbookAspectRatio === '3:4' ? 'primary' : 'outline'}
                  onClick={() => {
                    setScrapbookAspectRatio('3:4');
                    setScrapbookOrientation('portrait');
                  }}
                  size="sm"
                  className="py-2 px-3 text-xs active:scale-95 transform transition-transform touch-manipulation"
                >
                  3:4
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardBody className="p-2 sm:p-4">
            <div className="flex justify-center overflow-hidden">
              <div 
                ref={scrapbookRef}                className={`
                  relative rounded-lg border-2 border-dashed 
                  border-gray-300 dark:border-gray-600 p-2 sm:p-4 mx-auto
                  ${scrapbookOrientation === 'landscape' ? 'w-full max-w-4xl' : 'w-full max-w-2xl'}
                  touch-manipulation
                `}                style={{
                  backgroundColor: scrapbookBackground,
                  // Calculate dimensions based on aspect ratio
                  ...((() => {
                    const aspectRatios = {
                      '16:9': { width: 16, height: 9 },
                      '4:3': { width: 4, height: 3 },
                      '1:1': { width: 1, height: 1 },
                      '9:16': { width: 9, height: 16 },
                      '3:4': { width: 3, height: 4 }
                    };
                    
                    const ratio = aspectRatios[scrapbookAspectRatio];
                    const maxWidth = Math.min(640, (typeof window !== 'undefined' ? window.innerWidth - 80 : 1200) * scrapbookProportion);
                    const maxHeight = Math.min(600, (typeof window !== 'undefined' ? window.innerHeight : 800) * scrapbookProportion);
                    
                    // Calculate dimensions maintaining aspect ratio
                    let width, height;
                    if (ratio.width / ratio.height > maxWidth / maxHeight) {
                      // Width constrained
                      width = maxWidth;
                      height = (maxWidth * ratio.height) / ratio.width;
                    } else {
                      // Height constrained
                      height = maxHeight;
                      width = (maxHeight * ratio.width) / ratio.height;
                    }
                    
                    return {
                      width: `${Math.max(280, width)}px`,
                      height: `${Math.max(300, height)}px`
                    };                  })()),
                  overflowX: 'hidden',
                  touchAction: 'none'
                }}
              >
                {scrapbookItems.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <div className="mb-3">
                      <Plus size={40} strokeWidth={1} />
                    </div>
                    <p className="mb-2">Your gallery wall is empty</p>
                    <p className="text-sm">Upload images, videos, or record audio to decorate your scrapbook</p>
                  </div>
                ) : (                  scrapbookItems.map(item => (
                    <div
                      key={item.id}
                      className="absolute group"
                      style={{
                        left: item.position.x,
                        top: item.position.y,
                        zIndex: item.zIndex,
                      }}
                    >                      {/* Item container with scaling and rotation */}
                      <div
                        className="cursor-move transition-all duration-300 relative"
                        style={{
                          transform: `rotate(${item.rotation}deg) scale(${item.scale})`,
                          transition: draggedItem === item.id ? 'none' : 'transform 0.2s ease-out'
                        }}
                        onMouseDown={(e) => handleMouseDown(e, item.id)}
                        onTouchStart={(e) => handleTouchStart(e, item.id)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                      >
                        {renderItem(item)}
                      </div>                      {/* Control panel - positioned outside scaled container */}
                      <div 
                        className="absolute bg-white dark:bg-gray-800 backdrop-blur-sm rounded-md shadow-sm border border-gray-200 dark:border-gray-700 p-1 flex gap-1.5 xs:gap-1 opacity-0 group-hover:opacity-100 md:opacity-0 xs:opacity-100 transition-opacity"
                        style={{
                          top: '-32px',
                          left: '0px',
                          transform: 'scale(1)', // Ensure controls are always normal size
                          transformOrigin: 'left top'
                        }}
                      >
                        <button 
                          onClick={() => handleRotateItem(item.id, 'left')} 
                          className="w-9 h-9 xs:w-8 xs:h-8 md:w-6 md:h-6 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-transform touch-manipulation"
                          title="Rotate left"
                          onTouchStart={(e) => e.stopPropagation()}
                        >
                          <RotateCcw size={16} className="w-4 h-4 sm:w-3.5 sm:h-3.5 md:w-3 md:h-3" />
                        </button>
                        <button 
                          onClick={() => handleRotateItem(item.id, 'right')} 
                          className="w-9 h-9 xs:w-8 xs:h-8 md:w-6 md:h-6 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-transform touch-manipulation"
                          title="Rotate right"
                          onTouchStart={(e) => e.stopPropagation()}
                        >
                          <RotateCw size={16} className="w-4 h-4 sm:w-3.5 sm:h-3.5 md:w-3 md:h-3" />
                        </button>
                        <button 
                          onClick={() => handleScaleItem(item.id, 'up')} 
                          className="w-9 h-9 xs:w-8 xs:h-8 md:w-6 md:h-6 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-transform touch-manipulation"
                          title="Zoom in"
                          onTouchStart={(e) => e.stopPropagation()}
                        >
                          <ZoomIn size={16} className="w-4 h-4 sm:w-3.5 sm:h-3.5 md:w-3 md:h-3" />
                        </button>
                        <button 
                          onClick={() => handleScaleItem(item.id, 'down')} 
                          className="w-9 h-9 xs:w-8 xs:h-8 md:w-6 md:h-6 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-transform touch-manipulation"
                          title="Zoom out"
                          onTouchStart={(e) => e.stopPropagation()}
                        >
                          <ZoomOut size={16} className="w-4 h-4 sm:w-3.5 sm:h-3.5 md:w-3 md:h-3" />
                        </button>                        <button 
                          onClick={() => handleDeleteItem(item.id)} 
                          className="w-9 h-9 xs:w-8 xs:h-8 md:w-6 md:h-6 rounded-full bg-red-50 dark:bg-red-900 shadow-sm flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800 active:scale-95 transition-transform touch-manipulation"
                          title="Delete this item"
                          onTouchStart={(e) => e.stopPropagation()}
                        >
                          <Trash2 size={16} className="w-4 h-4 sm:w-3.5 sm:h-3.5 md:w-3 md:h-3" />
                        </button>
                        <button 
                          onClick={() => handleOriginalSizeToggle(item.id)} 
                          className={`w-9 h-9 xs:w-8 xs:h-8 md:w-6 md:h-6 rounded-full shadow-sm flex items-center justify-center active:scale-95 transition-transform touch-manipulation ${
                            item.originalSize 
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          title="Toggle original size"
                          onTouchStart={(e) => e.stopPropagation()}
                        >
                          {item.originalSize ? <Minimize2 size={16} className="w-4 h-4 sm:w-3.5 sm:h-3.5 md:w-3 md:h-3" /> : <Maximize2 size={16} className="w-4 h-4 sm:w-3.5 sm:h-3.5 md:w-3 md:h-3" />}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>          </CardBody>
            {/* Background Color Customization */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Background Color Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Palette size={16} className="inline mr-1" />
                  Background Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {['#f9fafb', '#ffffff', '#fef3c7', '#fce7f3', '#dbeafe', '#d1fae5', '#f3e8ff', '#fed7e2'].map(color => (
                    <button
                      key={color}
                      onClick={() => setScrapbookBackground(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                        scrapbookBackground === color ? 'border-gray-900 dark:border-gray-100' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={`Set background to ${color}`}
                    />
                  ))}
                  <input
                    type="color"
                    value={scrapbookBackground}
                    onChange={(e) => setScrapbookBackground(e.target.value)}
                    className="w-8 h-8 rounded-full border border-gray-300 cursor-pointer"
                    title="Custom color"
                  />
                </div>
              </div>

              {/* Selected Item Customization */}
              {selectedItemId && (() => {
                const selectedItem = scrapbookItems.find(item => item.id === selectedItemId);
                if (!selectedItem) return null;

                return (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Selected Item Customization
                    </h3>
                    
                    {/* Frame Style Section */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Square size={16} className="inline mr-1" />
                        Frame Style
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { value: 'none', label: 'None' },
                          { value: 'square', label: 'Square' },
                          { value: 'rounded', label: 'Rounded' },
                          { value: 'circle', label: 'Circle' },
                          { value: 'vintage', label: 'Vintage' },
                          { value: 'polaroid', label: 'Polaroid' }
                        ].map(({ value, label }) => (
                          <button
                            key={value}
                            onClick={() => handleFrameStyleChange(selectedItem.id, value as ScrapbookItem['frameStyle'])}
                            className={`px-3 py-1 rounded text-xs transition-colors ${
                              selectedItem.frameStyle === value
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>                    </div>

                    {/* Original Size Section */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Maximize2 size={16} className="inline mr-1" />
                        Size Options
                      </label>
                      <div className="space-y-2">
                        <button
                          onClick={() => handleOriginalSizeToggle(selectedItem.id)}
                          className={`w-full px-3 py-2 rounded text-sm transition-colors ${
                            selectedItem.originalSize
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          {selectedItem.originalSize ? (
                            <span className="flex items-center justify-center">
                              <Minimize2 size={16} className="mr-2" />
                              Using Original Size
                            </span>
                          ) : (
                            <span className="flex items-center justify-center">
                              <Maximize2 size={16} className="mr-2" />
                              Use Original Size
                            </span>
                          )}
                        </button>
                        {selectedItem.originalDimensions && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            Original: {selectedItem.originalDimensions.width} × {selectedItem.originalDimensions.height}px
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Border Color Section */}
                    {selectedItem.frameStyle !== 'none' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          <Circle size={16} className="inline mr-1" />
                          Border Color
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['#000000', '#ffffff', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map(color => (
                            <button
                              key={color}
                              onClick={() => handleBorderColorChange(selectedItem.id, color)}
                              className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                                selectedItem.borderColor === color ? 'border-gray-900 dark:border-gray-100' : 'border-gray-300'
                              }`}
                              style={{ backgroundColor: color }}
                              title={`Set border to ${color}`}
                            />
                          ))}
                          <input
                            type="color"
                            value={selectedItem.borderColor}
                            onChange={(e) => handleBorderColorChange(selectedItem.id, e.target.value)}
                            className="w-6 h-6 rounded-full border border-gray-300 cursor-pointer"
                            title="Custom border color"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            
            {/* Instructions */}
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
              {selectedItemId ? 'Item selected - customize above' : 'Click on any item to customize its frame and colors'}
            </div>
          </div>          <CardFooter className="p-3 sm:p-4">
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              <Button 
                variant="outline"
                leftIcon={<Image size={16} className="hidden xs:inline" />}                onClick={() => {
                  console.log('Add Image button clicked');
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = "image/*";
                    fileInputRef.current.click();
                    console.log('File input clicked for images');
                  } else {
                    console.log('File input ref is null');
                  }
                }}
                disabled={isSaving}
                size="sm"
                className="py-2.5 px-4 sm:py-2 sm:px-3 text-sm sm:text-base active:scale-95 transform transition-transform touch-manipulation shadow-sm"
              >
                <Image size={16} className="inline xs:hidden mr-1" />
                {isSaving ? 'Uploading...' : 'Add Image'}
                {useOriginalRatio && <span className="ml-1 text-xs">📐</span>}
              </Button>
              
              <Button 
                variant="outline" 
                leftIcon={<Film size={16} className="hidden xs:inline" />}                onClick={() => {
                  console.log('Add Video button clicked');
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = "video/*";
                    fileInputRef.current.click();
                    console.log('File input clicked for videos');
                  } else {
                    console.log('File input ref is null');
                  }
                }}
                disabled={isSaving}
                size="sm"
                className="py-2.5 px-4 sm:py-2 sm:px-3 text-sm sm:text-base active:scale-95 transform transition-transform touch-manipulation shadow-sm"
              >
                <Film size={16} className="inline xs:hidden mr-1" />
                Add Video
                {useOriginalRatio && <span className="ml-1 text-xs">📐</span>}
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,video/*,audio/*"
            />
            
            {/* Original Ratio Setting */}
            <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={useOriginalRatio} 
                  onChange={() => setUseOriginalRatio(!useOriginalRatio)}
                  className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  <Maximize2 size={16} className="inline mr-1" />
                  Use original aspect ratio for new uploads
                </span>
              </label>
              {useOriginalRatio && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                  📐 Photos and videos will maintain their original proportions when added
                </p>
              )}
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 sm:mt-2">
              Supports files up to 500MB • All common formats accepted
            </div>
          </CardFooter>
        </Card>
        
        {/* Hidden canvas for download functionality */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </>
  );
};

export default ScrapbookPage;

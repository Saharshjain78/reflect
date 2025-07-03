import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Image, 
  Film, 
  Mic, 
  Save, 
  Plus, 
  RotateCw, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Trash2,
  Download,
  Square,
  Circle,
  Palette,
  Move,
  Camera
} from 'lucide-react';

interface ScrapbookItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  position: { x: number; y: number };
  rotation: number;
  scale: number;
  zIndex: number;
  frameStyle: 'none' | 'square' | 'circle';
  borderColor: string;
  originalSize?: boolean;
}

const ScrapbookPage: React.FC = () => {
  const [scrapbookItems, setScrapbookItems] = useState<ScrapbookItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scrapbookOrientation, setScrapbookOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [scrapbookProportion, setScrapbookProportion] = useState(0.8);
  const [isSaving, setIsSaving] = useState(false);
  const [useOriginalSize, setUseOriginalSize] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrapbookRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsSaving(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      
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
        originalSize: useOriginalSize
      };
      
      setScrapbookItems(prev => [...prev, newItem]);
    }
    
    setIsSaving(false);
    if (event.target) event.target.value = '';
  }, [scrapbookItems, useOriginalSize]);

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

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    setDraggedItem(id);
    setIsDragging(true);
    
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
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const renderItem = (item: ScrapbookItem) => {
    const commonProps = {
      style: {
        width: item.originalSize ? 'auto' : '100px',
        height: item.originalSize ? 'auto' : '100px',
        maxWidth: item.originalSize ? '200px' : '100px',
        maxHeight: item.originalSize ? '200px' : '100px',
        objectFit: 'cover' as const,
        borderRadius: item.frameStyle === 'circle' ? '50%' : '0',
        border: item.frameStyle !== 'none' ? `2px solid ${item.borderColor}` : 'none'
      }
    };

    switch (item.type) {
      case 'image':
        return <img src={item.url} alt="Scrapbook item" {...commonProps} />;
      case 'video':
        return <video src={item.url} controls {...commonProps} />;
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Digital Scrapbook</h1>
              <p className="text-gray-600 dark:text-gray-400">Create your personal memory collage</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={scrapbookOrientation === 'landscape' ? 'default' : 'outline'}
                onClick={() => setScrapbookOrientation('landscape')}
                size="sm"
              >
                Landscape
              </Button>
              <Button
                variant={scrapbookOrientation === 'portrait' ? 'default' : 'outline'}
                onClick={() => setScrapbookOrientation('portrait')}
                size="sm"
              >
                Portrait
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardBody className="p-2 sm:p-4">
          <div className="flex justify-center overflow-hidden">
            <div 
              ref={scrapbookRef}
              className={`
                relative bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed 
                border-gray-300 dark:border-gray-600 p-2 sm:p-4 mx-auto
                ${scrapbookOrientation === 'landscape' ? 'w-full max-w-4xl' : 'w-full max-w-2xl'}
              `}
              style={{
                height: scrapbookOrientation === 'landscape' 
                  ? `${Math.max(300, Math.min(500, (typeof window !== 'undefined' ? window.innerHeight : 800) * scrapbookProportion))}px` 
                  : `${Math.max(400, Math.min(700, (typeof window !== 'undefined' ? window.innerHeight : 800) * scrapbookProportion))}px`,
                width: scrapbookOrientation === 'landscape'
                  ? `${Math.max(280, Math.min(640, (typeof window !== 'undefined' ? window.innerWidth - 40 : 1200) * scrapbookProportion))}px`
                  : `${Math.max(240, Math.min(480, (typeof window !== 'undefined' ? window.innerWidth - 40 : 1200) * scrapbookProportion * 0.75))}px`,
                overflowX: 'hidden'
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
              ) : (
                scrapbookItems.map(item => (
                  <div
                    key={item.id}
                    className="absolute cursor-move shadow-md hover:shadow-xl transition-all duration-300"
                    style={{
                      left: item.position.x,
                      top: item.position.y,
                      transform: `rotate(${item.rotation}deg) scale(${item.scale})`,
                      zIndex: item.zIndex,
                      borderRadius: item.frameStyle === 'circle' ? '50%' : '0',
                      transition: draggedItem === item.id ? 'none' : 'transform 0.2s ease-out'
                    }}
                    onMouseDown={(e) => handleMouseDown(e, item.id)}
                  >
                    {renderItem(item)}
                    
                    {/* Control panel */}
                    <div className="absolute -top-8 left-0 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 p-1 flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
                      <button onClick={() => handleRotateItem(item.id, 'left')} className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <RotateCcw size={12} />
                      </button>
                      <button onClick={() => handleRotateItem(item.id, 'right')} className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <RotateCw size={12} />
                      </button>
                      <button onClick={() => handleScaleItem(item.id, 'up')} className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <ZoomIn size={12} />
                      </button>
                      <button onClick={() => handleScaleItem(item.id, 'down')} className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <ZoomOut size={12} />
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)} className="w-6 h-6 rounded-full bg-red-50 dark:bg-red-900 shadow-sm flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardBody>
        
        <CardFooter className="p-3 sm:p-4">
          <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
            <Button 
              variant="outline"
              leftIcon={<Image size={16} />}
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = "image/*";
                  fileInputRef.current.click();
                }
              }}
              disabled={isSaving}
              size="sm"
            >
              {isSaving ? 'Uploading...' : 'Add Image'}
            </Button>
            
            <Button 
              variant="outline" 
              leftIcon={<Film size={16} />}
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = "video/*";
                  fileInputRef.current.click();
                }
              }}
              disabled={isSaving}
              size="sm"
            >
              Add Video
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
        </CardFooter>
      </Card>
    </div>
  );
};

export default ScrapbookPage;

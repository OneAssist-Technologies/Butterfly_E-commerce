'use client';

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Tv,
  LayoutGrid,
  List,
  UploadCloud,
  X,
  Star,
  AlertCircle,
} from 'lucide-react';
import { CatalogProduct } from '@/data/products';
import { settingsService } from '@/services/settings.service';
import { normalizeProductImageUrl } from '@/services/product.service';

interface InventoryTabProps {
  productsList: CatalogProduct[];
  onAddProduct: (product: CatalogProduct) => Promise<void>;
  onUpdateProduct: (id: string, product: CatalogProduct) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onToggleStock: (id: string) => Promise<void>;
  externalOpenModal?: boolean;
  onClearExternalOpenModal?: () => void;
}

interface UploadedImg {
  id: string;
  url: string;
  name: string;
  size: string;
  isPrimary: boolean;
}

const DEFAULT_SIZES = ['32"', '43"', '50"', '55"', '65"', '75"', '85"'];

const DEFAULT_NEW_PRODUCT = {
  model: '',
  name: '',
  size: '43"',
  resolution: '4K UHD Resolution',
  price: '',
  sound: '',
  displayTech: 'Ultra Bright D-LED',
  smartOS: 'Google TV',
  image: '',
  keyFeaturesText: '',
  whatsIncludedText: '',
  refreshRate: '',
  panelType: '',
  hdmiPorts: '',
  usbPorts: '',
  wireless: '',
  warrantyInstallation: '',
  isTopSelling: false,
};

export function InventoryTab({
  productsList,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onToggleStock,
  externalOpenModal,
  onClearExternalOpenModal,
}: InventoryTabProps) {
  const [productSearch, setProductSearch] = useState('');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('All');
  const [productsViewMode, setProductsViewMode] = useState<'cards' | 'table'>('cards');

  // Dynamic sizes state
  const [availableSizes, setAvailableSizes] = useState<string[]>(DEFAULT_SIZES);
  const [isAddingSize, setIsAddingSize] = useState(false);
  const [newSizeInput, setNewSizeInput] = useState('');

  // Top Selling constraint & warning state
  const [topSellingWarning, setTopSellingWarning] = useState<string | null>(null);

  // Modal & Form state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);
  const [newProduct, setNewProduct] = useState(DEFAULT_NEW_PRODUCT);

  // Sync dynamic sizes from company settings & local storage
  useEffect(() => {
    const loadSizes = async () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('butterfly_tv_sizes');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setAvailableSizes(parsed);
            }
          } catch {}
        }
      }
      try {
        const st = await settingsService.getSettings();
        if (Array.isArray(st.availableSizes) && st.availableSizes.length > 0) {
          setAvailableSizes(st.availableSizes);
          if (typeof window !== 'undefined') {
            localStorage.setItem('butterfly_tv_sizes', JSON.stringify(st.availableSizes));
          }
        }
      } catch {}
    };

    loadSizes();

    const handleSizesUpdated = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setAvailableSizes(e.detail);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('butterfly_sizes_updated', handleSizesUpdated);
      return () => {
        window.removeEventListener('butterfly_sizes_updated', handleSizesUpdated);
      };
    }
  }, []);

  // Compute products currently featured in top selling
  const currentTopSellingProducts = useMemo(() => {
    return productsList.filter((p) => p.isTopSelling);
  }, [productsList]);

  const currentlyTopSellingCount = currentTopSellingProducts.length;

  // Toggle Top Selling selection with strict 4-product limit & warning
  const handleToggleTopSelling = () => {
    if (newProduct.isTopSelling) {
      setNewProduct((prev) => ({ ...prev, isTopSelling: false }));
      setTopSellingWarning(null);
    } else {
      const otherTopSelling = productsList.filter(
        (p) => p.id !== (editingProduct ? editingProduct.id : '') && p.isTopSelling,
      );

      if (otherTopSelling.length >= 4) {
        setTopSellingWarning(
          'Already 4 products are selected for top selling list. Please deselect any of the one before you select another.',
        );
        return;
      }

      setTopSellingWarning(null);
      setNewProduct((prev) => ({ ...prev, isTopSelling: true }));
    }
  };

  // Quick deselect an existing top selling product to free up a slot
  const handleQuickDeselectTopSelling = async (productId: string) => {
    const target = productsList.find((p) => p.id === productId);
    if (target) {
      await onUpdateProduct(productId, { ...target, isTopSelling: false });
      setNewProduct((prev) => ({ ...prev, isTopSelling: true }));
      setTopSellingWarning(null);
    }
  };

  // Dynamic Size Add/Remove Handlers
  const handleAddNewSize = async () => {
    let val = newSizeInput.trim();
    if (!val) return;
    if (/^\d+$/.test(val)) val = `${val}"`;
    if (!val.endsWith('"') && /^\d+/.test(val)) val = `${val}"`;

    if (availableSizes.includes(val)) {
      alert(`Size ${val} is already added.`);
      return;
    }

    const updated = [...availableSizes, val].sort((a, b) => {
      const numA = parseInt(a.replace(/[^0-9]/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/[^0-9]/g, ''), 10) || 0;
      return numA - numB;
    });

    setAvailableSizes(updated);
    setIsAddingSize(false);
    setNewSizeInput('');

    if (typeof window !== 'undefined') {
      localStorage.setItem('butterfly_tv_sizes', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('butterfly_sizes_updated', { detail: updated }));
    }

    try {
      await settingsService.updateSettings({ availableSizes: updated });
    } catch (e) {
      console.warn('Failed to save sizes to settings:', e);
    }
  };

  const handleDeleteSize = async (sizeToDelete: string) => {
    if (availableSizes.length <= 1) {
      alert('You must have at least one screen size.');
      return;
    }
    if (confirm(`Remove ${sizeToDelete} screen size from the dynamic catalog?`)) {
      const updated = availableSizes.filter((s) => s !== sizeToDelete);
      setAvailableSizes(updated);
      if (selectedSizeFilter === sizeToDelete) setSelectedSizeFilter('All');
      if (typeof window !== 'undefined') {
        localStorage.setItem('butterfly_tv_sizes', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('butterfly_sizes_updated', { detail: updated }));
      }
      try {
        await settingsService.updateSettings({ availableSizes: updated });
      } catch (e) {
        console.warn('Failed to update sizes in settings:', e);
      }
    }
  };

  // Image Upload state
  const [uploadedImages, setUploadedImages] = useState<UploadedImg[]>([]);
  const [imageDragActive, setImageDragActive] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragCounterRef = useRef(0);

  // Sync external open trigger
  useEffect(() => {
    if (externalOpenModal) {
      handleOpenAddModal();
      if (onClearExternalOpenModal) onClearExternalOpenModal();
    }
  }, [externalOpenModal, onClearExternalOpenModal]);

  const resetProductForm = () => {
    setEditingProduct(null);
    setNewProduct(DEFAULT_NEW_PRODUCT);
    setUploadedImages([]);
    setImageError(null);
    setTopSellingWarning(null);
  };

  const handleOpenAddModal = () => {
    resetProductForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (tv: CatalogProduct) => {
    setEditingProduct(tv);
    const rawPriceDigits = tv.price ? tv.price.replace(/[^0-9]/g, '') : '';
    const parsedPriceNum = parseInt(rawPriceDigits, 10);
    const formattedPrice = !isNaN(parsedPriceNum) && parsedPriceNum > 0
      ? parsedPriceNum.toLocaleString('en-IN')
      : '';

    setNewProduct({
      model: tv.model || '',
      name: tv.name || '',
      size: tv.size || '43"',
      resolution: tv.resolution || '4K UHD Resolution',
      price: formattedPrice,
      sound: tv.sound || '',
      displayTech: tv.displayTech || 'Ultra Bright D-LED',
      smartOS: tv.smartOS || (tv as any).os || 'Google TV',
      image: normalizeProductImageUrl(tv.image) || '',
      keyFeaturesText: Array.isArray(tv.keyFeatures || tv.features)
        ? (tv.keyFeatures || tv.features || []).join('\n')
        : '',
      whatsIncludedText: Array.isArray(tv.whatsIncluded)
        ? tv.whatsIncluded.join('\n')
        : typeof tv.whatsIncluded === 'string'
        ? tv.whatsIncluded
        : '',
      refreshRate: tv.technicalSpecs?.refreshRate || '',
      panelType: tv.technicalSpecs?.panelType || '',
      hdmiPorts: tv.technicalSpecs?.hdmiPorts || '',
      usbPorts: tv.technicalSpecs?.usbPorts || '',
      wireless: tv.technicalSpecs?.wireless || '',
      warrantyInstallation: tv.warrantyInstallation || '',
      isTopSelling: Boolean(tv.isTopSelling),
    });
    setTopSellingWarning(null);

    const imgs: UploadedImg[] = [];
    if (tv.images && Array.isArray(tv.images) && tv.images.length > 0) {
      tv.images.forEach((url, idx) => {
        imgs.push({
          id: `existing-${idx}-${Date.now()}`,
          url: normalizeProductImageUrl(url),
          name: `${tv.model || 'TV'}-shot-${idx + 1}.webp`,
          size: 'Catalog Asset',
          isPrimary: idx === 0,
        });
      });
    } else if (tv.image) {
      imgs.push({
        id: `existing-0-${Date.now()}`,
        url: normalizeProductImageUrl(tv.image),
        name: `${tv.model || 'TV'}-primary.webp`,
        size: 'Catalog Asset',
        isPrimary: true,
      });
    }
    setUploadedImages(imgs);
    setImageError(null);
    setShowModal(true);
  };

  // Image helpers
  const handleImageFiles = useCallback(async (files: File[]) => {
    setImageError(null);
    const validFiles = files.filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      setImageError('Please select valid image files (PNG, JPG, WEBP, SVG).');
      return;
    }

    setIsProcessingImage(true);
    try {
      const readAsDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      const newImgs: UploadedImg[] = [];
      for (const file of validFiles) {
        const dataUrl = await readAsDataUrl(file);
        const sizeFormatted =
          file.size > 1024 * 1024
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.round(file.size / 1024)} KB`;

        newImgs.push({
          id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          url: dataUrl,
          name: file.name,
          size: sizeFormatted,
          isPrimary: false,
        });
      }

      setUploadedImages((prev) => {
        const combined = [...prev, ...newImgs];
        if (combined.length > 0 && !combined.some((img) => img.isPrimary)) {
          combined[0].isPrimary = true;
          setNewProduct((p) => ({ ...p, image: combined[0].url }));
        }
        return combined;
      });
    } catch {
      setImageError('Failed to upload image(s). Please try again.');
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, []);

  const handleSetPrimaryImage = useCallback((id: string) => {
    setUploadedImages((prev) => {
      const updated = prev.map((img) => ({
        ...img,
        isPrimary: img.id === id,
      }));
      const primary = updated.find((img) => img.isPrimary);
      if (primary) {
        setNewProduct((p) => ({ ...p, image: primary.url }));
      }
      return updated;
    });
  }, []);

  const handleRemoveImage = useCallback((id: string) => {
    setUploadedImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      const primary = filtered.find((img) => img.isPrimary);
      setNewProduct((p) => ({ ...p, image: primary ? primary.url : '' }));
      return filtered;
    });
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      const matchSearch =
        p.model.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.resolution.toLowerCase().includes(productSearch.toLowerCase());
      const matchSize = selectedSizeFilter === 'All' || p.size === selectedSizeFilter;
      return matchSearch && matchSize;
    });
  }, [productsList, productSearch, selectedSizeFilter]);

  // Retail Price Number Only & INR Formatting Handlers
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/[^0-9]/g, '');
    if (!rawDigits) {
      setNewProduct((prev) => ({ ...prev, price: '' }));
      return;
    }
    const numeric = parseInt(rawDigits, 10);
    const formattedInr = numeric.toLocaleString('en-IN');
    setNewProduct((prev) => ({ ...prev, price: formattedInr }));
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      [
        'Backspace',
        'Delete',
        'Tab',
        'Escape',
        'Enter',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Home',
        'End',
      ].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePricePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const digitsOnly = pasted.replace(/[^0-9]/g, '');
    if (!digitsOnly) return;
    const currentDigits = newProduct.price.replace(/[^0-9]/g, '');
    const combined = parseInt(currentDigits + digitsOnly, 10);
    if (!isNaN(combined)) {
      setNewProduct((prev) => ({ ...prev, price: combined.toLocaleString('en-IN') }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadedImages.length === 0 && !newProduct.image) {
      setImageError('Please upload at least one TV product photo before saving.');
      return;
    }

    const priceNum = parseInt(newProduct.price.replace(/[^0-9]/g, ''), 10) || 0;
    const modelClean = newProduct.model.trim();
    const newId = editingProduct
      ? editingProduct.id
      : `tv-${modelClean.toLowerCase().replace(/[^a-z0-9]/g, '-') || Date.now()}`;
    const keyFeaturesList = newProduct.keyFeaturesText.trim()
      ? newProduct.keyFeaturesText.split('\n').map((s) => s.trim()).filter(Boolean)
      : ['Cinema-Grade Visuals & Brilliant Contrast', 'Ultra-wide 178° viewing angle', 'HDR10 and HLG decoding'];

    const technicalSpecs = {
      refreshRate: newProduct.refreshRate.trim() || '60 Hz Native',
      panelType: newProduct.panelType.trim() || 'A+ Grade IPS Bezel-Less',
      hdmiPorts: newProduct.hdmiPorts.trim() || '3 x HDMI (ARC Supported)',
      usbPorts: newProduct.usbPorts.trim() || '2 x USB 2.0 High Speed',
      wireless: newProduct.wireless.trim() || 'Dual-band Wi-Fi & Bluetooth 5.0',
    };

    const primaryImg =
      uploadedImages.find((img) => img.isPrimary)?.url ||
      uploadedImages[0]?.url ||
      newProduct.image ||
      '';
    const allImages =
      uploadedImages.length > 0
        ? uploadedImages.map((img) => img.url)
        : newProduct.image
        ? [newProduct.image]
        : [primaryImg];

    const productPayload: CatalogProduct = {
      ...(editingProduct || {}),
      id: newId,
      model: modelClean || `BF${newProduct.size.replace(/[^0-9]/g, '')}X1`,
      name: newProduct.name.trim() || `${newProduct.size} Smart TV`,
      size: newProduct.size,
      screenSizeCategory: newProduct.size,
      resolution: newProduct.resolution,
      resolutionCategory: newProduct.resolution.includes('Full')
        ? 'Full HD'
        : newProduct.resolution.includes('4K')
        ? '4K UHD'
        : 'HD',
      price: `₹ ${priceNum.toLocaleString('en-IN')}`,
      numericPrice: priceNum,
      priceNumber: priceNum,
      priceCategory:
        priceNum < 20000
          ? 'Under ₹20,000'
          : priceNum <= 40000
          ? '₹20,000 – ₹40,000'
          : priceNum <= 60000
          ? '₹40,000 – ₹60,000'
          : 'Above ₹60,000',
      brand: 'Butterfly',
      sound: newProduct.sound.trim() || '2 x 10W Stereo Speakers',
      displayTech: newProduct.displayTech,
      smartOS: newProduct.smartOS.trim() || 'Google TV',
      os: newProduct.smartOS.trim() || 'Google TV',
      smartCategory: newProduct.smartOS.includes('Android')
        ? 'Android TV'
        : newProduct.smartOS.includes('WebOS')
        ? 'WebOS'
        : newProduct.smartOS.includes('Tizen')
        ? 'Tizen'
        : 'Google TV',
      image: primaryImg,
      images: allImages,
      inStock: editingProduct ? editingProduct.inStock : true,
      isTopSelling: Boolean(newProduct.isTopSelling),
      features: keyFeaturesList,
      keyFeatures: keyFeaturesList,
      technicalSpecs,
      warrantyInstallation:
        newProduct.warrantyInstallation.trim() ||
        'Complimentary Doorstep Installation Process within 48 hours. 1 Year Comprehensive Brand Warranty + 1 Year Additional on Display Panel.',
      whatsIncluded: newProduct.whatsIncludedText.trim()
        ? newProduct.whatsIncludedText.split('\n').map((s) => s.trim()).filter(Boolean)
        : [],
    };

    setImageError(null);
    try {
      if (editingProduct) {
        await onUpdateProduct(editingProduct.id, productPayload);
      } else {
        await onAddProduct(productPayload);
      }

      setShowModal(false);
      resetProductForm();
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message;
      const message = Array.isArray(apiMessage)
        ? apiMessage.join(', ')
        : apiMessage || err?.message || 'Unable to save the product. Please try again.';
      setImageError(String(message));
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      {/* SECTION CONTAINER 1: SEARCH & FILTERS */}
      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#E50914]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Filter TV Catalog
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            Showing {filteredProducts.length} of {productsList.length} television models
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search model code, size, resolution..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914] transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedSizeFilter('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedSizeFilter === 'All'
                  ? 'bg-[#E50914] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>

            {availableSizes.map((size) => (
              <div key={size} className="relative group inline-flex items-center shrink-0">
                <button
                  onClick={() => setSelectedSizeFilter(size)}
                  className={`pl-3 pr-2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    selectedSizeFilter === size
                      ? 'bg-[#E50914] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{size}</span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSize(size);
                    }}
                    title={`Remove ${size}`}
                    className={`p-0.5 rounded-full hover:bg-black/10 transition-colors ${
                      selectedSizeFilter === size ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-[#E50914]'
                    }`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </span>
                </button>
              </div>
            ))}

            {/* Dynamic Add Size Button & Inline Input */}
            {isAddingSize ? (
              <div className="inline-flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2 py-0.5 shadow-xs shrink-0">
                <input
                  type="text"
                  autoFocus
                  placeholder='e.g. 98"'
                  value={newSizeInput}
                  onChange={(e) => setNewSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNewSize();
                    } else if (e.key === 'Escape') {
                      setIsAddingSize(false);
                      setNewSizeInput('');
                    }
                  }}
                  className="w-16 px-1.5 py-0.5 text-xs font-bold text-slate-900 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddNewSize}
                  className="px-2 py-0.5 bg-[#E50914] text-white text-[10px] font-bold rounded hover:bg-[#c70811] transition-colors"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingSize(false);
                    setNewSizeInput('');
                  }}
                  className="p-0.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingSize(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-dashed border-slate-300 text-slate-600 hover:border-[#E50914] hover:text-[#E50914] font-bold text-xs transition-colors cursor-pointer bg-slate-50/50 shrink-0"
              >
                <Plus className="w-3 h-3" />
                <span>Add Size</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* SECTION CONTAINER 2: CATALOG INVENTORY */}
      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Television Catalog ({filteredProducts.length} Models)
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>Top Selling: {currentlyTopSellingCount}/4 selected</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E50914] text-white text-xs font-bold hover:bg-[#c70811] transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Model</span>
            </button>

            {/* View Switcher: Cards vs Table */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setProductsViewMode('cards')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  productsViewMode === 'cards'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setProductsViewMode('table')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  productsViewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>
          </div>
        </div>

        {productsViewMode === 'cards' ? (
          <div className="p-5 sm:p-6 bg-slate-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((tv) => {
                const isTvInStock = tv.inStock !== false;
                return (
                  <div
                    key={tv.id}
                    className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs"
                  >
                    {/* Top Thumbnail */}
                    <div className="p-4 bg-gradient-to-b from-slate-50/80 to-white relative flex flex-col">
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-slate-900 text-white tracking-wide">
                            {tv.model}
                          </span>
                          {tv.isTopSelling && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              <span>Top Selling</span>
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => onToggleStock(tv.id)}
                          title="Click to toggle stock"
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            isTvInStock
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isTvInStock ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                            }`}
                          />
                          <span>{isTvInStock ? 'In Stock' : 'Out of Stock'}</span>
                        </button>
                      </div>

                      <div className="relative w-full h-36 my-1">
                        <Image
                          src={normalizeProductImageUrl(tv.image)}
                          alt={tv.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                          className="object-contain group-hover:scale-105 transition-transform duration-300"
                          unoptimized={true}
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            if (target) target.src = '/menu_tv_43.jpg';
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span className="font-semibold text-slate-700">{tv.size} Screen</span>
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 truncate max-w-[120px]">
                          {tv.resolution}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 border-t border-slate-100 flex flex-col justify-between flex-1 bg-white">
                      <div>
                        <h4
                          className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-[#E50914] transition-colors"
                          title={tv.name}
                        >
                          {tv.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {tv.sound} &bull; {tv.smartOS}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Price</p>
                          <p className="text-sm font-extrabold text-slate-900">{tv.price}</p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(tv)}
                            aria-label="Edit TV model"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit TV Model"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(tv.id)}
                            aria-label="Delete TV model"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Remove TV model"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Display</th>
                  <th className="py-3 px-4">Model Code</th>
                  <th className="py-3 px-4">Name &amp; Size</th>
                  <th className="py-3 px-4">Resolution</th>
                  <th className="py-3 px-4">Audio Output</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((tv) => {
                  const isTvInStock = tv.inStock !== false;
                  return (
                    <tr key={tv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="relative w-14 h-10 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 p-0.5">
                          <Image
                            src={normalizeProductImageUrl(tv.image)}
                            alt={tv.name}
                            fill
                            sizes="56px"
                            className="object-contain"
                            unoptimized={true}
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              if (target) target.src = '/menu_tv_43.jpg';
                            }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{tv.model}</span>
                          {tv.isTopSelling && (
                            <span
                              title="Featured in Top Selling on Landing Page"
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold border border-amber-200"
                            >
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              <span>Top</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{tv.name}</span>
                        <span className="text-[11px] text-slate-400">{tv.size} Screen</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{tv.resolution}</td>
                      <td className="py-3 px-4 text-slate-600">{tv.sound}</td>
                      <td className="py-3 px-4 font-black text-slate-900">{tv.price}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onToggleStock(tv.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors border ${
                            isTvInStock
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-red-50 text-[#E50914] border-red-200 hover:bg-red-100'
                          }`}
                          title="Click to toggle stock status"
                        >
                          {isTvInStock ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(tv)}
                            aria-label="Edit TV model"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit TV Model"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(tv.id)}
                            aria-label="Delete TV model"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Remove TV model"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ================= MODAL: ADD / EDIT TV MODEL ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200/90 shadow-2xl relative animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4.5 sm:px-7 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#E50914] flex items-center justify-center border border-red-100 shadow-xs">
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E50914]" />
                    <span className="text-[10px] font-black text-[#E50914] uppercase tracking-wider">
                      Catalog Management
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    {editingProduct ? 'Edit TV Model Details' : 'Add New TV Model'}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-xs">
                
                {/* 1. Identity & Pricing */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#E50914]" />
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        Commercial Identity &amp; Pricing
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Step 1 of 5</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Model Code <span className="text-[#E50914]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        placeholder="e.g. BF50U1"
                        value={newProduct.model}
                        onChange={(e) => setNewProduct({ ...newProduct, model: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914] transition-all"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Screen Size <span className="text-[#E50914]">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const custom = prompt('Enter new TV screen size (e.g. 98"):');
                            if (custom && custom.trim()) {
                              let c = custom.trim();
                              if (/^\d+$/.test(c)) c = `${c}"`;
                              if (!c.endsWith('"') && /^\d+/.test(c)) c = `${c}"`;
                              if (!availableSizes.includes(c)) {
                                const next = [...availableSizes, c].sort((a, b) => {
                                  const nA = parseInt(a.replace(/[^0-9]/g, ''), 10) || 0;
                                  const nB = parseInt(b.replace(/[^0-9]/g, ''), 10) || 0;
                                  return nA - nB;
                                });
                                setAvailableSizes(next);
                                setNewProduct((prev) => ({ ...prev, size: c }));
                                settingsService.updateSettings({ availableSizes: next }).catch(() => {});
                                if (typeof window !== 'undefined') {
                                  localStorage.setItem('butterfly_tv_sizes', JSON.stringify(next));
                                  window.dispatchEvent(new CustomEvent('butterfly_sizes_updated', { detail: next }));
                                }
                              } else {
                                setNewProduct((prev) => ({ ...prev, size: c }));
                              }
                            }
                          }}
                          className="text-[10px] font-bold text-[#E50914] hover:underline cursor-pointer"
                        >
                          + Add Size
                        </button>
                      </div>
                      <select
                        value={newProduct.size}
                        onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914] transition-all cursor-pointer"
                      >
                        {availableSizes.map((s) => (
                          <option key={s} value={s}>
                            {s} Screen Size
                          </option>
                        ))}
                        {!availableSizes.includes(newProduct.size) && (
                          <option value={newProduct.size}>{newProduct.size} Screen Size</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Commercial Title <span className="text-[#E50914]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        placeholder='e.g. 50" 4K UHD Smart Google TV'
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914] transition-all"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Retail Price (₹) <span className="text-[#E50914]">*</span>
                        </label>
                        <span className="text-[10px] font-semibold text-slate-400">Numbers only</span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 select-none pointer-events-none">
                          ₹
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          autoComplete="off"
                          placeholder="e.g. 29,990"
                          value={newProduct.price}
                          onChange={handlePriceChange}
                          onKeyDown={handlePriceKeyDown}
                          onPaste={handlePricePaste}
                          className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914] transition-all"
                        />
                      </div>
                      {newProduct.price && (
                        <div className="flex items-center justify-between mt-1 px-1">
                          <span className="text-[10px] text-slate-500 font-medium">INR Preview:</span>
                          <span className="text-[11px] font-extrabold text-[#E50914] bg-red-50/80 px-2 py-0.5 rounded border border-red-100">
                            ₹ {parseInt(newProduct.price.replace(/[^0-9]/g, '') || '0', 10).toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Top Selling on Landing Page Toggle & Rule (Max 4 products) */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      newProduct.isTopSelling
                        ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-300/40'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <Star
                          className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                            newProduct.isTopSelling
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-400'
                          }`}
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <label
                              htmlFor="top-selling-toggle"
                              className="text-xs font-bold text-slate-800 cursor-pointer"
                            >
                              Show in Top Selling list on Landing Page
                            </label>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                currentlyTopSellingCount >= 4
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {currentlyTopSellingCount}/4 Selected
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            Feature this television in the top 4 featured spots in the &quot;Our Best Selling TVs&quot; showcase on the storefront landing page.
                          </p>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          id="top-selling-toggle"
                          type="checkbox"
                          checked={newProduct.isTopSelling}
                          onChange={handleToggleTopSelling}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#E50914]"></div>
                      </label>
                    </div>

                    {/* Warning: If 4 are already selected and user tries to select 5th */}
                    {topSellingWarning && (
                      <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2 animate-in fade-in duration-150">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p className="font-semibold">{topSellingWarning}</p>
                        </div>
                        {currentTopSellingProducts.length > 0 && (
                          <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200 text-[11px]">
                            <span className="font-bold text-slate-700 block mb-1.5">
                              Current 4 Top Selling TVs (click Deselect on any one to free up a slot):
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {currentTopSellingProducts.map((p) => (
                                <span
                                  key={p.id}
                                  className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 font-mono text-[10px] text-slate-800 shadow-2xs"
                                >
                                  <span className="font-bold">{p.model}</span>
                                  <span className="text-slate-500">({p.size})</span>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickDeselectTopSelling(p.id)}
                                    className="ml-1 text-[#E50914] hover:text-[#c70811] font-bold text-[10px] cursor-pointer hover:underline"
                                    title={`Deselect ${p.model} from top selling`}
                                  >
                                    × Deselect
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Photography & Visuals */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#E50914]" />
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <span>TV Display Photography</span>
                        <span className="text-[#E50914]">*</span>
                      </h4>
                      {uploadedImages.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          {uploadedImages.length} {uploadedImages.length === 1 ? 'photo' : 'photos'} ready
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5">
                      {uploadedImages.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setUploadedImages([])}
                          className="text-[11px] text-[#E50914] hover:underline font-bold cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                      <span className="text-[10px] font-semibold text-slate-400">
                        PNG, JPG, WEBP • Max 15MB
                      </span>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,image/svg+xml,image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleImageFiles(Array.from(e.target.files));
                      }
                    }}
                    className="hidden"
                  />

                  <div
                    onDragEnter={(e) => {
                      e.preventDefault();
                      setImageDragActive(true);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDragLeave={() => setImageDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setImageDragActive(false);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        handleImageFiles(Array.from(e.dataTransfer.files));
                      }
                    }}
                    className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 select-none overflow-hidden ${
                      imageDragActive
                        ? 'border-[#E50914] bg-red-50/90 shadow-lg ring-4 ring-[#E50914]/20'
                        : uploadedImages.length > 0
                        ? 'border-slate-200 bg-white p-3'
                        : 'border-slate-300 hover:border-[#E50914] bg-white hover:bg-red-50/20 cursor-pointer'
                    }`}
                    onClick={() => {
                      if (uploadedImages.length === 0) {
                        fileInputRef.current?.click();
                      }
                    }}
                  >
                    {uploadedImages.length > 0 ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                          {uploadedImages.map((img) => (
                            <div
                              key={img.id}
                              className={`p-2.5 rounded-xl border transition-all flex items-center gap-3 relative group ${
                                img.isPrimary
                                  ? 'border-[#E50914] bg-red-50/30 shadow-xs ring-1 ring-[#E50914]/30'
                                  : 'border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300'
                              }`}
                            >
                              <div className="relative w-20 h-14 bg-slate-950 rounded-lg overflow-hidden border border-slate-700 shadow-xs flex items-center justify-center flex-shrink-0">
                                <Image
                                  src={img.url}
                                  alt={img.name}
                                  fill
                                  sizes="80px"
                                  unoptimized={true}
                                  className="object-contain p-1"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  {img.isPrimary ? (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                                      <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                      <span>Primary Cover</span>
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSetPrimaryImage(img.id);
                                      }}
                                      className="text-[9px] font-bold text-slate-500 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer"
                                    >
                                      Set as Primary
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    title="Delete photo"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveImage(img.id);
                                    }}
                                    className="p-1 rounded-md text-slate-400 hover:text-[#E50914] hover:bg-red-50 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <p className="text-[11px] font-bold text-slate-900 truncate" title={img.name}>
                                  {img.name}
                                </p>
                                <p className="text-[9px] text-slate-400 mt-0.5">{img.size}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2.5 rounded-xl border border-dashed border-slate-300 hover:border-[#E50914] bg-slate-50/70 hover:bg-red-50/20 flex items-center justify-between gap-3 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-red-50 text-[#E50914] flex items-center justify-center">
                              <UploadCloud className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-slate-800">
                                Add more TV angle shots or spec mockups
                              </p>
                              <p className="text-[9px] text-slate-400">
                                Click or drop additional photos
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#E50914] hover:bg-[#c70811] text-white text-[11px] font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                          >
                            + Add Photos
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 sm:p-7 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 shadow-2xs flex items-center justify-center text-[#E50914] mb-3">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">
                          Drag and drop official TV display photos here
                        </h5>
                        <p className="text-[11px] text-slate-500 mb-3.5 max-w-sm">
                          Upload one or multiple 16:9 photography assets for this model.
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white text-xs font-bold shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Browse &amp; Upload Images</span>
                        </button>
                        <p className="text-[10px] text-slate-400 mt-2.5">
                          Supports PNG, JPG, JPEG, WEBP or SVG up to 15MB each
                        </p>
                      </div>
                    )}

                    {isProcessingImage && (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-2xs flex flex-col items-center justify-center gap-2 z-20">
                        <div className="w-5 h-5 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-bold text-slate-800">Processing image(s)...</span>
                      </div>
                    )}
                  </div>

                  {imageError && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-[#E50914] text-xs font-semibold animate-in fade-in">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{imageError}</span>
                    </div>
                  )}
                </div>

                {/* 3. Audio & Smart OS */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#E50914]" />
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        Audio, Display Tech &amp; Smart OS
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Step 3 of 5</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Display Resolution <span className="text-[#E50914]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        placeholder="e.g. 4K UHD Resolution"
                        value={newProduct.resolution}
                        onChange={(e) => setNewProduct({ ...newProduct, resolution: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Sound Output System
                      </label>
                      <input
                        type="text"
                        autoComplete="off"
                        placeholder="e.g. 2 x 15W Dolby Audio Speakers"
                        value={newProduct.sound}
                        onChange={(e) => setNewProduct({ ...newProduct, sound: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Smart Operating System
                      </label>
                      <input
                        type="text"
                        autoComplete="off"
                        placeholder="e.g. Google TV"
                        value={newProduct.smartOS}
                        onChange={(e) => setNewProduct({ ...newProduct, smartOS: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Backlight / Display Tech
                      </label>
                      <input
                        type="text"
                        autoComplete="off"
                        placeholder="e.g. Ultra Bright D-LED"
                        value={newProduct.displayTech}
                        onChange={(e) => setNewProduct({ ...newProduct, displayTech: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914] transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Connectivity Specs */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#E50914]" />
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        Hardware &amp; Connectivity Specs
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Step 4 of 5</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Refresh Rate
                      </label>
                      <input
                        type="text"
                        autoComplete="off"
                        placeholder="e.g. 60 Hz Native"
                        value={newProduct.refreshRate}
                        onChange={(e) => setNewProduct({ ...newProduct, refreshRate: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Panel Type
                      </label>
                      <input
                        type="text"
                        autoComplete="off"
                        placeholder="e.g. A+ Grade IPS Bezel-Less"
                        value={newProduct.panelType}
                        onChange={(e) => setNewProduct({ ...newProduct, panelType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        HDMI Ports
                      </label>
                      <input
                        type="text"
                        autoComplete="off"
                        placeholder="e.g. 3 x HDMI (ARC Supported)"
                        value={newProduct.hdmiPorts}
                        onChange={(e) => setNewProduct({ ...newProduct, hdmiPorts: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        USB Ports
                      </label>
                      <input
                        type="text"
                        autoComplete="off"
                        placeholder="e.g. 2 x USB 2.0 High Speed"
                        value={newProduct.usbPorts}
                        onChange={(e) => setNewProduct({ ...newProduct, usbPorts: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Wireless Connectivity &amp; Bluetooth
                    </label>
                    <input
                      type="text"
                      autoComplete="off"
                      placeholder="e.g. Dual-band Wi-Fi & Bluetooth 5.0"
                      value={newProduct.wireless}
                      onChange={(e) => setNewProduct({ ...newProduct, wireless: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914] transition-all"
                    />
                  </div>
                </div>

                {/* 5. Features & Warranty */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#E50914]" />
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        Key Features &amp; Warranty Policy
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Step 5 of 5</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Key Bullet Points (One per line)
                    </label>
                    <textarea
                      rows={3}
                      autoComplete="off"
                      value={newProduct.keyFeaturesText}
                      onChange={(e) => setNewProduct({ ...newProduct, keyFeaturesText: e.target.value })}
                      placeholder={'Cinema-Grade Visuals & Brilliant Contrast\nUltra-wide 178° viewing angle\nHDR10 and HLG decoding'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914] transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        What&apos;s Included In The Box (One item per line)
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">e.g. 55&quot; Smart TV, Voice Remote, Wall Mount</span>
                    </div>
                    <textarea
                      rows={3}
                      autoComplete="off"
                      value={newProduct.whatsIncludedText}
                      onChange={(e) => setNewProduct({ ...newProduct, whatsIncludedText: e.target.value })}
                      placeholder={'55" Smart TV\nVoice Remote + AAA Batteries\nWall Mount Bracket\nTable Top Stands\nPower Cable & Adapter\nWarranty Card & User Manual'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Warranty &amp; Installation Promise
                    </label>
                    <textarea
                      rows={2}
                      autoComplete="off"
                      value={newProduct.warrantyInstallation}
                      onChange={(e) => setNewProduct({ ...newProduct, warrantyInstallation: e.target.value })}
                      placeholder="Complimentary Doorstep Installation Process within 48 hours. 1 Year Comprehensive Brand Warranty + 1 Year Additional on Display Panel."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914] transition-all"
                    />
                  </div>
                </div>

              </div>

              {/* Sticky Footer */}
              <div className="px-6 py-4 sm:px-7 sm:py-4.5 border-t border-slate-100 bg-slate-50/90 flex-shrink-0 flex items-center justify-between gap-3 z-10">
                <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                  Fields marked with <span className="text-[#E50914] font-bold">*</span> are required
                </span>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetProductForm();
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white font-bold text-xs cursor-pointer shadow-sm hover:shadow transition-all active:scale-95"
                  >
                    {editingProduct ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{editingProduct ? 'Update TV Model' : 'Save TV Model'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

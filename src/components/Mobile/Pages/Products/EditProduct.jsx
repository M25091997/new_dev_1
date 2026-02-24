import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Upload, Copy, Plus, X, Save, Trash2, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Editor } from '@tinymce/tinymce-react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getSellerCategoriesForProduct, getSellerTaxes, getAllBrands, getAllColors, getAllSizes, getAllMaterials, getAllPatterns, getAllUnits, getAllCountries, getAllTags, getAllWarranties, getAllProductAttributes, getProductById, updateProduct } from '../../../../api/api';
import { generateSlug } from '../../../../helper/helper';
import { useToast } from '../../../../contexts/ToastContext';

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [variants, setVariants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const [categoriesSearchTerm, setCategoriesSearchTerm] = useState('');
  const [taxes, setTaxes] = useState([]);
  const [taxesLoading, setTaxesLoading] = useState(true);
  const [brands, setBrands] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [colors, setColors] = useState([]);
  const [colorsLoading, setColorsLoading] = useState(true);
  const [sizes, setSizes] = useState([]);
  const [sizesLoading, setSizesLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [patterns, setPatterns] = useState([]);
  const [patternsLoading, setPatternsLoading] = useState(true);
  const [units, setUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [tags, setTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);
  const [warranties, setWarranties] = useState([]);
  const [warrantiesLoading, setWarrantiesLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [productData, setProductData] = useState(null);
  const [existingMainImageUrl, setExistingMainImageUrl] = useState(null);
  const [existingMainImageId, setExistingMainImageId] = useState(null);
  const [existingOtherImagesUrls, setExistingOtherImagesUrls] = useState([]);
  const [existingOtherImagesData, setExistingOtherImagesData] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const mainImageInputRef = useRef(null);
  const otherImagesInputRef = useRef(null);
  const { showError, showSuccess } = useToast();

  // Specifications / Attributes state
  const [allAttributes, setAllAttributes] = useState([]);
  const [attributesLoading, setAttributesLoading] = useState(true);
  const [specValues, setSpecValues] = useState({});

  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    variants: false,
    specifications: false,
    settings: false
  });
  
  // Get user data from Redux store
  const { user, token } = useSelector(state => state.user);
  const [formData, setFormData] = useState({
    // Basic Product Info
    productName: '',
    category: '',
    tags: [],
    warranty: '',
    slug: '',
    tax: '',
    brands: '',
    accessoriesWarranty: '',
    description: '',
    mainImage: null,
    otherImages: [],
    
    // Product Settings
    productType: '',
    madeIn: '',
    isReturnable: 'No',
    isCancellable: 'No',
    maxReturnDays: '',
    tillWhichStatus: '',
    manufacturer: '',
    sku: '',
    hsnCode: '',
    fssaiLicNo: '',
    selfLife: '',
    isCodAllowed: 'No',
    totalAllowedQuantity: 0,
    deliveryOption: 'pay_by_yourself',
    deliveryCharges: '0'
  });

  const [currentVariant, setCurrentVariant] = useState({
    variant_id: '', // Empty for new products, will be set for existing products
    type: 'Packet',
    stockLimit: 'Limited',
    measurement: '0',
    variantType: '',
    material: '',
    weightInGrams: '',
    height: '',
    price: '0.00',
    unit: '',
    productTitle: '',
    color: '',
    pattern: '',
    capacity: '',
    mattressSize: '',
    discountedPrice: '0.00',
    status: '',
    pack: '',
    size: '',
    noOfPics: '',
    dimensions: '',
    flavour: '',
    stock: '0',
    variantImages: []
  });

  // Fetch all reference data
  useEffect(() => {
    if (token && user?.seller?.id) {
      fetchAllReferenceData();
    }
  }, [token, user?.seller?.id]);

  // Gate: Load product only after all reference lists are loaded
  const [refsLoaded, setRefsLoaded] = useState(false);
  const hasRequestedProduct = useRef(false);

  useEffect(() => {
    if (!token) return;
    const allLoaded =
      !categoriesLoading &&
      !taxesLoading &&
      !brandsLoading &&
      !colorsLoading &&
      !sizesLoading &&
      !materialsLoading &&
      !patternsLoading &&
      !unitsLoading &&
      !countriesLoading &&
      !tagsLoading &&
      !warrantiesLoading;
    if (allLoaded) {
      setRefsLoaded(true);
    }
  }, [
    token,
    categoriesLoading,
    taxesLoading,
    brandsLoading,
    colorsLoading,
    sizesLoading,
    materialsLoading,
    patternsLoading,
    unitsLoading,
    countriesLoading,
    tagsLoading,
    warrantiesLoading
  ]);

  useEffect(() => {
    if (productId && token && refsLoaded && !hasRequestedProduct.current) {
      hasRequestedProduct.current = true;
      loadProductData();
    }
  }, [productId, token, refsLoaded]);

  const fetchAllReferenceData = async () => {
    try {
      // Fetch categories
      setCategoriesLoading(true);
      const categoriesResponse = await getSellerCategoriesForProduct(user?.seller?.id, token);
      if (categoriesResponse && typeof categoriesResponse === 'string') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(categoriesResponse, 'text/html');
        const options = doc.querySelectorAll('option');
        const categoriesList = Array.from(options).map(option => {
          const text = option.textContent.trim();
          const level = (text.match(/&nbsp;/g) || []).length;
          const cleanText = text.replace(/&nbsp;/g, '').trim();
          return {
            value: option.value,
            text: cleanText,
            level: level
          };
        }).filter(category => category.value && category.text);
        setCategories(categoriesList);
      }
      setCategoriesLoading(false);

      // Fetch taxes
      setTaxesLoading(true);
      const taxesResponse = await getSellerTaxes(token);
      if (taxesResponse && taxesResponse.data) {
        setTaxes(taxesResponse.data);
      }
      setTaxesLoading(false);

      // Fetch brands
      setBrandsLoading(true);
      const brandsResponse = await getAllBrands(token);
      if (brandsResponse && brandsResponse.data) {
        setBrands(brandsResponse.data);
      }
      setBrandsLoading(false);

      // Fetch colors
      setColorsLoading(true);
      const colorsResponse = await getAllColors(token);
      if (colorsResponse && colorsResponse.data) {
        setColors(colorsResponse.data);
      }
      setColorsLoading(false);

      // Fetch sizes
      setSizesLoading(true);
      const sizesResponse = await getAllSizes(token);
      if (sizesResponse && sizesResponse.data) {
        setSizes(sizesResponse.data);
      }
      setSizesLoading(false);

      // Fetch materials
      setMaterialsLoading(true);
      const materialsResponse = await getAllMaterials(token);
      if (materialsResponse && materialsResponse.data) {
        setMaterials(materialsResponse.data);
      }
      setMaterialsLoading(false);

      // Fetch patterns
      setPatternsLoading(true);
      const patternsResponse = await getAllPatterns(token);
      if (patternsResponse && patternsResponse.data) {
        setPatterns(patternsResponse.data);
      }
      setPatternsLoading(false);

      // Fetch units
      setUnitsLoading(true);
      const unitsResponse = await getAllUnits(token);
      if (unitsResponse && unitsResponse.data) {
        setUnits(unitsResponse.data);
      }
      setUnitsLoading(false);

      // Fetch countries
      setCountriesLoading(true);
      const countriesResponse = await getAllCountries(token);
      if (countriesResponse && countriesResponse.data) {
        setCountries(countriesResponse.data);
      }
      setCountriesLoading(false);

      // Fetch tags
      setTagsLoading(true);
      const tagsResponse = await getAllTags(token);
      if (tagsResponse && tagsResponse.data) {
        setTags(tagsResponse.data);
      }
      setTagsLoading(false);

      // Fetch warranties
      setWarrantiesLoading(true);
      const warrantiesResponse = await getAllWarranties(token);
      if (warrantiesResponse && warrantiesResponse.data) {
        setWarranties(warrantiesResponse.data);
      }
      setWarrantiesLoading(false);

      // Fetch attributes
      setAttributesLoading(true);
      const attributesResponse = await getAllProductAttributes(token);
      if (attributesResponse && Array.isArray(attributesResponse.data)) {
        setAllAttributes(attributesResponse.data);
      }
      setAttributesLoading(false);

    } catch (error) {
      console.error('Error fetching reference data:', error);
      showError('Error', 'Failed to load some data. Please refresh the page.');
    }
  };

  const loadProductData = async () => {
    try {
      setIsLoading(true);
      const response = await getProductById(token, productId);
      
      if (response.status === 1 && response.data) {
        const product = response.data;
        setProductData(product);
        
        // Populate form data
        setFormData({
          productName: product.name || '',
          category: product.category_id ? String(product.category_id) : '',
          tags: product.tags ? product.tags.map(tag => tag.id) : [],
          warranty: product.warranty_id ? String(product.warranty_id) : '',
          slug: product.slug || '',
          tax: product.tax_id ? String(product.tax_id) : '',
          brands: Number(product.brand_id) > 0 ? String(product.brand_id) : '',
          accessoriesWarranty: product.accessories_warranty_id ? String(product.accessories_warranty_id) : '',
          description: product.description || '',
          mainImage: null,
          otherImages: [],
          
          // Product Settings
          productType: product.type || 'packet',
          madeIn: product.made_in ? String(product.made_in) : '',
          isReturnable: product.return_status ? 'Yes' : 'No',
          isCancellable: product.cancelable_status ? 'Yes' : 'No',
          maxReturnDays: product.return_days || '',
          tillWhichStatus: product.till_status || '',
          manufacturer: product.manufacturer || '',
          sku: product.sku || '',
          hsnCode: product.hsn_code || '',
          fssaiLicNo: product.fssai_lic_no || '',
          selfLife: product.self_life || '',
          isCodAllowed: product.cod_allowed ? 'Yes' : 'No',
          totalAllowedQuantity: product.total_allowed_quantity || 0,
          deliveryOption: product.delivery_option || 'pay_by_yourself',
          deliveryCharges: product.delivery_charges || '0'
        });

        // Prefill specification values
        if (Array.isArray(product.specifications)) {
          const mapped = {};
          product.specifications.forEach(spec => {
            if (spec && spec.attribute_id !== undefined) {
              mapped[String(spec.attribute_id)] = spec.value ?? '';
            }
          });
          setSpecValues(mapped);
        }

        // Populate variants
        if (product.variants && product.variants.length > 0) {
          const productStockLimit = product.is_unlimited_stock ? 'Unlimited' : 'Limited';
          const formattedVariants = product.variants.map((variant, index) => ({
            id: variant.id || Date.now() + index, // Internal tracking ID
            variant_id: variant.id, // Database ID for API
            productTitle: variant.title || '', // Product title from API
            type: (variant.type || 'packet').toLowerCase() === 'loose' ? 'Loose' : 'Packet',
            stockLimit: productStockLimit,
            measurement: variant.measurement !== undefined && variant.measurement !== null ? String(variant.measurement) : '0',
            variantType: variant.pd_type || '',
            material: variant.material || '',
            weightInGrams: variant.weight_in_grams !== undefined && variant.weight_in_grams !== null ? String(variant.weight_in_grams) : '',
            height: variant.height !== undefined && variant.height !== null ? String(variant.height) : '',
            price: variant.price !== undefined && variant.price !== null ? String(variant.price) : '0.00',
            discountedPrice: variant.discounted_price !== undefined && variant.discounted_price !== null ? String(variant.discounted_price) : '0.00',
            stock: variant.stock !== undefined && variant.stock !== null ? String(variant.stock) : '0',
            unit: variant.stock_unit_id ? String(variant.stock_unit_id) : '',
            status: variant.status ? 'active' : 'inactive',
            color: variant.color_id ? String(variant.color_id) : '',
            size: variant.size_id ? String(variant.size_id) : '',
            pattern: variant.pattern_id ? String(variant.pattern_id) : '',
            pack: variant.pack !== undefined && variant.pack !== null ? String(variant.pack) : '',
            capacity: variant.capacity !== undefined && variant.capacity !== null ? String(variant.capacity) : '',
            dimensions: variant.dimensions || '',
            flavour: variant.flavour || '',
            mattressSize: variant.mattress_size || '',
            noOfPics: variant.no_of_pics !== undefined && variant.no_of_pics !== null ? String(variant.no_of_pics) : '0',
            variantImages: variant.images || []
          }));
          if (formattedVariants.length > 0) {
            setCurrentVariant(prev => ({ ...prev, ...formattedVariants[0] }));
            setVariants(formattedVariants.slice(1));
          }
        }

        // Set existing image URLs
        if (product.image_url) {
          setExistingMainImageUrl(product.image_url);
          if (product.image_id) {
            setExistingMainImageId(product.image_id);
          }
        }
        
        // Handle other_images
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
          const otherImagesData = product.images.map(img => ({
            url: img.image_url || img.url || img,
            id: img.id || null
          })).filter(item => item.url);
          setExistingOtherImagesUrls(otherImagesData.map(img => img.url));
          setExistingOtherImagesData(otherImagesData);
        }

        // Set selected values
        if (product.brand_id) {
          setSelectedBrand({ id: product.brand_id, name: product.brand?.name || '' });
        }
        if (product.tags && product.tags.length > 0) {
          setSelectedTags(product.tags);
        }
      }
    } catch (error) {
      console.error('Error loading product data:', error);
      showError('Error', 'Failed to load product data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Derived: attributes filtered by selected category
  const filteredAttributes = React.useMemo(() => {
    if (!formData.category || !Array.isArray(allAttributes) || allAttributes.length === 0) return [];
    const categoryId = String(formData.category);
    return allAttributes.filter(attr => {
      const ids = String(attr.category_ids || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      return ids.includes(categoryId);
    });
  }, [formData.category, allAttributes]);

  const handleSpecChange = (attributeId, value) => {
    setSpecValues(prev => ({ ...prev, [String(attributeId)]: value }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updatedData = { ...prev, [field]: value };
      
      // Auto-generate slug when product name changes
      if (field === 'productName') {
        updatedData.slug = generateSlug(value);
      }
      
      return updatedData;
    });
  };

  const handleVariantChange = (field, value) => {
    setCurrentVariant(prev => ({ ...prev, [field]: value }));
  };

  const addVariant = () => {
    // DO NOT modify currentVariant, just add a new empty variant to variants array
    const defaultType = currentVariant.type || 'Packet';
    const defaultStockLimit = currentVariant.stockLimit || 'Limited';
    
    const newEmptyVariant = {
      id: Date.now(),
      variant_id: '', // Empty for new variants
      type: defaultType,
      stockLimit: defaultStockLimit,
        measurement: '0',
        variantType: '',
        material: '',
        weightInGrams: '',
        height: '',
        price: '0.00',
        unit: '',
      productTitle: '',
        color: '',
        pattern: '',
        capacity: '',
      mattressSize: '',
      discountedPrice: '0.00',
      status: 'active',
      pack: '',
      size: '',
      noOfPics: '',
        dimensions: '',
        flavour: '',
      stock: '0',
        variantImages: []
    };
    
    setVariants(prev => [...prev, newEmptyVariant]);
    
    // Scroll to bottom to show the new variant
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const copyVariant = (variant) => {
    // Create a copy with a new ID and remove variant_id to make it a new variant
    const copiedVariant = { 
      ...variant, 
      id: Date.now(),
      variant_id: '' // Empty for new variants (copied variants are treated as new)
    };
    
    // Add the copied variant to the END of variants array
    // DO NOT modify currentVariant
    setVariants(prev => [...prev, copiedVariant]);
    
    // Scroll to bottom to show the copied variant
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const deleteVariant = (variantId) => {
    setVariants(prev => prev.filter(v => v.id !== variantId));
  };

  const handleImageUpload = (files, type) => {
    if (!files || files.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    
    const invalidFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isValidType = allowedTypes.includes(file.type.toLowerCase()) || 
                         /\.(jpeg|jpg|png|gif)$/i.test(file.name);
      
      if (!isValidType) {
        invalidFiles.push(file.name);
      }
    }

    if (invalidFiles.length > 0) {
      showError(
        'Invalid File Type',
        `The following files are not allowed: ${invalidFiles.join(', ')}. Please upload only JPEG, JPG, PNG, or GIF files.`
      );
      return;
    }

    if (type === 'mainImage') {
      setFormData(prev => ({ ...prev, mainImage: files[0] }));
      if (existingMainImageUrl) {
        setExistingMainImageUrl(null);
        if (existingMainImageId) {
          setDeletedImageIds(prev => [...prev, existingMainImageId]);
        }
      }
    } else if (type === 'otherImages') {
      setFormData(prev => ({ ...prev, otherImages: [...prev.otherImages, ...files] }));
    } else if (type === 'variantImages') {
      setCurrentVariant(prev => ({ ...prev, variantImages: [...prev.variantImages, ...files] }));
    }
  };

  const removeImage = (index, type) => {
    if (type === 'otherImages') {
      if (index < existingOtherImagesUrls.length) {
        const imageData = existingOtherImagesData[index];
        setExistingOtherImagesUrls(prev => prev.filter((_, i) => i !== index));
        setExistingOtherImagesData(prev => prev.filter((_, i) => i !== index));
        if (imageData?.id) {
          setDeletedImageIds(prev => [...prev, imageData.id]);
        }
      } else {
        const adjustedIndex = index - existingOtherImagesUrls.length;
        setFormData(prev => ({
          ...prev,
          otherImages: prev.otherImages.filter((_, i) => i !== adjustedIndex)
        }));
      }
    } else if (type === 'variantImages') {
      setCurrentVariant(prev => ({
        ...prev,
        variantImages: prev.variantImages.filter((_, i) => i !== index)
      }));
    }
  };

  const removeMainImage = () => {
    if (existingMainImageUrl) {
      setExistingMainImageUrl(null);
      if (existingMainImageId) {
        setDeletedImageIds(prev => [...prev, existingMainImageId]);
      }
      setExistingMainImageId(null);
    } else {
      setFormData(prev => ({ ...prev, mainImage: null }));
    }
  };

  const handleSaveProduct = async () => {
    try {
      setIsSaving(true);
      setSaveMessage('');
      setSaveError('');

      const response = await updateProduct(token, {
        id: productId,
        name: formData.productName,
        slug: formData.slug,
        seller_id: user?.seller?.id || user?.id || '',
        tag_ids: Array.isArray(formData.tags) ? formData.tags.join(',') : formData.tags,
        tax_id: formData.tax,
        brand_id: formData.brands,
        description: formData.description,
        type: "packet",
        is_unlimited_stock: variants.some(v => v.stockLimit === 'Unlimited') ? '1' : '0',
        fssai_lic_no: formData.fssaiLicNo,
        warranty_id: formData.warranty,
        accessories_warranty_id: formData.accessoriesWarranty,
        category_id: formData.category,
        product_type: '0',
        manufacturer: formData.manufacturer,
        made_in: formData.madeIn,
        shipping_type: 'undefined',
        pincode_ids_exc: 'null',
        return_status: formData.isReturnable === 'Yes' ? '1' : '0',
        return_days: formData.isReturnable === 'Yes' ? (formData.maxReturnDays || '0') : '0',
        cancelable_status: formData.isCancellable === 'Yes' ? '1' : '0',
        till_status: formData.isCancellable === 'Yes' ? (formData.tillWhichStatus || '1') : 'null',
        cod_allowed_status: formData.isCodAllowed === 'Yes' ? '1' : '0',
        max_allowed_quantity: formData.totalAllowedQuantity || '10',
        delivery_option: formData.deliveryOption || 'pay_by_yourself',
        delivery_charges: formData.deliveryOption === 'add_delivery_charge' ? (formData.deliveryCharges || '0') : '0',
        is_approved: '0',
        tax_included_in_price: '0',
        sku: formData.sku || 'null',
        hsn_code: formData.hsnCode,
        self_life: formData.selfLife || '',
        no_of_pics: '0',
        weight_in_grams: '0',
        loose_stock: '0',
        loose_stock_unit_id: '',
        status: '1',
        
        image: formData.mainImage,
        other_images: formData.otherImages,
        deleteImageIds: deletedImageIds,

        product_attributes: specValues,
        
        variants: [currentVariant, ...variants]
      });

      if (response.status === 1) {
        setSaveMessage(response.message || 'Product updated successfully!');
        showSuccess('Success', response.message || 'Product updated successfully!');
        setTimeout(() => {
          navigate('/products/manage');
        }, 2000);
      } else {
        const errorMessage = response.message || 'Failed to update product';
        setSaveError(errorMessage);
        showError('Update Failed', errorMessage);
      }
    } catch (error) {
      console.error('Save product error:', error);
      const errorMessage = error.message || 'Failed to save product. Please try again.';
      setSaveError(errorMessage);
      showError('Error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm">Loading product data...</p>
        </div>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 text-sm">Product not found</p>
          <button 
            onClick={() => navigate('/products/manage')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const validateBasicInfo = () => {
    const errors = [];
    if (!formData.productName.trim()) errors.push('Product Name');
    if (!formData.slug) errors.push('Slug');
    if (!formData.category) errors.push('Category');
    if (!formData.description.trim()) errors.push('Description');
    if (!formData.mainImage && !existingMainImageUrl) errors.push('Main Image');
    
    if (errors.length > 0) {
      showError('Missing Required Fields', `Please fill: ${errors.join(', ')}`);
      return false;
    }
    return true;
  };

  const validateVariant = () => {
    const errors = [];
    if (!currentVariant.measurement.trim()) errors.push('Measurement');
    if (!currentVariant.price || currentVariant.price === '0.00') errors.push('Price');
    if (!currentVariant.unit) errors.push('Unit');
    if (!currentVariant.status) errors.push('Status');
    if (!currentVariant.size) errors.push('Size');
    if (currentVariant.stockLimit === 'Limited' && (!currentVariant.stock || currentVariant.stock === '0')) {
      errors.push('Stock');
    }
    
    if (errors.length > 0) {
      showError('Missing Required Fields', `Please fill: ${errors.join(', ')}`);
      return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <button
                onClick={() => navigate('/products/manage')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
                <h1 className="text-base font-bold text-gray-900">Edit Product</h1>
                <p className="text-xs text-gray-600">{formData.productName || 'Update product'}</p>
            </div>
          </div>
          </div>

          {/* Step Progress */}
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex-1 flex items-center">
                <div className={`flex-1 h-1 rounded ${currentStep >= step ? 'bg-blue-600' : 'bg-gray-300'}`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-600">Basic</span>
            <span className="text-xs text-gray-600">Variant</span>
            <span className="text-xs text-gray-600">Specs</span>
            <span className="text-xs text-gray-600">Settings</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {saveMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-600" />
            <p className="text-green-800 text-sm">{saveMessage}</p>
          </div>
        )}

        {saveError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{saveError}</p>
          </div>
        )}

        {/* Step 1: Basic Product Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-blue-50">
                <h2 className="text-sm font-semibold text-gray-900">Basic Product Information</h2>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Enter product name"
              />
            </div>

                {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50"
                    placeholder="Auto-generated from product name"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Slug is auto-generated from product name</p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                    disabled={categoriesLoading}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                  >
                    <option value="">
                      {categoriesLoading ? 'Loading categories...' : '--Select Category--'}
                    </option>
                    {categories.map((category, index) => (
                      <option key={index} value={category.value}>
                        {category.text}
                  </option>
                ))}
              </select>
            </div>

                {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
              </label>
              <select
                onChange={(e) => {
                      const tagId = parseInt(e.target.value);
                      if (tagId && !formData.tags.includes(tagId)) {
                        handleInputChange('tags', [...formData.tags, tagId]);
                      }
                      e.target.value = '';
                    }}
                    disabled={tagsLoading}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                  >
                    <option value="">
                      {tagsLoading ? 'Loading tags...' : '--Select Tags--'}
                    </option>
                    {tags.map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                  </select>
                  
                  {/* Selected Tags */}
                  {formData.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.tags.map((tagId) => {
                        const tag = tags.find(t => t.id === tagId);
                        if (!tag) return null;
                        
                        return (
                          <div
                            key={tagId}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                          >
                            <span>{tag.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                handleInputChange('tags', formData.tags.filter(id => id !== tagId));
                              }}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Warranty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warranty
                  </label>
                  <select
                    value={formData.warranty}
                    onChange={(e) => handleInputChange('warranty', e.target.value)}
                    disabled={warrantiesLoading}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                  >
                    <option value="">
                      {warrantiesLoading ? 'Loading warranties...' : '--Select Warranty--'}
                    </option>
                    {warranties.map((warranty) => (
                      <option key={warranty.id} value={warranty.id}>
                        {warranty.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tax */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax
                  </label>
                  <select
                    value={formData.tax}
                    onChange={(e) => handleInputChange('tax', e.target.value)}
                    disabled={taxesLoading}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                  >
                    <option value="">
                      {taxesLoading ? 'Loading taxes...' : '--Select Tax--'}
                    </option>
                    {taxes.map((tax) => (
                      <option key={tax.id} value={tax.id || tax.value}>
                        {tax.name || tax.tax_name} ({tax.percentage || tax.rate}%)
                      </option>
                    ))}
                  </select>
                </div> */}

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <select
                    value={formData.brands}
                    onChange={(e) => handleInputChange('brands', e.target.value)}
                    disabled={brandsLoading}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                  >
                    <option value="">
                      {brandsLoading ? 'Loading brands...' : '--Select Brand--'}
                    </option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

                {/* Accessories Warranty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                    Accessories Warranty
              </label>
                  <select
                    value={formData.accessoriesWarranty}
                    onChange={(e) => handleInputChange('accessoriesWarranty', e.target.value)}
                    disabled={warrantiesLoading}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                  >
                    <option value="">
                      {warrantiesLoading ? 'Loading warranties...' : '--Select Accessories Warranty--'}
                    </option>
                    {warranties.map((warranty) => (
                      <option key={warranty.id} value={warranty.id}>
                        {warranty.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description?.replace(/<[^>]*>/g, '') || ''}
                    onChange={(e) => handleInputChange('description', `<p>${e.target.value}</p>`)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    rows="4"
                    placeholder="Enter product description"
                  />
                </div>

                {/* Main Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Main Image <span className="text-red-500">*</span>
                  </label>
                  <div 
                    onClick={() => mainImageInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
                  >
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-xs text-gray-600">Tap to upload</p>
              <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      onChange={(e) => handleImageUpload(e.target.files, 'mainImage')}
                      className="hidden"
                      ref={mainImageInputRef}
              />
            </div>
                  
                  {/* Show existing main image */}
                  {existingMainImageUrl && !formData.mainImage && (
                    <div className="mt-3 relative inline-block">
                      <img 
                        src={existingMainImageUrl} 
                        alt="Main product"
                        className="w-32 h-32 object-cover rounded-lg shadow"
                      />
                      <button
                        onClick={removeMainImage}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <p className="text-xs text-gray-600 text-center mt-1">Existing Image</p>
          </div>
                  )}
                  
                  {/* Show new uploaded main image */}
                  {formData.mainImage && (
                    <div className="mt-3 relative inline-block">
                      <img 
                        src={URL.createObjectURL(formData.mainImage)} 
                        alt="Main product preview"
                        className="w-32 h-32 object-cover rounded-lg shadow"
                      />
                      <button
                        onClick={removeMainImage}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Other Images */}
                <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                    Other Images
            </label>
                  <div 
                    onClick={() => otherImagesInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
                  >
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-xs text-gray-600">Tap to upload multiple</p>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      multiple
                      onChange={(e) => handleImageUpload(e.target.files, 'otherImages')}
                      className="hidden"
                      ref={otherImagesInputRef}
                    />
                  </div>
                  
                  {/* Show existing other images */}
                  {existingOtherImagesUrls.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {existingOtherImagesUrls.map((imageUrl, index) => (
                        <div key={`existing-${index}`} className="relative inline-block">
                          <img 
                            src={imageUrl} 
                            alt={`Product ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg shadow"
                          />
                          <button
                            onClick={() => removeImage(index, 'otherImages')}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Show new uploaded other images */}
                  {formData.otherImages.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formData.otherImages.map((file, index) => (
                        <div key={`new-${index}`} className="relative inline-block">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={`Product ${index + 1} preview`}
                            className="w-20 h-20 object-cover rounded-lg shadow"
                          />
                          <button
                            onClick={() => removeImage(existingOtherImagesUrls.length + index, 'otherImages')}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={() => {
                if (validateBasicInfo()) {
                  setCurrentStep(2);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              Next: Product Variant
            </button>
          </div>
        )}

        {/* Step 2: Product Variant */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-blue-50">
                <h2 className="text-sm font-semibold text-gray-900">Product Variant</h2>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Type and Stock Limit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="Packet"
                          checked={currentVariant.type === 'Packet'}
                          onChange={(e) => handleVariantChange('type', e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">Packet</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="Loose"
                          checked={currentVariant.type === 'Loose'}
                          onChange={(e) => handleVariantChange('type', e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">Loose</span>
                      </label>
          </div>
        </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Limit <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="Limited"
                          checked={currentVariant.stockLimit === 'Limited'}
                          onChange={(e) => handleVariantChange('stockLimit', e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">Limited</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="Unlimited"
                          checked={currentVariant.stockLimit === 'Unlimited'}
                          onChange={(e) => handleVariantChange('stockLimit', e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">Unlimited</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Measurement */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Measurement <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentVariant.measurement}
                    onChange={(e) => handleVariantChange('measurement', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter measurement"
                  />
                </div>

                {/* Variant Type (only if Packet) */}
                {currentVariant.type === 'Packet' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <input
                      type="text"
                      value={currentVariant.variantType}
                      onChange={(e) => handleVariantChange('variantType', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="e.g. V shape neck"
                    />
                  </div>
                )}

                {/* Material */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material
                  </label>
                  <select
                    value={currentVariant.material}
                    onChange={(e) => handleVariantChange('material', e.target.value)}
                    disabled={materialsLoading}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                  >
                    <option value="">
                      {materialsLoading ? 'Loading materials...' : '--Select Material--'}
                    </option>
                    {materials.map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Weight in Grams */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight in Grams
                  </label>
                  <input
                    type="text"
                    value={currentVariant.weightInGrams}
                    onChange={(e) => handleVariantChange('weightInGrams', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Weight in Grams"
                  />
                </div>

                {/* Height (only if Packet) */}
                {currentVariant.type === 'Packet' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height
                    </label>
                    <input
                      type="text"
                      value={currentVariant.height}
                      onChange={(e) => handleVariantChange('height', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Height"
                    />
                  </div>
                )}

                {/* Price and Discounted Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentVariant.price}
                      onChange={(e) => handleVariantChange('price', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discounted Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentVariant.discountedPrice}
                      onChange={(e) => handleVariantChange('discountedPrice', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={currentVariant.unit}
                    onChange={(e) => handleVariantChange('unit', e.target.value)}
                    disabled={unitsLoading}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                  >
                    <option value="">
                      {unitsLoading ? 'Loading units...' : '--Select Unit--'}
                    </option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.short_code} - {unit.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Title (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={currentVariant.productTitle}
                    onChange={(e) => handleVariantChange('productTitle', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter Product Title"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <select
                    value={currentVariant.color}
                    onChange={(e) => handleVariantChange('color', e.target.value)}
                    disabled={colorsLoading}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                  >
                    <option value="">
                      {colorsLoading ? 'Loading colors...' : '--Select Color--'}
                    </option>
                    {colors.map((color) => (
                      <option key={color.id} value={color.id}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pattern */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pattern
                  </label>
                  <select
                    value={currentVariant.pattern}
                    onChange={(e) => handleVariantChange('pattern', e.target.value)}
                    disabled={patternsLoading}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                  >
                    <option value="">
                      {patternsLoading ? 'Loading patterns...' : '--Select Pattern--'}
                    </option>
                    {patterns.map((pattern) => (
                      <option key={pattern.id} value={pattern.id}>
                        {pattern.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity
                  </label>
                  <input
                    type="text"
                    value={currentVariant.capacity}
                    onChange={(e) => handleVariantChange('capacity', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Capacity"
                  />
                </div>

                {/* Mattress Size (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mattress Size (Optional)
                  </label>
                  <input
                    type="text"
                    value={currentVariant.mattressSize}
                    onChange={(e) => handleVariantChange('mattressSize', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="e.g. 78x76x6"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={currentVariant.status}
                    onChange={(e) => handleVariantChange('status', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Select Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Pack (only if Packet) */}
                {currentVariant.type === 'Packet' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pack
                    </label>
                    <input
                      type="text"
                      value={currentVariant.pack}
                      onChange={(e) => handleVariantChange('pack', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="e.g. Pack Of 3"
                    />
                  </div>
                )}

                {/* Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={currentVariant.size}
                    onChange={(e) => handleVariantChange('size', e.target.value)}
                    disabled={sizesLoading}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                  >
                    <option value="">
                      {sizesLoading ? 'Loading sizes...' : '--Select Size--'}
                    </option>
                    {sizes.map((size) => (
                      <option key={size.id} value={size.id}>
                        {size.name} ({size.size_code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* No of pics */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No of pics
                  </label>
                  <input
                    type="text"
                    value={currentVariant.noOfPics}
                    onChange={(e) => handleVariantChange('noOfPics', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="No of pics"
                  />
                </div>

                {/* Dimensions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    value={currentVariant.dimensions}
                    onChange={(e) => handleVariantChange('dimensions', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Dimensions"
                  />
                </div>

                {/* Flavour (only if Packet) */}
                {currentVariant.type === 'Packet' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Flavour
                    </label>
                    <input
                      type="text"
                      value={currentVariant.flavour}
                      onChange={(e) => handleVariantChange('flavour', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Enter flavour"
                    />
                  </div>
                )}

                {/* Stock (if Limited) */}
                {currentVariant.stockLimit === 'Limited' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={currentVariant.stock}
                      onChange={(e) => handleVariantChange('stock', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                )}

                {/* Variant Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Variant Images
                  </label>
                  <div 
                    onClick={() => document.getElementById('variant-images')?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
                  >
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-xs text-gray-600">Tap to upload variant images</p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(e.target.files, 'variantImages')}
                      className="hidden"
                      id="variant-images"
                    />
                  </div>
                  
                  {currentVariant.variantImages.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {currentVariant.variantImages.map((file, index) => {
                        const imageUrl = file instanceof File ? URL.createObjectURL(file) : (typeof file === 'object' && file?.image_url ? file.image_url : file);
                        
                        return (
                          <div key={index} className="relative inline-block">
                            <img 
                              src={imageUrl} 
                              alt={`Variant ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-lg shadow"
                            />
                            <button
                              onClick={() => removeImage(index, 'variantImages')}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyVariant(currentVariant)}
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center space-x-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Variant</span>
                  </button>
                  <button
                    onClick={addVariant}
                    className="flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Variant</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Variants - Full Forms */}
            {variants.length > 0 && (
              <div className="space-y-4">
                {variants.map((variant, index) => {
                  const handleVariantFieldChange = (field, value) => {
                    setVariants(prev => prev.map(v =>
                      v.id === variant.id ? { ...v, [field]: value } : v
                    ));
                  };

                  return (
                    <div key={variant.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="p-4 border-b border-gray-200 bg-orange-50">
                        <div className="flex justify-between items-center">
                          <h2 className="text-sm font-semibold text-gray-900">Variant {index + 2}</h2>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => copyVariant(variant)}
                              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteVariant(variant.id)}
                              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-4">
                        {/* Type and Stock Limit */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Type <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  value="Packet"
                                  checked={variant.type === 'Packet'}
                                  onChange={(e) => handleVariantFieldChange('type', e.target.value)}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="ml-2 text-sm text-gray-700">Packet</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  value="Loose"
                                  checked={variant.type === 'Loose'}
                                  onChange={(e) => handleVariantFieldChange('type', e.target.value)}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="ml-2 text-sm text-gray-700">Loose</span>
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Stock Limit <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  value="Limited"
                                  checked={variant.stockLimit === 'Limited'}
                                  onChange={(e) => handleVariantFieldChange('stockLimit', e.target.value)}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="ml-2 text-sm text-gray-700">Limited</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  value="Unlimited"
                                  checked={variant.stockLimit === 'Unlimited'}
                                  onChange={(e) => handleVariantFieldChange('stockLimit', e.target.value)}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="ml-2 text-sm text-gray-700">Unlimited</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Measurement */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Measurement <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={variant.measurement}
                            onChange={(e) => handleVariantFieldChange('measurement', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Enter measurement"
                          />
                        </div>

                        {/* Variant Type (only if Packet) */}
                        {variant.type === 'Packet' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Type
                            </label>
                            <input
                              type="text"
                              value={variant.variantType}
                              onChange={(e) => handleVariantFieldChange('variantType', e.target.value)}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="e.g. V shape neck"
                            />
                          </div>
                        )}

                        {/* Material */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Material
                          </label>
                          <select
                            value={variant.material}
                            onChange={(e) => handleVariantFieldChange('material', e.target.value)}
                            disabled={materialsLoading}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                          >
                            <option value="">
                              {materialsLoading ? 'Loading materials...' : '--Select Material--'}
                            </option>
                            {materials.map((material) => (
                              <option key={material.id} value={material.id}>
                                {material.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Weight in Grams */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Weight in Grams
                          </label>
                          <input
                            type="text"
                            value={variant.weightInGrams}
                            onChange={(e) => handleVariantFieldChange('weightInGrams', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Weight in Grams"
                          />
                        </div>

                        {/* Height (only if Packet) */}
                        {variant.type === 'Packet' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Height
                            </label>
                            <input
                              type="text"
                              value={variant.height}
                              onChange={(e) => handleVariantFieldChange('height', e.target.value)}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="Height"
                            />
                          </div>
                        )}

                        {/* Price and Discounted Price */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Price (₹) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={variant.price}
                              onChange={(e) => handleVariantFieldChange('price', e.target.value)}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Discounted Price (₹)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={variant.discountedPrice}
                              onChange={(e) => handleVariantFieldChange('discountedPrice', e.target.value)}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                        </div>

                        {/* Unit */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unit <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={variant.unit}
                            onChange={(e) => handleVariantFieldChange('unit', e.target.value)}
                            disabled={unitsLoading}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                          >
                            <option value="">
                              {unitsLoading ? 'Loading units...' : '--Select Unit--'}
                            </option>
                            {units.map((unit) => (
                              <option key={unit.id} value={unit.id}>
                                {unit.short_code} - {unit.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Product Title (Optional) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product Title (Optional)
                          </label>
                          <input
                            type="text"
                            value={variant.productTitle}
                            onChange={(e) => handleVariantFieldChange('productTitle', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Enter Product Title"
                          />
                        </div>

                        {/* Color */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Color
                          </label>
                          <select
                            value={variant.color}
                            onChange={(e) => handleVariantFieldChange('color', e.target.value)}
                            disabled={colorsLoading}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                          >
                            <option value="">
                              {colorsLoading ? 'Loading colors...' : '--Select Color--'}
                            </option>
                            {colors.map((color) => (
                              <option key={color.id} value={color.id}>
                                {color.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Pattern */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pattern
                          </label>
                          <select
                            value={variant.pattern}
                            onChange={(e) => handleVariantFieldChange('pattern', e.target.value)}
                            disabled={patternsLoading}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                          >
                            <option value="">
                              {patternsLoading ? 'Loading patterns...' : '--Select Pattern--'}
                            </option>
                            {patterns.map((pattern) => (
                              <option key={pattern.id} value={pattern.id}>
                                {pattern.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Capacity */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Capacity
                          </label>
                          <input
                            type="text"
                            value={variant.capacity}
                            onChange={(e) => handleVariantFieldChange('capacity', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Capacity"
                          />
                        </div>

                        {/* Mattress Size (Optional) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mattress Size (Optional)
                          </label>
                          <input
                            type="text"
                            value={variant.mattressSize}
                            onChange={(e) => handleVariantFieldChange('mattressSize', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="e.g. 78x76x6"
                          />
                        </div>

                        {/* Status */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={variant.status}
                            onChange={(e) => handleVariantFieldChange('status', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          >
                            <option value="">Select Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>

                        {/* Pack (only if Packet) */}
                        {variant.type === 'Packet' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Pack
                            </label>
                            <input
                              type="text"
                              value={variant.pack}
                              onChange={(e) => handleVariantFieldChange('pack', e.target.value)}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="e.g. Pack Of 3"
                            />
                          </div>
                        )}

                        {/* Size */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Size <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={variant.size}
                            onChange={(e) => handleVariantFieldChange('size', e.target.value)}
                            disabled={sizesLoading}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                          >
                            <option value="">
                              {sizesLoading ? 'Loading sizes...' : '--Select Size--'}
                            </option>
                            {sizes.map((size) => (
                              <option key={size.id} value={size.id}>
                                {size.name} ({size.size_code})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* No of pics */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            No of pics
                          </label>
                          <input
                            type="text"
                            value={variant.noOfPics}
                            onChange={(e) => handleVariantFieldChange('noOfPics', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="No of pics"
                          />
                        </div>

                        {/* Dimensions */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dimensions
                          </label>
                          <input
                            type="text"
                            value={variant.dimensions}
                            onChange={(e) => handleVariantFieldChange('dimensions', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Dimensions"
                          />
                        </div>

                        {/* Flavour (only if Packet) */}
                        {variant.type === 'Packet' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Flavour
                            </label>
                            <input
                              type="text"
                              value={variant.flavour}
                              onChange={(e) => handleVariantFieldChange('flavour', e.target.value)}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="Enter flavour"
                            />
                          </div>
                        )}

                        {/* Stock (if Limited) */}
                        {variant.stockLimit === 'Limited' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Stock <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={variant.stock}
                              onChange={(e) => handleVariantFieldChange('stock', e.target.value)}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                        )}

                        {/* Variant Images */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Variant Images
                          </label>
                          <div 
                            onClick={() => document.getElementById(`variant-images-${variant.id}`)?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
                          >
                            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-xs text-gray-600">Tap to upload variant images</p>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => {
                                const files = Array.from(e.target.files);
                                setVariants(prev => prev.map(v =>
                                  v.id === variant.id ? { ...v, variantImages: [...v.variantImages, ...files] } : v
                                ));
                              }}
                              className="hidden"
                              id={`variant-images-${variant.id}`}
                            />
                          </div>
                          
                          {variant.variantImages?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {variant.variantImages.map((file, imgIdx) => {
                                const imageUrl = file instanceof File ? URL.createObjectURL(file) : (typeof file === 'object' && file?.image_url ? file.image_url : file);
                                
                                return (
                                  <div key={imgIdx} className="relative inline-block">
                                    <img 
                                      src={imageUrl} 
                                      alt={`Variant ${imgIdx + 1}`}
                                      className="w-20 h-20 object-cover rounded-lg shadow"
                                    />
                                    <button
                                      onClick={() => {
                                        setVariants(prev => prev.map(v =>
                                          v.id === variant.id ? {
                                            ...v,
                                            variantImages: v.variantImages.filter((_, i) => i !== imgIdx)
                                          } : v
                                        ));
                                      }}
                                      className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setCurrentStep(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  if (validateVariant()) {
                    setCurrentStep(3);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Next: Specifications
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Product Specifications */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-blue-50">
                <h2 className="text-sm font-semibold text-gray-900">Product Specifications</h2>
              </div>
              
              <div className="p-4">
                {attributesLoading && (
                  <div className="text-sm text-gray-600">Loading specifications...</div>
                )}

                {!attributesLoading && filteredAttributes.length === 0 && (
                  <div className="text-sm text-gray-600">No specifications available for the selected category.</div>
                )}

                {!attributesLoading && filteredAttributes.length > 0 && (
                  <div className="space-y-4">
                    {filteredAttributes.map((attr) => {
                      const attrId = String(attr.id);
                      const value = specValues[attrId] ?? '';
                      const isSelect = String(attr.type).toLowerCase() === 'select';
                      let options = [];
                      if (isSelect) {
                        try {
                          options = JSON.parse(attr.options || '[]');
                        } catch (e) {
                          options = [];
                        }
                      }
                      return (
                        <div key={attrId}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {attr.label || attr.name}
                          </label>
                          {isSelect ? (
                            <select
                              value={value}
                              onChange={(e) => handleSpecChange(attrId, e.target.value)}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                              <option value="">--Select--</option>
                              {options.map((opt, idx) => (
                                <option key={idx} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                    <input
                              type="text"
                              value={value}
                              onChange={(e) => handleSpecChange(attrId, e.target.value)}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder={`Enter ${attr.label || attr.name}`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setCurrentStep(2);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  setCurrentStep(4);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Next: Settings
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Product Settings */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-blue-50">
                <h2 className="text-sm font-semibold text-gray-900">Product Settings</h2>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Product Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Type
                  </label>
                  <select
                    value={formData.productType}
                    onChange={(e) => handleInputChange('productType', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Select Type</option>
                    <option value="physical">None</option>
                    <option value="digital">Veg</option>
                    <option value="service">Non-Veg</option>
                  </select>
                </div>

                {/* Made In */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Made In
                  </label>
                  <select
                    value={formData.madeIn}
                    onChange={(e) => handleInputChange('madeIn', e.target.value)}
                    disabled={countriesLoading}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                  >
                    <option value="">
                      {countriesLoading ? 'Loading countries...' : '--Select Country--'}
                    </option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name} ({country.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Manufacturer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter Manufacturer"
                    />
                  </div>

                {/* SKU */}
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU (Product Code)
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter SKU"
                  />
                </div>

                {/* HSN Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HSN Code
                  </label>
                  <input
                    type="text"
                    value={formData.hsnCode}
                    onChange={(e) => handleInputChange('hsnCode', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter HSN Code"
                  />
                </div>

                {/* FSSAI Lic. No. */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    FSSAI Lic. No.
                  </label>
                  <input
                    type="text"
                    value={formData.fssaiLicNo}
                    onChange={(e) => handleInputChange('fssaiLicNo', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="FSSAI Lic. No."
                  />
                </div>

                {/* Self Life */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shelf Life
                  </label>
                  <input
                    type="text"
                    value={formData.selfLife}
                    onChange={(e) => handleInputChange('selfLife', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter shelf life"
                  />
                </div>

                {/* Is Returnable */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Is Returnable?
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="No"
                        checked={formData.isReturnable === 'No'}
                        onChange={(e) => handleInputChange('isReturnable', e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="Yes"
                        checked={formData.isReturnable === 'Yes'}
                        onChange={(e) => handleInputChange('isReturnable', e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                  </div>
                </div>

                {/* Max Return Days */}
                {formData.isReturnable === 'Yes' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Return Days <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.maxReturnDays}
                      onChange={(e) => handleInputChange('maxReturnDays', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Enter max return days"
                      min="0"
                    />
                  </div>
                )}

                {/* Is Cancellable */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Is Cancellable?
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="No"
                        checked={formData.isCancellable === 'No'}
                        onChange={(e) => handleInputChange('isCancellable', e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="Yes"
                        checked={formData.isCancellable === 'Yes'}
                        onChange={(e) => handleInputChange('isCancellable', e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                </div>
                </div>

                {/* Till which status */}
                {formData.isCancellable === 'Yes' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Till which status? <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.tillWhichStatus}
                      onChange={(e) => handleInputChange('tillWhichStatus', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Select Order Status</option>
                      <option value="Payment Pending">Payment Pending</option>
                      <option value="Received">Received</option>
                      <option value="Processed">Processed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out For Delivery">Out For Delivery</option>
                    </select>
                  </div>
                )}

                {/* Is COD Allowed */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Is COD Allowed?
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="No"
                        checked={formData.isCodAllowed === 'No'}
                        onChange={(e) => handleInputChange('isCodAllowed', e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="Yes"
                        checked={formData.isCodAllowed === 'Yes'}
                        onChange={(e) => handleInputChange('isCodAllowed', e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                  </div>
                </div>

                {/* Total Allowed Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Allowed Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.totalAllowedQuantity}
                    onChange={(e) => handleInputChange('totalAllowedQuantity', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Keep blank if no such limit</p>
                </div>

                {/* Delivery Charges */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Charges
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="pay_by_yourself"
                        checked={formData.deliveryOption === 'pay_by_yourself'}
                        onChange={(e) => handleInputChange('deliveryOption', e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Pay By Yourself <span className="text-green-600 font-medium">(Recommended)</span></span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="add_delivery_charge"
                        checked={formData.deliveryOption === 'add_delivery_charge'}
                        onChange={(e) => handleInputChange('deliveryOption', e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Add delivery charge</span>
                    </label>
                    
                    {formData.deliveryOption === 'add_delivery_charge' && (
                      <div className="ml-6 mt-2">
                        <input
                          type="number"
                          value={formData.deliveryCharges}
                          onChange={(e) => handleInputChange('deliveryCharges', e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="Enter delivery charge amount"
                          min="0"
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter delivery charge amount in ₹</p>
              </div>
                    )}
            </div>
                </div>
              </div>
            </div>

            {/* Success/Error Messages */}
            {saveMessage && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">{saveMessage}</p>
              </div>
            )}
            {saveError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{saveError}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex space-x-2">
          <button
                onClick={() => {
                  setCurrentStep(3);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Previous
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={isSaving}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-sm flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Updating...' : 'Update Product'}</span>
          </button>
        </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProduct;

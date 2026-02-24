import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Upload, Copy, Plus, X, Save, Trash2, ChevronDown } from 'lucide-react';
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
  const [isBrandsDropdownOpen, setIsBrandsDropdownOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [brandsSearchTerm, setBrandsSearchTerm] = useState('');
  const [colors, setColors] = useState([]);
  const [colorsLoading, setColorsLoading] = useState(true);
  const [isColorsDropdownOpen, setIsColorsDropdownOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [colorsSearchTerm, setColorsSearchTerm] = useState('');
  const [sizes, setSizes] = useState([]);
  const [sizesLoading, setSizesLoading] = useState(true);
  const [isSizesDropdownOpen, setIsSizesDropdownOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizesSearchTerm, setSizesSearchTerm] = useState('');
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
  const [isTagsDropdownOpen, setIsTagsDropdownOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagsSearchTerm, setTagsSearchTerm] = useState('');
  const [warranties, setWarranties] = useState([]);
  const [warrantiesLoading, setWarrantiesLoading] = useState(true);
  const [isWarrantiesDropdownOpen, setIsWarrantiesDropdownOpen] = useState(false);
  const [warrantiesSearchTerm, setWarrantiesSearchTerm] = useState('');
  const [isAccessoriesWarrantyDropdownOpen, setIsAccessoriesWarrantyDropdownOpen] = useState(false);
  const [accessoriesWarrantySearchTerm, setAccessoriesWarrantySearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [productData, setProductData] = useState(null);
  const [existingMainImageUrl, setExistingMainImageUrl] = useState(null);
  const [existingMainImageId, setExistingMainImageId] = useState(null);
  const [existingOtherImagesUrls, setExistingOtherImagesUrls] = useState([]);
  const [existingOtherImagesData, setExistingOtherImagesData] = useState([]); // Array of {url, id}
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const mainImageInputRef = useRef(null);
  const otherImagesInputRef = useRef(null);
  const { showError, showSuccess } = useToast();

  // Specifications / Attributes state
  const [allAttributes, setAllAttributes] = useState([]);
  const [attributesLoading, setAttributesLoading] = useState(true);
  const [specValues, setSpecValues] = useState({}); // { [attribute_id]: value }

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

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Fetch seller categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      if (user?.seller?.id && token) {
        try {
          setCategoriesLoading(true);
          const response = await getSellerCategoriesForProduct(user?.seller?.id, token);

          if (response && typeof response === 'string') {
            // Parse the HTML response to extract categories
            const parser = new DOMParser();
            const doc = parser.parseFromString(response, 'text/html');
            const options = doc.querySelectorAll('option');

            const categoriesList = Array.from(options).map(option => {
              const text = option.textContent.trim();
              const level = (text.match(/&nbsp;/g) || []).length;
              // Clean up the text by removing HTML entities and extra spaces
              const cleanText = text.replace(/&nbsp;/g, '').trim();

              return {
                value: option.value,
                text: cleanText,
                level: level
              };
            }).filter(category => category.value && category.text); // Filter out empty entries

            setCategories(categoriesList);
          }
        } catch (error) {
          console.error('Error fetching categories:', error);
        } finally {
          setCategoriesLoading(false);
        }
      }
    };

    fetchCategories();
  }, [user?.id, token]);

  // Fetch seller taxes on component mount
  useEffect(() => {
    const fetchTaxes = async () => {
      if (token) {
        try {
          setTaxesLoading(true);
          const response = await getSellerTaxes(token);
          
          if (response && response.data) {
            setTaxes(response.data);
          }
        } catch (error) {
          console.error('Error fetching taxes:', error);
        } finally {
          setTaxesLoading(false);
        }
      }
    };

    fetchTaxes();
  }, [token]);

  // Fetch all brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      if (token) {
        try {
          setBrandsLoading(true);
          const response = await getAllBrands(token);
          
          if (response && response.data) {
            setBrands(response.data);
          }
        } catch (error) {
          console.error('Error fetching brands:', error);
          setBrands([]); // Set empty array on error
        } finally {
          setBrandsLoading(false);
        }
      }
    };

    fetchBrands();
  }, [token]);

  // Fetch all colors on component mount
  useEffect(() => {
    const fetchColors = async () => {
      if (token) {
        try {
          setColorsLoading(true);
          const response = await getAllColors(token);
          
          if (response && response.data) {
            setColors(response.data);
          }
        } catch (error) {
          console.error('Error fetching colors:', error);
          setColors([]); // Set empty array on error
        } finally {
          setColorsLoading(false);
        }
      }
    };

    fetchColors();
  }, [token]);

  // Fetch all sizes on component mount
  useEffect(() => {
    const fetchSizes = async () => {
      if (token) {
        try {
          setSizesLoading(true);
          const response = await getAllSizes(token);
          
          if (response && response.data) {
            setSizes(response.data);
          }
        } catch (error) {
          console.error('Error fetching sizes:', error);
          setSizes([]); // Set empty array on error
        } finally {
          setSizesLoading(false);
        }
      }
    };

    fetchSizes();
  }, [token]);

  // Fetch all materials on component mount
  useEffect(() => {
    const fetchMaterials = async () => {
      if (token) {
        try {
          setMaterialsLoading(true);
          const response = await getAllMaterials(token);
          
          if (response && response.data) {
            setMaterials(response.data);
          }
        } catch (error) {
          console.error('Error fetching materials:', error);
          setMaterials([]); // Set empty array on error
        } finally {
          setMaterialsLoading(false);
        }
      }
    };

    fetchMaterials();
  }, [token]);

  // Fetch all patterns on component mount
  useEffect(() => {
    const fetchPatterns = async () => {
      if (token) {
        try {
          setPatternsLoading(true);
          const response = await getAllPatterns(token);
          
          if (response && response.data) {
            setPatterns(response.data);
          }
        } catch (error) {
          console.error('Error fetching patterns:', error);
          setPatterns([]); // Set empty array on error
        } finally {
          setPatternsLoading(false);
        }
      }
    };

    fetchPatterns();
  }, [token]);

  // Fetch all units on component mount
  useEffect(() => {
    const fetchUnits = async () => {
      if (token) {
        try {
          setUnitsLoading(true);
          const response = await getAllUnits(token);
          
          if (response && response.data) {
            setUnits(response.data);
          }
        } catch (error) {
          console.error('Error fetching units:', error);
          setUnits([]); // Set empty array on error
        } finally {
          setUnitsLoading(false);
        }
      }
    };

    fetchUnits();
  }, [token]);

  // Fetch all countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      if (token) {
        try {
          setCountriesLoading(true);
          const response = await getAllCountries(token);
          
          if (response && response.data) {
            setCountries(response.data);
          }
        } catch (error) {
          console.error('Error fetching countries:', error);
          setCountries([]); // Set empty array on error
        } finally {
          setCountriesLoading(false);
        }
      }
    };

    fetchCountries();
  }, [token]);

  // Fetch all tags on component mount
  useEffect(() => {
    const fetchTags = async () => {
      if (token) {
        try {
          setTagsLoading(true);
          const response = await getAllTags(token);
          
          if (response && response.data) {
            setTags(response.data);
          }
        } catch (error) {
          console.error('Error fetching tags:', error);
          setTags([]); // Set empty array on error
        } finally {
          setTagsLoading(false);
        }
      }
    };

    fetchTags();
  }, [token]);

  // Fetch all warranties on component mount
  useEffect(() => {
    const fetchWarranties = async () => {
      if (token) {
        try {
          setWarrantiesLoading(true);
          const response = await getAllWarranties(token);
          
          if (response && response.data) {
            setWarranties(response.data);
          }
        } catch (error) {
          console.error('Error fetching warranties:', error);
          setWarranties([]); // Set empty array on error
        } finally {
          setWarrantiesLoading(false);
        }
      }
    };

    fetchWarranties();
  }, [token]);

  // Fetch all product attributes ASAP when page opens
  useEffect(() => {
    const fetchAttributes = async () => {
      if (!token) return;
      try {
        setAttributesLoading(true);
        const response = await getAllProductAttributes(token);
        if (response && Array.isArray(response.data)) {
          setAllAttributes(response.data);
        }
      } catch (error) {
        console.error('Error fetching product attributes:', error);
        setAllAttributes([]);
      } finally {
        setAttributesLoading(false);
      }
    };
    fetchAttributes();
  }, [token]);

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

  // Close categories dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isCategoriesDropdownOpen && !event.target.closest('.categories-dropdown')) {
        setIsCategoriesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoriesDropdownOpen]);

  // Close tags dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isTagsDropdownOpen && !event.target.closest('.tags-dropdown')) {
        setIsTagsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTagsDropdownOpen]);

  // Close warranties dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isWarrantiesDropdownOpen && !event.target.closest('.warranties-dropdown')) {
        setIsWarrantiesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isWarrantiesDropdownOpen]);

  // Close accessories warranty dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isAccessoriesWarrantyDropdownOpen && !event.target.closest('.accessories-warranty-dropdown')) {
        setIsAccessoriesWarrantyDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAccessoriesWarrantyDropdownOpen]);

  // Update selected brand when formData.brands changes
  useEffect(() => {
    if (formData.brands && brands.length > 0) {
      const brand = brands.find(brand => brand.id == formData.brands);
      setSelectedBrand(brand || null);
    } else {
      setSelectedBrand(null);
    }
  }, [formData.brands, brands]);

  // Close brands dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isBrandsDropdownOpen && !event.target.closest('.brands-dropdown')) {
        setIsBrandsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isBrandsDropdownOpen]);

  // Close colors dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isColorsDropdownOpen && !event.target.closest('.colors-dropdown')) {
        setIsColorsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isColorsDropdownOpen]);

  // Update selected color when currentVariant.color changes
  useEffect(() => {
    if (currentVariant.color && colors.length > 0) {
      const color = colors.find(color => color.id == currentVariant.color);
      setSelectedColor(color || null);
    } else {
      setSelectedColor(null);
    }
  }, [currentVariant.color, colors]);

  // Close sizes dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSizesDropdownOpen && !event.target.closest('.sizes-dropdown')) {
        setIsSizesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSizesDropdownOpen]);

  // Update selected size when currentVariant.size changes
  useEffect(() => {
    if (currentVariant.size && sizes.length > 0) {
      const size = sizes.find(size => size.id == currentVariant.size);
      setSelectedSize(size || null);
    } else {
      setSelectedSize(null);
    }
  }, [currentVariant.size, sizes]);

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
          mainImage: null, // Will be handled separately for existing images
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
        } else {
          setSpecValues({});
        }

        // Populate variants
        if (product.variants && product.variants.length > 0) {
          const productStockLimit = product.is_unlimited_stock ? 'Unlimited' : 'Limited';
          const formattedVariants = product.variants.map((variant, index) => ({
            id: variant.id || Date.now() + index, // Internal tracking ID
            variant_id: variant.id, // Database ID for API
            productTitle: variant.title || '', // Product title from API
            // Normalize API type ('packet'|'loose') to UI values ('Packet'|'Loose')
            type: (variant.type || 'packet').toLowerCase() === 'loose' ? 'Loose' : 'Packet',
            // Stock limit driven by product-level flag
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
          // Use first variant as the main (parent) currentVariant; others as additional variants
          if (formattedVariants.length > 0) {
            setCurrentVariant(prev => ({ ...prev, ...formattedVariants[0] }));
            setVariants(formattedVariants.slice(1));
          }
        }

        // Set existing image URLs
        if (product.image_url) {
          setExistingMainImageUrl(product.image_url);
          // Store image ID if available
          if (product.image_id) {
            setExistingMainImageId(product.image_id);
          }
        }
        
        // Handle other_images - could be array of image objects or null
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
          const otherImagesData = product.images.map(img => ({
            url: img.image_url || img.url || img,
            id: img.id || null
          })).filter(item => item.url);
          setExistingOtherImagesUrls(otherImagesData.map(img => img.url));
          setExistingOtherImagesData(otherImagesData);
        } else if (product.other_images) {
          // If other_images is a string or array
          if (Array.isArray(product.other_images)) {
            setExistingOtherImagesUrls(product.other_images);
            setExistingOtherImagesData(product.other_images.map(url => ({ url, id: null })));
          } else {
            setExistingOtherImagesUrls([product.other_images]);
            setExistingOtherImagesData([{ url: product.other_images, id: null }]);
          }
        }

        // Set selected values for dropdowns
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

  // Validation functions
  const validateStep1 = () => {
    const errors = [];
    
    if (!formData.productName.trim()) {
      errors.push('Product Name');
    }
    if (!formData.slug) {
      errors.push('Slug');
    }
    if (!formData.category) {
      errors.push('Category');
    }
    if (!formData.description.trim()) {
      errors.push('Description');
    }
    if (!formData.mainImage && !existingMainImageUrl) {
      errors.push('Main Image');
    }
    
    if (errors.length > 0) {
      showError(
        'Missing Required Fields',
        `Please fill the mandatory fields`
      );
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    const errors = [];
    
    if (!currentVariant.measurement.trim()) {
      errors.push('Measurement');
    }
    if (!currentVariant.price || currentVariant.price === '0.00') {
      errors.push('Price');
    }
    if (!currentVariant.unit) {
      errors.push('Unit');
    }
    if (!currentVariant.status) {
      errors.push('Status');
    }
    if (!currentVariant.size) {
      errors.push('Size');
    }
    if (currentVariant.stockLimit === 'Limited' && (!currentVariant.stock || currentVariant.stock === '0')) {
      errors.push('Stock');
    }
    
    if (errors.length > 0) {
      showError(
        'Missing Required Fields',
        `Please fill the following mandatory fields`
      );
      return false;
    }
    
    return true;
  };

  const addVariant = () => {    
    // IMPORTANT: DO NOT MODIFY currentVariant at all!
    // Just add a new empty variant to the variants array
    
    // Get type and stockLimit from currentVariant to maintain consistency
    const defaultType = currentVariant.type || 'Packet';
    const defaultStockLimit = currentVariant.stockLimit || 'Limited';
    
    // Create a completely new empty variant object
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
    // Add the new empty variant at the END of the variants array
    // DO NOT touch currentVariant at all
    setVariants(prev => {
      const newVariants = [...prev, newEmptyVariant];
      return newVariants;
    });
    
    // Scroll to the new variant form after a short delay to allow rendering
    setTimeout(() => {
      const variantForms = document.querySelectorAll('[data-variant-form]');
      console.log('Found variant forms:', variantForms.length);
      if (variantForms.length > 0) {
        const lastVariant = variantForms[variantForms.length - 1];
        lastVariant.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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
    setVariants(prev => {
      const newVariants = [...prev, copiedVariant];
      return newVariants;
    });
    
    
    // Scroll to the copied variant
    setTimeout(() => {
      const variantForms = document.querySelectorAll('[data-variant-form]');
      if (variantForms.length > 0) {
        const lastVariant = variantForms[variantForms.length - 1];
        lastVariant.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const deleteVariant = (variantId) => {
    setVariants(prev => prev.filter(v => v.id !== variantId));
  };

  const handleImageUpload = (files, type) => {
    if (!files || files.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    
    // Validate all files
    const invalidFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isValidType = allowedTypes.includes(file.type.toLowerCase()) || 
                         /\.(jpeg|jpg|png|gif)$/i.test(file.name);
      
      if (!isValidType) {
        invalidFiles.push(file.name);
      }
    }

    // Show error if any invalid files found
    if (invalidFiles.length > 0) {
      showError(
        'Invalid File Type',
        `The following files are not allowed: ${invalidFiles.join(', ')}. Please upload only JPEG, JPG, PNG, or GIF files.`
      );
      return;
    }

    if (type === 'mainImage') {
      setFormData(prev => ({ ...prev, mainImage: files[0] }));
      // Clear existing main image URL when new image is uploaded
      if (existingMainImageUrl) {
        setExistingMainImageUrl(null);
        // Add to deleted images if it has an ID
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

  const handleSaveProduct = async () => {
    try {
      setIsSaving(true);
      setSaveMessage('');
      setSaveError('');

      // Debug: Log what variants are being sent
      console.log('Current Variant:', currentVariant);
      console.log('Additional Variants:', variants);
      console.log('All Variants to be sent:', [currentVariant, ...variants]);

      const response = await updateProduct(token, {
        // Basic product information
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
        
        // Images
        image: formData.mainImage,
        other_images: formData.otherImages,
        deleteImageIds: deletedImageIds, // Images to delete
        
        // Product Attributes (Specifications)
        product_attributes: specValues,
        
        // Variants data - Include currentVariant as the first variant
        variants: [currentVariant, ...variants]
      });
      
      if (response.status === 1) {
        setSaveMessage(response.message || 'Product updated successfully!');
        showSuccess('Success', response.message || 'Product updated successfully!');
        // Optionally redirect to products list after a delay
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

  const removeImage = (index, type) => {
    if (type === 'otherImages') {
      // Check if it's an existing image URL or a new file
      if (index < existingOtherImagesUrls.length) {
        // Remove existing image URL
        const imageData = existingOtherImagesData[index];
        setExistingOtherImagesUrls(prev => prev.filter((_, i) => i !== index));
        setExistingOtherImagesData(prev => prev.filter((_, i) => i !== index));
        // If the image has an ID, add it to deleted images list
        if (imageData?.id) {
          setDeletedImageIds(prev => [...prev, imageData.id]);
        }
      } else {
        // Remove new file upload
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
      // Remove existing main image
      setExistingMainImageUrl(null);
      // If the image has an ID, add it to deleted images list
      if (existingMainImageId) {
        setDeletedImageIds(prev => [...prev, existingMainImageId]);
      }
      setExistingMainImageId(null);
    } else {
      // Remove new file upload
      setFormData(prev => ({ ...prev, mainImage: null }));
    }
  };

  // Helper function to render color preview
  const renderColorPreview = (color) => {
    let colorCodes = [];
    try {
      colorCodes = JSON.parse(color.color_code || '[]');
    } catch (error) {
      if (color.color_code && typeof color.color_code === 'string') {
        const hexMatches = color.color_code.match(/#[0-9A-Fa-f]{6}/g);
        if (hexMatches) {
          colorCodes = hexMatches;
        }
      }
    }

    if (colorCodes.length === 0) {
      return <div className="w-4 h-4 bg-gray-300 rounded border"></div>;
    }

    if (colorCodes.length === 1) {
      return (
        <div 
          className="w-4 h-4 rounded border"
          style={{ backgroundColor: colorCodes[0] }}
        ></div>
      );
    }

    // Multiple colors - create a gradient or show multiple circles
    if (colorCodes.length <= 3) {
      return (
        <div className="flex space-x-1">
          {colorCodes.map((code, index) => (
            <div
              key={index}
              className="w-3 h-3 rounded-full border"
              style={{ backgroundColor: code }}
            ></div>
          ))}
        </div>
      );
    }

    // Many colors - show first few with a "+" indicator
    return (
      <div className="flex space-x-1">
        {colorCodes.slice(0, 2).map((code, index) => (
          <div
            key={index}
            className="w-3 h-3 rounded-full border"
            style={{ backgroundColor: code }}
          ></div>
        ))}
        <div className="w-3 h-3 bg-gray-400 rounded-full border flex items-center justify-center">
          <span className="text-xs text-white">+</span>
        </div>
      </div>
    );
  };

  // Helper function to render individual variant form
  const renderVariantForm = (variant, index) => {
    console.log('renderVariantForm called with:', variant, index);
    const handleVariantFieldChange = (field, value) => {
      setVariants(prev => prev.map(v =>
        v.id === variant.id ? { ...v, [field]: value } : v
      ));
    };

    const getSelectedColor = () => {
      if (variant.color && colors.length > 0) {
        return colors.find(color => color.id == variant.color) || null;
      }
      return null;
    };

    const getSelectedSize = () => {
      if (variant.size && sizes.length > 0) {
        return sizes.find(size => size.id == variant.size) || null;
      }
      return null;
    };

    return (
      <div key={variant.id} data-variant-form className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Variant {index + 2}</h3>
        </div>

        {/* Main Form Fields - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Measurement <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={variant.measurement}
                onChange={(e) => handleVariantFieldChange('measurement', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {currentVariant.type === 'Packet' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <input
                  type="text"
                  value={variant.variantType}
                  onChange={(e) => handleVariantFieldChange('variantType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="e.g. V shape neck"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
              <select
                value={variant.material}
                onChange={(e) => handleVariantFieldChange('material', e.target.value)}
                disabled={materialsLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {materialsLoading ? 'Loading materials...' : '--Select Material--'}
                </option>
                {materials.map((material, index) => (
                  <option key={index} value={material.id}>
                    {material.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight in Grams</label>
              <input
                type="text"
                value={variant.weightInGrams}
                onChange={(e) => handleVariantFieldChange('weightInGrams', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Weight in Grams"
              />
            </div>

            {currentVariant.type === 'Packet' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                <input
                  type="text"
                  value={variant.height}
                  onChange={(e) => handleVariantFieldChange('height', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Height"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price () <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={variant.price}
                onChange={(e) => handleVariantFieldChange('price', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit <span className="text-red-500">*</span>
              </label>
              <select
                value={variant.unit}
                onChange={(e) => handleVariantFieldChange('unit', e.target.value)}
                disabled={unitsLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {unitsLoading ? 'Loading units...' : '--Select Unit--'}
                </option>
                {units.map((unit, index) => (
                  <option key={index} value={unit.id}>
                    {unit.short_code} - {unit.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Title (Optional)</label>
              <input
                type="text"
                value={variant.productTitle}
                onChange={(e) => handleVariantFieldChange('productTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter Product Title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <div className="relative colors-dropdown">
                <button
                  type="button"
                  onClick={() => setIsColorsDropdownOpen(!isColorsDropdownOpen)}
                  disabled={colorsLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white text-left flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    {getSelectedColor() ? (
                      <>
                        {renderColorPreview(getSelectedColor())}
                        <span className="text-gray-900">
                          {getSelectedColor().name}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-500">
                        {colorsLoading ? 'Loading colors...' : '--Select Color--'}
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isColorsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isColorsDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Search colors..."
                        value={colorsSearchTerm}
                        onChange={(e) => setColorsSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {colors
                      .filter(color => 
                        color.name.toLowerCase().includes(colorsSearchTerm.toLowerCase())
                      )
                      .map((color, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            handleVariantFieldChange('color', color.id);
                            setIsColorsDropdownOpen(false);
                            setColorsSearchTerm('');
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
                        >
                          {renderColorPreview(color)}
                          <span className="text-gray-700">{color.name}</span>
                        </button>
                      ))}
                    {colors.filter(color => 
                      color.name.toLowerCase().includes(colorsSearchTerm.toLowerCase())
                    ).length === 0 && (
                      <div className="px-3 py-2 text-gray-500 text-sm">
                        No colors found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pattern</label>
              <select
                value={variant.pattern}
                onChange={(e) => handleVariantFieldChange('pattern', e.target.value)}
                disabled={patternsLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {patternsLoading ? 'Loading patterns...' : '--Select Pattern--'}
                </option>
                {patterns.map((pattern, index) => (
                  <option key={index} value={pattern.id}>
                    {pattern.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
              <input
                type="text"
                value={variant.capacity}
                onChange={(e) => handleVariantFieldChange('capacity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Capacity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mattress Size (Optional)</label>
              <input
                type="text"
                value={variant.mattressSize}
                onChange={(e) => handleVariantFieldChange('mattressSize', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g. 78x76x6"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discounted Price ()</label>
              <input
                type="number"
                step="0.01"
                value={variant.discountedPrice}
                onChange={(e) => handleVariantFieldChange('discountedPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={variant.status}
                onChange={(e) => handleVariantFieldChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Column 3 */}
          <div className="space-y-4">
            {currentVariant.type === 'Packet' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pack</label>
                <input
                  type="text"
                  value={variant.pack}
                  onChange={(e) => handleVariantFieldChange('pack', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="e.g. Pack Of 3"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size <span className="text-red-500">*</span>
              </label>
              <div className="relative sizes-dropdown">
                <button
                  type="button"
                  onClick={() => setIsSizesDropdownOpen(!isSizesDropdownOpen)}
                  disabled={sizesLoading}
                  className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white text-left flex items-center justify-between"
                >
                  <span className={getSelectedSize() ? 'text-gray-900' : 'text-gray-500'}>
                    {sizesLoading
                      ? 'Loading sizes...'
                      : getSelectedSize()
                        ? `${getSelectedSize().name} (${getSelectedSize().size_code})`
                        : '--Select Size--'
                    }
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isSizesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isSizesDropdownOpen && (
                  <div className="absolute z-10 w-48 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Search sizes..."
                        value={sizesSearchTerm}
                        onChange={(e) => setSizesSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {sizes
                      .filter(size => 
                        size.name.toLowerCase().includes(sizesSearchTerm.toLowerCase()) ||
                        size.size_code.toLowerCase().includes(sizesSearchTerm.toLowerCase())
                      )
                      .map((size, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            handleVariantFieldChange('size', size.id);
                            setIsSizesDropdownOpen(false);
                            setSizesSearchTerm('');
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-b-0"
                        >
                          <span className="text-gray-700">{size.name}</span>
                          <span className="text-xs text-gray-500">({size.size_code})</span>
                        </button>
                      ))}
                    {sizes.filter(size => 
                      size.name.toLowerCase().includes(sizesSearchTerm.toLowerCase()) ||
                      size.size_code.toLowerCase().includes(sizesSearchTerm.toLowerCase())
                    ).length === 0 && (
                      <div className="px-3 py-2 text-gray-500 text-sm">
                        No sizes found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">No of pics</label>
              <input
                type="text"
                value={variant.noOfPics}
                onChange={(e) => handleVariantFieldChange('noOfPics', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="No of pics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions</label>
              <input
                type="text"
                value={variant.dimensions}
                onChange={(e) => handleVariantFieldChange('dimensions', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Dimensions"
              />
            </div>

            {currentVariant.type === 'Packet' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Flavour</label>
                <input 
                  type="text" 
                  value={variant.flavour}
                  onChange={(e) => handleVariantFieldChange('flavour', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter flavour"
                />
              </div>
            )}

            {currentVariant.stockLimit === 'Limited' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={variant.stock}
                  onChange={(e) => handleVariantFieldChange('stock', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Variant Images */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Variant Images</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-500 transition-colors">
            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-2">Drop Files here or click to upload</p>
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
            <label htmlFor={`variant-images-${variant.id}`} className="cursor-pointer">
              <span className="text-sm text-blue-600 hover:text-blue-800">Choose Files</span>
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Please choose square image of larger than 350px*350px & smaller than 550px*550px
            </p>
          </div>
          {variant.variantImages.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-4">
              {variant.variantImages.map((file, index) => {
                const imageUrl = file instanceof File ? URL.createObjectURL(file) : (typeof file === 'object' && file?.image_url ? file.image_url : file);
                const imageSize = file instanceof File ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : 'Existing Image';
                
                return (
                  <div key={index} className="relative inline-block">
                    <div className="relative group">
                      <img 
                        src={imageUrl} 
                        alt={`Variant image ${index + 1} preview`}
                        className="w-32 h-32 object-cover rounded-lg shadow-md border border-gray-200"
                      />
                      <button
                        onClick={() => {
                          setVariants(prev => prev.map(v =>
                            v.id === variant.id ? {
                              ...v,
                              variantImages: v.variantImages.filter((_, i) => i !== index)
                            } : v
                          ));
                        }}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 text-center mt-2">{imageSize}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons at Bottom */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => copyVariant(variant)}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md font-medium cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            <span>Copy Variant</span>
          </button>
          <button
            onClick={() => deleteVariant(variant.id)}
            className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-lg hover:from-rose-600 hover:to-rose-700 transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md font-medium cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Remove Variant</span>
          </button>
        </div>
      </div>
    );
  };

  const renderProductVariantForm = () => (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Dashboard</span>
          <span>/</span>
          <span>Manage Products</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">Product Variant</span>
        </div>
        <button
          onClick={() => setCurrentStep(1)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Product Info</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Product Variant</h1>

        {/* Type and Stock Limit Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Type <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="Packet"
                  checked={currentVariant.type === 'Packet'}
                  onChange={(e) => handleVariantChange('type', e.target.value)}
                  className="w-4 h-4 text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-sm text-gray-700">Packet</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="Loose"
                  checked={currentVariant.type === 'Loose'}
                  onChange={(e) => handleVariantChange('type', e.target.value)}
                  className="w-4 h-4 text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-sm text-gray-700">Loose</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Stock Limit <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="Limited"
                  checked={currentVariant.stockLimit === 'Limited'}
                  onChange={(e) => handleVariantChange('stockLimit', e.target.value)}
                  className="w-4 h-4 text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-sm text-gray-700">Limited</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="Unlimited"
                  checked={currentVariant.stockLimit === 'Unlimited'}
                  onChange={(e) => handleVariantChange('stockLimit', e.target.value)}
                  className="w-4 h-4 text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-sm text-gray-700">Unlimited</span>
              </label>
            </div>
          </div>
        </div>

              {/* Main Form Fields - 3 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Measurement <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={currentVariant.measurement}
                      onChange={(e) => handleVariantChange('measurement', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  {currentVariant.type === 'Packet' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <input
                        type="text"
                        value={currentVariant.variantType}
                        onChange={(e) => handleVariantChange('variantType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="e.g. V shape neck"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                    <select
                      value={currentVariant.material}
                      onChange={(e) => handleVariantChange('material', e.target.value)}
                      disabled={materialsLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {materialsLoading ? 'Loading materials...' : '--Select Material--'}
                      </option>
                      {materials.map((material, index) => (
                        <option key={index} value={material.id}>
                          {material.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight in Grams</label>
                    <input
                      type="text"
                      value={currentVariant.weightInGrams}
                      onChange={(e) => handleVariantChange('weightInGrams', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Weight in Grams"
                    />
                  </div>

                  {currentVariant.type === 'Packet' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                      <input
                        type="text"
                        value={currentVariant.height}
                        onChange={(e) => handleVariantChange('height', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Height"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price () <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentVariant.price}
                      onChange={(e) => handleVariantChange('price', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={currentVariant.unit}
                      onChange={(e) => handleVariantChange('unit', e.target.value)}
                      disabled={unitsLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {unitsLoading ? 'Loading units...' : '--Select Unit--'}
                      </option>
                      {units.map((unit, index) => (
                        <option key={index} value={unit.id}>
                          {unit.short_code} - {unit.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Title (Optional)</label>
                    <input
                      type="text"
                      value={currentVariant.productTitle}
                      onChange={(e) => handleVariantChange('productTitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter Product Title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <div className="relative colors-dropdown">
                      <button
                        type="button"
                        onClick={() => setIsColorsDropdownOpen(!isColorsDropdownOpen)}
                        disabled={colorsLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white text-left flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          {selectedColor ? (
                            <>
                              {renderColorPreview(selectedColor)}
                              <span className="text-gray-900">
                                {selectedColor.name}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-500">
                              {colorsLoading ? 'Loading colors...' : '--Select Color--'}
                            </span>
                          )}
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isColorsDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isColorsDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {/* Search Input */}
                          <div className="p-2 border-b border-gray-200">
                            <input
                              type="text"
                              placeholder="Search colors..."
                              value={colorsSearchTerm}
                              onChange={(e) => setColorsSearchTerm(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          {colors
                            .filter(color => 
                              color.name.toLowerCase().includes(colorsSearchTerm.toLowerCase())
                            )
                            .map((color, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => {
                                  handleVariantChange('color', color.id);
                                  setIsColorsDropdownOpen(false);
                                  setColorsSearchTerm('');
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
                              >
                                {renderColorPreview(color)}
                                <span className="text-gray-700">{color.name}</span>
                              </button>
                            ))}
                          {colors.filter(color => 
                            color.name.toLowerCase().includes(colorsSearchTerm.toLowerCase())
                          ).length === 0 && (
                            <div className="px-3 py-2 text-gray-500 text-sm">
                              No colors found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pattern</label>
                    <select
                      value={currentVariant.pattern}
                      onChange={(e) => handleVariantChange('pattern', e.target.value)}
                      disabled={patternsLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {patternsLoading ? 'Loading patterns...' : '--Select Pattern--'}
                      </option>
                      {patterns.map((pattern, index) => (
                        <option key={index} value={pattern.id}>
                          {pattern.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                    <input
                      type="text"
                      value={currentVariant.capacity}
                      onChange={(e) => handleVariantChange('capacity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Capacity"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mattress Size (Optional)</label>
                    <input
                      type="text"
                      value={currentVariant.mattressSize}
                      onChange={(e) => handleVariantChange('mattressSize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="e.g. 78x76x6"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discounted Price ()</label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentVariant.discountedPrice}
                      onChange={(e) => handleVariantChange('discountedPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={currentVariant.status}
                      onChange={(e) => handleVariantChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Select Status</option>
                      <option value="active">Available</option>
                      <option value="inactive">Sold Out</option>
                    </select>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="space-y-4">
                  {currentVariant.type === 'Packet' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pack</label>
                      <input
                        type="text"
                        value={currentVariant.pack}
                        onChange={(e) => handleVariantChange('pack', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="e.g. Pack Of 3"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size <span className="text-red-500">*</span>
                    </label>
                    <div className="relative sizes-dropdown">
                      <button
                        type="button"
                        onClick={() => setIsSizesDropdownOpen(!isSizesDropdownOpen)}
                        disabled={sizesLoading}
                        className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white text-left flex items-center justify-between"
                      >
                        <span className={selectedSize ? 'text-gray-900' : 'text-gray-500'}>
                          {sizesLoading
                            ? 'Loading sizes...'
                            : selectedSize
                              ? `${selectedSize.name} (${selectedSize.size_code})`
                              : '--Select Size--'
                          }
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isSizesDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isSizesDropdownOpen && (
                        <div className="absolute z-10 w-48 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {/* Search Input */}
                          <div className="p-2 border-b border-gray-200">
                            <input
                              type="text"
                              placeholder="Search sizes..."
                              value={sizesSearchTerm}
                              onChange={(e) => setSizesSearchTerm(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          {sizes
                            .filter(size => 
                              size.name.toLowerCase().includes(sizesSearchTerm.toLowerCase()) ||
                              size.size_code.toLowerCase().includes(sizesSearchTerm.toLowerCase())
                            )
                            .map((size, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => {
                                  handleVariantChange('size', size.id);
                                  setIsSizesDropdownOpen(false);
                                  setSizesSearchTerm('');
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-b-0"
                              >
                                <span className="text-gray-700">{size.name}</span>
                                <span className="text-xs text-gray-500">({size.size_code})</span>
                              </button>
                            ))}
                          {sizes.filter(size => 
                            size.name.toLowerCase().includes(sizesSearchTerm.toLowerCase()) ||
                            size.size_code.toLowerCase().includes(sizesSearchTerm.toLowerCase())
                          ).length === 0 && (
                            <div className="px-3 py-2 text-gray-500 text-sm">
                              No sizes found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">No of pics</label>
                    <input
                      type="text"
                      value={currentVariant.noOfPics}
                      onChange={(e) => handleVariantChange('noOfPics', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="No of pics"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions</label>
                    <input
                      type="text"
                      value={currentVariant.dimensions}
                      onChange={(e) => handleVariantChange('dimensions', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Dimensions"
                    />
                  </div>

                  {currentVariant.type === 'Packet' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Flavour</label>
                      <input 
                        type="text" 
                        value={currentVariant.flavour}
                        onChange={(e) => handleVariantChange('flavour', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Enter flavour"
                      />
                    </div>
                  )}

                  {currentVariant.stockLimit === 'Limited' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={currentVariant.stock}
                        onChange={(e) => handleVariantChange('stock', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Variant Images */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Variant Images</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-500 transition-colors">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Drop Files here or click to upload</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e.target.files, 'variantImages')}
                    className="hidden"
              id="variant-images"
                  />
            <label htmlFor="variant-images" className="cursor-pointer">
                    <span className="text-sm text-blue-600 hover:text-blue-800">Choose Files</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Please choose square image of larger than 350px*350px & smaller than 550px*550px
                  </p>
                </div>
                {currentVariant.variantImages.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-4">
                    {currentVariant.variantImages.map((file, index) => {
                      const imageUrl = file instanceof File ? URL.createObjectURL(file) : (typeof file === 'object' && file?.image_url ? file.image_url : file);
                      const imageSize = file instanceof File ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : 'Existing Image';
                      
                      return (
                        <div key={index} className="relative inline-block">
                          <div className="relative group">
                            <img 
                              src={imageUrl} 
                              alt={`Variant image ${index + 1} preview`}
                              className="w-32 h-32 object-cover rounded-lg shadow-md border border-gray-200"
                            />
                            <button
                              onClick={() => removeImage(index, 'variantImages')}
                              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-600 text-center mt-2">{imageSize}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => {
              console.log('Copy button clicked, currentVariant:', currentVariant);
              copyVariant(currentVariant);
                  }}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md font-medium cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy This Variant</span>
                </button>
                <button
            onClick={() => {
              console.log('Add variant button clicked');
              addVariant();
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md font-medium cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Variant</span>
                </button>
              </div>

        {/* Render all added variants */}
        {variants.length > 0 && (
          <div className="mt-8 space-y-6">
            {console.log('Rendering variants:', variants)}
            {variants.map((variant, index) => {
              console.log('Rendering variant:', variant, 'at index:', index);
              return renderVariantForm(variant, index);
            })}
            </div>
        )}


        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep(1)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => {
              if (validateStep2()) {
                setCurrentStep(3);
              }
            }}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Next: Product Settings
          </button>
        </div>
      </div>
    </div>
  );

  const renderProductSettingsForm = () => (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Dashboard</span>
          <span>/</span>
          <span>Manage Products</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">Product Settings</span>
        </div>
        <button
          onClick={() => setCurrentStep(2)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Variants</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Product settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Type</label>
              <select
                value={formData.productType}
                onChange={(e) => handleInputChange('productType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select Type</option>
                <option value="physical">None</option>
                <option value="digital">Veg</option>
                <option value="service">Non-Veg</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Made In</label>
              <select
                value={formData.madeIn}
                onChange={(e) => handleInputChange('madeIn', e.target.value)}
                disabled={countriesLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {countriesLoading ? 'Loading countries...' : '--Select Country--'}
                </option>
                {countries.map((country, index) => (
                  <option key={index} value={country.id}>
                    {country.name} ({country.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Is Returnable?</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="No"
                    checked={formData.isReturnable === 'No'}
                    onChange={(e) => handleInputChange('isReturnable', e.target.value)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="Yes"
                    checked={formData.isReturnable === 'Yes'}
                    onChange={(e) => handleInputChange('isReturnable', e.target.value)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
              </div>
            </div>

            {/* Max Return Days - Show only when Is Returnable is Yes */}
            {formData.isReturnable === 'Yes' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Return Days <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.maxReturnDays}
                  onChange={(e) => handleInputChange('maxReturnDays', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter max return days"
                  min="0"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Is cancel-able?</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="No"
                    checked={formData.isCancellable === 'No'}
                    onChange={(e) => handleInputChange('isCancellable', e.target.value)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="Yes"
                    checked={formData.isCancellable === 'Yes'}
                    onChange={(e) => handleInputChange('isCancellable', e.target.value)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter Manufacturer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SKU (Product Code)</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter SKU (Product Code)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">HSN Code</label>
              <input
                type="text"
                value={formData.hsnCode}
                onChange={(e) => handleInputChange('hsnCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter HSN Code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">FSSAI Lic. No.</label>
              <input
                type="text"
                value={formData.fssaiLicNo}
                onChange={(e) => handleInputChange('fssaiLicNo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="FSSAI Lic. No."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Self Life</label>
              <input
                type="text"
                value={formData.selfLife}
                onChange={(e) => handleInputChange('selfLife', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter self life"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Is COD allowed?</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="No"
                    checked={formData.isCodAllowed === 'No'}
                    onChange={(e) => handleInputChange('isCodAllowed', e.target.value)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="Yes"
                    checked={formData.isCodAllowed === 'Yes'}
                    onChange={(e) => handleInputChange('isCodAllowed', e.target.value)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
              </div>
            </div>

            {/* Till which status - Show only when Is cancel-able is Yes */}
            {formData.isCancellable === 'Yes' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Till which status? <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.tillWhichStatus}
                  onChange={(e) => handleInputChange('tillWhichStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total allowed quantity</label>
              <input
                type="number"
                value={formData.totalAllowedQuantity}
                onChange={(e) => handleInputChange('totalAllowedQuantity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <p className="text-xs text-gray-500 mt-1">Keep blank if no such limit</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Delivery Charges</label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="pay_by_yourself"
                    checked={formData.deliveryOption === 'pay_by_yourself'}
                    onChange={(e) => handleInputChange('deliveryOption', e.target.value)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Pay By Yourself <span className="text-green-600 font-medium">(Recommended)</span></span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="add_delivery_charge"
                    checked={formData.deliveryOption === 'add_delivery_charge'}
                    onChange={(e) => handleInputChange('deliveryOption', e.target.value)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Add delivery charge</span>
                </label>
                
                {/* Show input only when Add delivery charge is selected */}
                {formData.deliveryOption === 'add_delivery_charge' && (
                  <div className="ml-6 mt-2">
                    <input
                      type="number"
                      value={formData.deliveryCharges}
                      onChange={(e) => handleInputChange('deliveryCharges', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {saveMessage}
          </div>
        )}
        {saveError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {saveError}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep(2)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={handleSaveProduct}
            disabled={isSaving}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Update Product'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderProductSpecificationsForm = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Dashboard</span>
          <span>/</span>
          <span>Manage Products</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">Product Specification</span>
        </div>
        <button
          onClick={() => setCurrentStep(2)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Variants</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Product Specification</h1>

        {attributesLoading && (
          <div className="text-sm text-gray-600">Loading specifications...</div>
        )}

        {!attributesLoading && filteredAttributes.length === 0 && (
          <div className="text-sm text-gray-600">No specifications available for the selected category.</div>
        )}

        {!attributesLoading && filteredAttributes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">{attr.label || attr.name}</label>
                  {isSelect ? (
                    <select
                      value={value}
                      onChange={(e) => handleSpecChange(attrId, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder={`Enter ${attr.label || attr.name}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep(2)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentStep(4)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Next: Product Settings
          </button>
        </div>
      </div>
    </div>
  );

  const renderCreateProductForm = () => (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Dashboard</span>
          <span>/</span>
          <span>Manage Products</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">Create Product</span>
        </div>
        <button
          onClick={() => setCurrentStep(2)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Manage Products</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Edit Product</h1>
        <p className="text-sm text-gray-600 mb-6">* Required fields</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter Product Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative categories-dropdown">
                <button
                  type="button"
                  onClick={() => setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen)}
                  disabled={categoriesLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white text-left flex items-center justify-between"
                >
                  <span className="text-gray-500">
                    {categoriesLoading ? 'Loading categories...' : 
                     formData.category ? 
                       categories.find(cat => cat.value === formData.category)?.text || '--Select Category--' :
                       '--Select Category--'
                    }
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isCategoriesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isCategoriesDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={categoriesSearchTerm}
                        onChange={(e) => setCategoriesSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {categories
                      .filter(category => 
                        category.text.toLowerCase().includes(categoriesSearchTerm.toLowerCase())
                      )
                      .map((category, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            handleInputChange('category', category.value);
                            setIsCategoriesDropdownOpen(false);
                            setCategoriesSearchTerm('');
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700 border-b border-gray-100 last:border-b-0"
                          style={{
                            backgroundColor: category.level === 0 ? '#f8f9fa' : 'white',
                            fontWeight: category.level === 0 ? 'bold' : 'normal',
                            paddingLeft: `${category.level * 20 + 12}px`
                          }}
                        >
                          {category.text}
                        </button>
                      ))}
                    {categories.filter(category => 
                      category.text.toLowerCase().includes(categoriesSearchTerm.toLowerCase())
                    ).length === 0 && (
                      <div className="px-3 py-2 text-gray-500 text-sm">
                        No categories found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (These tags help you in search result)
              </label>
              <div className="relative tags-dropdown">
                <button
                  type="button"
                  onClick={() => setIsTagsDropdownOpen(!isTagsDropdownOpen)}
                  disabled={tagsLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white text-left flex items-center justify-between"
                >
                  <span className="text-gray-500">
                    {tagsLoading ? 'Loading tags...' : '--Select Tags--'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isTagsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isTagsDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Search tags..."
                        value={tagsSearchTerm}
                        onChange={(e) => setTagsSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {tags
                      .filter(tag => 
                        tag.name.toLowerCase().includes(tagsSearchTerm.toLowerCase())
                      )
                      .map((tag, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            if (!formData.tags.includes(tag.id)) {
                              handleInputChange('tags', [...formData.tags, tag.id]);
                            }
                            setIsTagsDropdownOpen(false);
                            setTagsSearchTerm('');
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700 border-b border-gray-100 last:border-b-0"
                        >
                          {tag.name}
                        </button>
                      ))}
                    {tags.filter(tag => 
                      tag.name.toLowerCase().includes(tagsSearchTerm.toLowerCase())
                    ).length === 0 && (
                      <div className="px-3 py-2 text-gray-500 text-sm">
                        No tags found
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Selected Tags */}
              {formData.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.tags.map((tagId) => {
                    const tag = tags.find(t => t.id === tagId);
                    if (!tag) return null;
                    
                    return (
                      <div
                        key={tagId}
                        className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                      >
                        <span>{tag.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            handleInputChange('tags', formData.tags.filter(id => id !== tagId));
                          }}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Warranty</label>
              <div className="relative warranties-dropdown">
                <button
                  type="button"
                  onClick={() => setIsWarrantiesDropdownOpen(!isWarrantiesDropdownOpen)}
                  disabled={warrantiesLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white text-left flex items-center justify-between"
                >
                  <span className="text-gray-500">
                    {warrantiesLoading ? 'Loading warranties...' : 
                     formData.warranty ? 
                       warranties.find(warranty => warranty.id == formData.warranty)?.label || '--Select Warranty--' :
                       '--Select Warranty--'
                    }
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isWarrantiesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isWarrantiesDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Search warranties..."
                        value={warrantiesSearchTerm}
                        onChange={(e) => setWarrantiesSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {warranties
                      .filter(warranty => 
                        warranty.label.toLowerCase().includes(warrantiesSearchTerm.toLowerCase())
                      )
                      .map((warranty, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            handleInputChange('warranty', warranty.id);
                            setIsWarrantiesDropdownOpen(false);
                            setWarrantiesSearchTerm('');
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700 border-b border-gray-100 last:border-b-0"
                        >
                          {warranty.label}
                        </button>
                      ))}
                    {warranties.filter(warranty => 
                      warranty.label.toLowerCase().includes(warrantiesSearchTerm.toLowerCase())
                    ).length === 0 && (
                      <div className="px-3 py-2 text-gray-500 text-sm">
                        No warranties found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Product Form</h3> */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50"
                placeholder="Auto-generated from product name"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">Slug is auto-generated from product name</p>
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax</label>
              <select
                value={formData.tax}
                onChange={(e) => handleInputChange('tax', e.target.value)}
                disabled={taxesLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {taxesLoading ? 'Loading taxes...' : '--Select Tax--'}
                </option>
                {taxes.map((tax, index) => (
                  <option key={index} value={tax.id || tax.value}>
                    {tax.name || tax.tax_name} ({tax.percentage || tax.rate}%)
                  </option>
                ))}
              </select>
            </div> */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brands</label>
              <div className="relative brands-dropdown">
                <button
                  type="button"
                  onClick={() => setIsBrandsDropdownOpen(!isBrandsDropdownOpen)}
                  disabled={brandsLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white text-left flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    {selectedBrand ? (
                      <>
                        <img 
                          src={selectedBrand.image_url} 
                          alt={selectedBrand.name}
                          className="w-6 h-6 object-contain rounded"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <span className="text-gray-900">
                          {selectedBrand.name}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-500">
                        {brandsLoading ? 'Loading brands...' : '--Select Brand--'}
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isBrandsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isBrandsDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Search brands..."
                        value={brandsSearchTerm}
                        onChange={(e) => setBrandsSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {brands
                      .filter(brand => 
                        brand.name.toLowerCase().includes(brandsSearchTerm.toLowerCase())
                      )
                      .map((brand, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            handleInputChange('brands', brand.id);
                            setIsBrandsDropdownOpen(false);
                            setBrandsSearchTerm('');
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
                        >
                          <img 
                            src={brand.image_url} 
                            alt={brand.name}
                            className="w-6 h-6 object-contain rounded"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <span className="text-gray-700">{brand.name}</span>
                        </button>
                      ))}
                    {brands.filter(brand => 
                      brand.name.toLowerCase().includes(brandsSearchTerm.toLowerCase())
                    ).length === 0 && (
                      <div className="px-3 py-2 text-gray-500 text-sm">
                        No brands found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Accessories Warranty</label>
              <div className="relative accessories-warranty-dropdown">
                <button
                  type="button"
                  onClick={() => setIsAccessoriesWarrantyDropdownOpen(!isAccessoriesWarrantyDropdownOpen)}
                  disabled={warrantiesLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white text-left flex items-center justify-between"
                >
                  <span className="text-gray-500">
                    {warrantiesLoading ? 'Loading warranties...' : 
                     formData.accessoriesWarranty ? 
                       warranties.find(warranty => warranty.id == formData.accessoriesWarranty)?.label || '--Select Accessories Warranty--' :
                       '--Select Accessories Warranty--'
                    }
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isAccessoriesWarrantyDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isAccessoriesWarrantyDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Search warranties..."
                        value={accessoriesWarrantySearchTerm}
                        onChange={(e) => setAccessoriesWarrantySearchTerm(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {warranties
                      .filter(warranty => 
                        warranty.label.toLowerCase().includes(accessoriesWarrantySearchTerm.toLowerCase())
                      )
                      .map((warranty, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            handleInputChange('accessoriesWarranty', warranty.id);
                            setIsAccessoriesWarrantyDropdownOpen(false);
                            setAccessoriesWarrantySearchTerm('');
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700 border-b border-gray-100 last:border-b-0"
                        >
                          {warranty.label}
                        </button>
                      ))}
                    {warranties.filter(warranty => 
                      warranty.label.toLowerCase().includes(accessoriesWarrantySearchTerm.toLowerCase())
                    ).length === 0 && (
                      <div className="px-3 py-2 text-gray-500 text-sm">
                        No warranties found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <Editor
              value={formData.description}
              onEditorChange={(content) => handleInputChange('description', content)}
              init={{
                height: 400,
                menubar: false,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'help', 'wordcount'
                ],
                toolbar:
                  'undo redo | formatselect | bold italic underline | ' +
                  'alignleft aligncenter alignright alignjustify | ' +
                  'bullist numlist | link image | removeformat | help',
                placeholder: 'Enter product description...',
                branding: false,
                promotion: false,
                content_style: 'body { font-family: Arial, sans-serif; font-size: 14px; }',
                skin: 'oxide',
                content_css: 'default',
                init_instance_callback: function(editor) {
                  editor.setContent(formData.description || '');
                }
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Use the rich text editor to format your product description
          </p>
        </div>

        {/* Image Upload Sections */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Image <span className="text-red-500">*</span>
            </label>
            <div 
              onClick={() => mainImageInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-500 transition-colors cursor-pointer"
            >
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">Drop Files here or click to upload</p>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={(e) => handleImageUpload(e.target.files, 'mainImage')}
                className="hidden"
                ref={mainImageInputRef}
              />
              <p className="text-xs text-gray-500 mt-2">
                *Please upload only JPEG, JPG, PNG, or GIF files.
              </p>
            </div>
            {/* Show existing main image */}
            {existingMainImageUrl && !formData.mainImage && (
              <div className="mt-4 relative inline-block">
                <div className="relative group">
                  <img 
                    src={existingMainImageUrl} 
                    alt="Main product image"
                    className="w-48 h-48 object-cover rounded-lg shadow-md"
                  />
                  <button
                    onClick={removeMainImage}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-600 text-center mt-2">
                  Existing Image
                </p>
              </div>
            )}
            
            {/* Show new uploaded main image */}
            {formData.mainImage && (
              <div className="mt-4 relative inline-block">
                <div className="relative group">
                  <img 
                    src={URL.createObjectURL(formData.mainImage)} 
                    alt="Main product image preview"
                    className="w-48 h-48 object-cover rounded-lg shadow-md"
                  />
                  <button
                    onClick={removeMainImage}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-600 text-center mt-2">
                  {(formData.mainImage.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>

          {/* Other Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Other Images of the Product
            </label>
            <div 
              onClick={() => otherImagesInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-500 transition-colors cursor-pointer"
            >
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">Drop Files here or click to upload</p>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                multiple
                onChange={(e) => handleImageUpload(e.target.files, 'otherImages')}
                className="hidden"
                ref={otherImagesInputRef}
              />
              <p className="text-xs text-gray-500 mt-2">
              *Please upload only JPEG, JPG, PNG, or GIF files.
              </p>
            </div>
            {/* Show existing other images */}
            {existingOtherImagesUrls.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4">
                {existingOtherImagesUrls.map((imageUrl, index) => (
                  <div key={`existing-${index}`} className="relative inline-block">
                    <div className="relative group">
                      <img 
                        src={imageUrl} 
                        alt={`Product image ${index + 1}`}
                        className="w-40 h-40 object-cover rounded-lg shadow-md"
                      />
                      <button
                        onClick={() => removeImage(index, 'otherImages')}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 text-center mt-2">
                      Existing Image
                    </p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Show new uploaded other images */}
            {formData.otherImages.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4">
                {formData.otherImages.map((file, index) => (
                  <div key={`new-${index}`} className="relative inline-block">
                    <div className="relative group">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`Product image ${index + 1} preview`}
                        className="w-40 h-40 object-cover rounded-lg shadow-md"
                      />
                      <button
                        onClick={() => removeImage(existingOtherImagesUrls.length + index, 'otherImages')}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 text-center mt-2">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={() => {
              if (validateStep1()) {
                setCurrentStep(2);
              }
            }}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Next: Product Variants
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product data...</p>
        </div>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Product not found</p>
          <button 
            onClick={() => navigate('/products/manage')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {currentStep === 1 && renderCreateProductForm()}
      {currentStep === 2 && renderProductVariantForm()}
      {currentStep === 3 && renderProductSpecificationsForm()}
      {currentStep === 4 && renderProductSettingsForm()}
    </div>
  );
};

export default EditProduct;

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Upload, Copy, Plus, X, Save, Trash2, ChevronDown } from 'lucide-react';
import { useSelector } from 'react-redux';
import { getSellerCategoriesForProduct, getSellerTaxes, getAllBrands, getAllColors, getAllSizes, getAllMaterials, getAllPatterns, getAllUnits, getAllCountries, getAllTags, getAllWarranties, getAllProductAttributes, saveProduct } from '../../../../api/api';
import { generateSlug } from '../../../../helper/helper';
import { useToast } from '../../../../contexts/ToastContext';
import { Editor } from '@tinymce/tinymce-react';

const AddProduct = () => {
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
  const mainImageInputRef = useRef(null);
  const otherImagesInputRef = useRef(null);
  const pageTopRef = useRef(null);
  const { showError, showSuccess } = useToast();

  // Product Specifications / Attributes state
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
    variant_id: '', // Empty for new products
    type: 'Packet',
    stockLimit: 'Limited',
    measurement: '1',
    variantType: '',
    material: '',
    weightInGrams: '',
    height: '',
    price: '',
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
    stock: '1',
    variantImages: []
  });

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

  // Fetch all product attributes on component mount
  useEffect(() => {
    const fetchProductAttributes = async () => {
      if (token) {
        try {
          setAttributesLoading(true);
          const response = await getAllProductAttributes(token);

          if (response && response.data) {
            setAllAttributes(response.data);
          }
        } catch (error) {
          console.error('Error fetching product attributes:', error);
          setAllAttributes([]);
        } finally {
          setAttributesLoading(false);
        }
      }
    };

    fetchProductAttributes();
  }, [token]);

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

  // Scroll to top smoothly when step changes
  useEffect(() => {
    // Primary method: Use ref for precise scrolling
    if (pageTopRef.current) {
      pageTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    // Fallback methods for compatibility

    // 1. Window scroll with smooth behavior
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 2. Document element scroll
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }

    // 3. Body scroll
    if (document.body) {
      document.body.scrollTop = 0;
    }

    // 4. Scroll main container
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTop = 0;
    }

    // 5. Delayed scroll to ensure DOM updates
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  }, [currentStep]);

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
    setSpecValues(prev => ({ ...prev, [attributeId]: value }));
  };

  // Validation functions
  const validateStep1 = () => {
    const errors = [];

    if (!formData.productName.trim()) {
      errors.push('Product Name');
    }
    if (!formData.category) {
      errors.push('Category');
    }
    if (!formData.description.trim()) {
      errors.push('Description');
    }
    if (!formData.mainImage) {
      errors.push('Main Image');
    }

    if (errors.length > 0) {
      showError(
        'Missing Required Fields',
        `Please fill the following mandatory fields: ${errors.join(', ')}`
      );
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    const errors = [];

    if (!currentVariant.measurement || !currentVariant.measurement.trim() || currentVariant.measurement === '0') {
      errors.push('Measurement (must be greater than 0)');
    }
    if (!currentVariant.price || currentVariant.price.trim() === '' || parseFloat(currentVariant.price) <= 0) {
      errors.push('Price (must be greater than 0)');
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
    if (currentVariant.stockLimit === 'Limited' && (!currentVariant.stock || currentVariant.stock === '0' || parseFloat(currentVariant.stock) <= 0)) {
      errors.push('Stock (must be greater than 0 when Limited)');
    }

    if (errors.length > 0) {
      showError(
        'Missing Required Fields',
        `Please fill the following mandatory fields: ${errors.join(', ')}`
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
    console.log('Copying variant:', variant);
    const copiedVariant = {
      ...variant,
      id: Date.now(),
      variant_id: '' // Empty for new variants (copied variants are treated as new)
    };
    console.log('Copied variant:', copiedVariant);
    setVariants(prev => {
      const newVariants = [...prev, copiedVariant];
      console.log('New variants array after copy:', newVariants);
      return newVariants;
    });
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

      const response = await saveProduct(token, {
        // Basic product information
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
        till_status: formData.isCancellable === 'Yes' ? (formData.tillWhichStatus || '1') : '1',
        cod_allowed_status: formData.isCodAllowed === 'Yes' ? '1' : '0',
        max_allowed_quantity: formData.totalAllowedQuantity || '10',
        delivery_option: formData.deliveryOption || 'pay_by_yourself',
        delivery_charges: formData.deliveryOption === 'add_delivery_charge' ? (formData.deliveryCharges || '0') : '0',
        is_approved: '0',
        tax_included_in_price: '0',
        sku: formData.sku,
        hsn_code: formData.hsnCode,
        self_life: formData.selfLife || '',
        no_of_pics: 'undefined',
        weight_in_grams: 'undefined',
        loose_stock: '0',
        loose_stock_unit_id: '',
        status: '1',

        // Images
        image: formData.mainImage,
        other_images: formData.otherImages,

        // Product Attributes (Specifications)
        product_attributes: specValues,

        // Variants data - Include currentVariant as the first variant
        variants: [currentVariant, ...variants]
      });

      if (response.status === 1) {
        const successMessage = response.message || 'Product saved successfully!';
        setSaveMessage(successMessage);
        showSuccess('Product Saved', successMessage);
        // Reset form after successful save
        setTimeout(() => {
          setFormData({
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
          setVariants([]);
          setCurrentStep(1);
        }, 2000);
      } else {
        setSaveError(response.message || 'Failed to save product');
      }
    } catch (error) {
      console.error('Save product error:', error);
      setSaveError(error.message || 'Failed to save product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeImage = (index, type) => {
    if (type === 'otherImages') {
      setFormData(prev => ({
        ...prev,
        otherImages: prev.otherImages.filter((_, i) => i !== index)
      }));
    } else if (type === 'variantImages') {
      setCurrentVariant(prev => ({
        ...prev,
        variantImages: prev.variantImages.filter((_, i) => i !== index)
      }));
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

        {/* Main Form Fields - Mobile Responsive */}
        <div className="grid grid-cols-1 gap-4">
          {/* Column 1 */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Measurement <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={variant.measurement}
                onChange={(e) => handleVariantFieldChange('measurement', e.target.value)}
                className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {currentVariant.type === 'Packet' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Type</label>
                <input
                  type="text"
                  value={variant.variantType}
                  onChange={(e) => handleVariantFieldChange('variantType', e.target.value)}
                  className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="e.g. V shape neck"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Material</label>
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
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Weight in Grams</label>
              <input
                type="text"
                value={variant.weightInGrams}
                onChange={(e) => handleVariantFieldChange('weightInGrams', e.target.value)}
                className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Weight in Grams"
              />
            </div>

            {currentVariant.type === 'Packet' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Height</label>
                <input
                  type="text"
                  value={variant.height}
                  onChange={(e) => handleVariantFieldChange('height', e.target.value)}
                  className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Height"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Price () <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={variant.price}
                onChange={(e) => handleVariantFieldChange('price', e.target.value)}
                className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
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

          {/* Column 2 - Mobile: Combined into single column */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Product Title (Optional)</label>
              <input
                type="text"
                value={variant.productTitle}
                onChange={(e) => handleVariantFieldChange('productTitle', e.target.value)}
                className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter Product Title"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Color</label>
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
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Pattern</label>
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
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Capacity</label>
              <input
                type="text"
                value={variant.capacity}
                onChange={(e) => handleVariantFieldChange('capacity', e.target.value)}
                className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Capacity"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Mattress Size (Optional)</label>
              <input
                type="text"
                value={variant.mattressSize}
                onChange={(e) => handleVariantFieldChange('mattressSize', e.target.value)}
                className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g. 78x76x6"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Discounted Price ()</label>
              <input
                type="number"
                step="0.01"
                value={variant.discountedPrice}
                onChange={(e) => handleVariantFieldChange('discountedPrice', e.target.value)}
                className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={variant.status}
                onChange={(e) => handleVariantFieldChange('status', e.target.value)}
                className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Column 3 - Mobile: Combined into single column */}
          <div className="space-y-4">
            {currentVariant.type === 'Packet' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Pack</label>
                <input
                  type="text"
                  value={variant.pack}
                  onChange={(e) => handleVariantFieldChange('pack', e.target.value)}
                  className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="e.g. Pack Of 3"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
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
              <label className="block text-xs font-medium text-gray-700 mb-1.5">No of pics</label>
              <input
                type="text"
                value={variant.noOfPics}
                onChange={(e) => handleVariantFieldChange('noOfPics', e.target.value)}
                className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="No of pics"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Dimensions</label>
              <input
                type="text"
                value={variant.dimensions}
                onChange={(e) => handleVariantFieldChange('dimensions', e.target.value)}
                className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Dimensions"
              />
            </div>

            {currentVariant.type === 'Packet' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Flavour</label>
                <input
                  type="text"
                  value={variant.flavour}
                  onChange={(e) => handleVariantFieldChange('flavour', e.target.value)}
                  className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter flavour"
                />
              </div>
            )}

            {currentVariant.stockLimit === 'Limited' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={variant.stock}
                  onChange={(e) => handleVariantFieldChange('stock', e.target.value)}
                  className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Variant Images */}
        <div className="mt-6">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Variant Images</label>
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
            <p className="text-[10px] text-gray-500 mt-1.5">
              Square image 350px-550px recommended
            </p>
          </div>
          {variant.variantImages.length > 0 && (
            <div className="mt-2 space-y-2">
              {variant.variantImages.map((file, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 bg-blue-50 border border-blue-200 rounded">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Variant image ${index + 1} preview`}
                    className="w-12 h-12 object-cover rounded border"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-blue-800 font-medium">{file.name}</p>
                    <p className="text-xs text-blue-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setVariants(prev => prev.map(v =>
                        v.id === variant.id ? {
                          ...v,
                          variantImages: v.variantImages.filter((_, i) => i !== index)
                        } : v
                      ));
                    }}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons at Bottom */}
        <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-300">
          <button
            onClick={() => copyVariant(variant)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Copy className="w-4 h-4" />
            <span>Copy This Variant</span>
          </button>
          <button
            onClick={() => deleteVariant(variant.id)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Remove Variant</span>
          </button>
        </div>
      </div>
    );
  };

  const renderProductVariantForm = () => (
    <div className="space-y-3">
      {/* App Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center p-3 border-b border-gray-200">
          <button
            onClick={() => setCurrentStep(1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="ml-3 flex-1">
            <h1 className="text-base font-semibold text-gray-900">Product Variant</h1>
            <p className="text-xs text-gray-500">Add product variations</p>
          </div>
        </div>
        {/* Step Indicator */}
        <div className="flex items-center justify-center py-2 px-4 bg-gray-50">
          <div className="flex items-center space-x-1">
            <div className="w-6 h-1 bg-green-500 rounded-full"></div>
            <div className="w-6 h-1 bg-red-600 rounded-full"></div>
            <div className="w-6 h-1 bg-gray-300 rounded-full"></div>
            <div className="w-6 h-1 bg-gray-300 rounded-full"></div>
          </div>
          <span className="ml-2 text-[10px] text-gray-600">Step 2 of 4</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-3">
        {/* Type and Stock Limit Selection */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Type <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="Packet"
                  checked={currentVariant.type === 'Packet'}
                  onChange={(e) => handleVariantChange('type', e.target.value)}
                  className="w-3.5 h-3.5 text-red-600 focus:ring-red-500"
                />
                <span className="ml-1.5 text-xs text-gray-700">Packet</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="Loose"
                  checked={currentVariant.type === 'Loose'}
                  onChange={(e) => handleVariantChange('type', e.target.value)}
                  className="w-3.5 h-3.5 text-red-600 focus:ring-red-500"
                />
                <span className="ml-1.5 text-xs text-gray-700">Loose</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Stock Limit <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="Limited"
                  checked={currentVariant.stockLimit === 'Limited'}
                  onChange={(e) => handleVariantChange('stockLimit', e.target.value)}
                  className="w-3.5 h-3.5 text-red-600 focus:ring-red-500"
                />
                <span className="ml-1.5 text-xs text-gray-700">Limited</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="Unlimited"
                  checked={currentVariant.stockLimit === 'Unlimited'}
                  onChange={(e) => handleVariantChange('stockLimit', e.target.value)}
                  className="w-3.5 h-3.5 text-red-600 focus:ring-red-500"
                />
                <span className="ml-1.5 text-xs text-gray-700">Unlimited</span>
              </label>
            </div>
          </div>
        </div>

        {/* Main Form Fields - Mobile Responsive */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Measurement <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={currentVariant.measurement}
              onChange={(e) => handleVariantChange('measurement', e.target.value)}
              className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {currentVariant.type === 'Packet' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Type</label>
              <input
                type="text"
                value={currentVariant.variantType}
                onChange={(e) => handleVariantChange('variantType', e.target.value)}
                className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g. V shape neck"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Material</label>
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
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Weight in Grams</label>
            <input
              type="text"
              value={currentVariant.weightInGrams}
              onChange={(e) => handleVariantChange('weightInGrams', e.target.value)}
              className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Weight in Grams"
            />
          </div>

          {currentVariant.type === 'Packet' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Height</label>
              <input
                type="text"
                value={currentVariant.height}
                onChange={(e) => handleVariantChange('height', e.target.value)}
                className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Height"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Price () <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={currentVariant.price}
              onChange={(e) => handleVariantChange('price', e.target.value)}
              className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
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

        {/* Column 2 - Mobile: Combined into single column */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Product Title (Optional)</label>
            <input
              type="text"
              value={currentVariant.productTitle}
              onChange={(e) => handleVariantChange('productTitle', e.target.value)}
              className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Enter Product Title"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Color</label>
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
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Pattern</label>
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
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Capacity</label>
            <input
              type="text"
              value={currentVariant.capacity}
              onChange={(e) => handleVariantChange('capacity', e.target.value)}
              className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Capacity"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Mattress Size (Optional)</label>
            <input
              type="text"
              value={currentVariant.mattressSize}
              onChange={(e) => handleVariantChange('mattressSize', e.target.value)}
              className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="e.g. 78x76x6"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Discounted Price ()</label>
            <input
              type="number"
              step="0.01"
              value={currentVariant.discountedPrice}
              onChange={(e) => handleVariantChange('discountedPrice', e.target.value)}
              className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={currentVariant.status}
              onChange={(e) => handleVariantChange('status', e.target.value)}
              className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Column 3 - Mobile: Combined into single column */}
        <div className="space-y-4">
          {currentVariant.type === 'Packet' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Pack</label>
              <input
                type="text"
                value={currentVariant.pack}
                onChange={(e) => handleVariantChange('pack', e.target.value)}
                className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g. Pack Of 3"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
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
            <label className="block text-xs font-medium text-gray-700 mb-1.5">No of pics</label>
            <input
              type="text"
              value={currentVariant.noOfPics}
              onChange={(e) => handleVariantChange('noOfPics', e.target.value)}
              className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="No of pics"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Dimensions</label>
            <input
              type="text"
              value={currentVariant.dimensions}
              onChange={(e) => handleVariantChange('dimensions', e.target.value)}
              className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Dimensions"
            />
          </div>

          {currentVariant.type === 'Packet' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Flavour</label>
              <input
                type="text"
                value={currentVariant.flavour}
                onChange={(e) => handleVariantChange('flavour', e.target.value)}
                className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter flavour"
              />
            </div>
          )}

          {currentVariant.stockLimit === 'Limited' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={currentVariant.stock}
                onChange={(e) => handleVariantChange('stock', e.target.value)}
                className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Variant Images */}
      <div className="mt-6">
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Variant Images</label>
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
          <p className="text-[10px] text-gray-500 mt-1.5">
            Square image 350px-550px recommended
          </p>
        </div>
        {currentVariant.variantImages.length > 0 && (
          <div className="mt-2 space-y-2">
            {currentVariant.variantImages.map((file, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-blue-50 border border-blue-200 rounded">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Variant image ${index + 1} preview`}
                  className="w-12 h-12 object-cover rounded border"
                />
                <div className="flex-1">
                  <p className="text-sm text-blue-800 font-medium">{file.name}</p>
                  <p className="text-xs text-blue-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => removeImage(index, 'variantImages')}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mt-8">
        <button
          onClick={() => {
            console.log('Copy button clicked, currentVariant:', currentVariant);
            copyVariant(currentVariant);
          }}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <Copy className="w-4 h-4" />
          <span>Copy This Variant</span>
        </button>
        <button
          onClick={() => {
            console.log('Add variant button clicked');
            addVariant();
          }}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
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
      <div className="flex justify-between p-3 bg-white border-t border-gray-200 sticky bottom-0">
        <button
          onClick={() => setCurrentStep(1)}
          className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => {
            if (validateStep2()) {
              // Skip specifications step if category has no attributes
              if (filteredAttributes.length === 0) {
                setCurrentStep(4);
              } else {
                setCurrentStep(3);
              }
            }
          }}
          className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          {filteredAttributes.length === 0 ? 'Next: Settings' : 'Next: Specifications'}
        </button>
      </div>
    </div>
  );

  const renderProductSpecificationsForm = () => (
    <div className="space-y-3">
      {/* App Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center p-3 border-b border-gray-200">
          <button
            onClick={() => setCurrentStep(2)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="ml-3 flex-1">
            <h1 className="text-base font-semibold text-gray-900">Product Specifications</h1>
            <p className="text-xs text-gray-500">Add product details</p>
          </div>
        </div>
        {/* Step Indicator */}
        <div className="flex items-center justify-center py-2 px-4 bg-gray-50">
          <div className="flex items-center space-x-1">
            <div className="w-6 h-1 bg-green-500 rounded-full"></div>
            <div className="w-6 h-1 bg-green-500 rounded-full"></div>
            <div className="w-6 h-1 bg-red-600 rounded-full"></div>
            <div className="w-6 h-1 bg-gray-300 rounded-full"></div>
          </div>
          <span className="ml-2 text-[10px] text-gray-600">Step 3 of 4</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-3">
        {attributesLoading && (
          <div className="text-xs text-gray-600 p-3">Loading specifications...</div>
        )}

        {!attributesLoading && filteredAttributes.length === 0 && (
          <div className="text-xs text-gray-600 p-3">No specifications available for the selected category.</div>
        )}

        {!attributesLoading && filteredAttributes.length > 0 && (
          <div className="space-y-3">
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
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">{attr.label || attr.name}</label>
                  {isSelect ? (
                    <select
                      value={value}
                      onChange={(e) => handleSpecChange(attrId, e.target.value)}
                      className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                      className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentStep(4)}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Next: Product Settings
          </button>
        </div>
      </div>
    </div>
  );

  const renderProductSettingsForm = () => (
    <div className="space-y-3">
      {/* App Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center p-3 border-b border-gray-200">
          <button
            onClick={() => {
              setCurrentStep(filteredAttributes.length === 0 ? 2 : 3);
            }}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="ml-3 flex-1">
            <h1 className="text-base font-semibold text-gray-900">Product Settings</h1>
            <p className="text-xs text-gray-500">Configure product options</p>
          </div>
        </div>
        {/* Step Indicator */}
        <div className="flex items-center justify-center py-2 px-4 bg-gray-50">
          <div className="flex items-center space-x-1">
            <div className="w-6 h-1 bg-green-500 rounded-full"></div>
            <div className="w-6 h-1 bg-green-500 rounded-full"></div>
            <div className="w-6 h-1 bg-green-500 rounded-full"></div>
            <div className="w-6 h-1 bg-red-600 rounded-full"></div>
          </div>
          <span className="ml-2 text-[10px] text-gray-600">Step 4 of 4</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-3">

        <div className="grid grid-cols-1 gap-4">
          {/* Mobile: Single Column Layout */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Product Type</label>
              <select
                value={formData.productType}
                onChange={(e) => handleInputChange('productType', e.target.value)}
                className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select Type</option>
                <option value="physical">Physical Product</option>
                <option value="digital">Digital Product</option>
                <option value="service">Service</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Made In</label>
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
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Max Return Days <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.maxReturnDays}
                  onChange={(e) => handleInputChange('maxReturnDays', e.target.value)}
                  className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Manufacturer</label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter Manufacturer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">SKU (Product Code)</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter SKU (Product Code)"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">HSN Code</label>
              <input
                type="text"
                value={formData.hsnCode}
                onChange={(e) => handleInputChange('hsnCode', e.target.value)}
                className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter HSN Code"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">FSSAI Lic. No.</label>
              <input
                type="text"
                value={formData.fssaiLicNo}
                onChange={(e) => handleInputChange('fssaiLicNo', e.target.value)}
                className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="FSSAI Lic. No."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Self Life</label>
              <input
                type="text"
                value={formData.selfLife}
                onChange={(e) => handleInputChange('selfLife', e.target.value)}
                className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Till which status? <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.tillWhichStatus}
                  onChange={(e) => handleInputChange('tillWhichStatus', e.target.value)}
                  className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Total allowed quantity</label>
              <input
                type="number"
                value={formData.totalAllowedQuantity}
                onChange={(e) => handleInputChange('totalAllowedQuantity', e.target.value)}
                className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <p className="text-[10px] text-gray-500 mt-1">Leave blank for no limit</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Delivery Charges</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="pay_by_yourself"
                    checked={formData.deliveryOption === 'pay_by_yourself'}
                    onChange={(e) => handleInputChange('deliveryOption', e.target.value)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2 text-xs text-gray-700">Pay By Yourself <span className="text-green-600 font-medium">(Recommended)</span></span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="add_delivery_charge"
                    checked={formData.deliveryOption === 'add_delivery_charge'}
                    onChange={(e) => handleInputChange('deliveryOption', e.target.value)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2 text-xs text-gray-700">Add delivery charge</span>
                </label>

                {/* Show input only when Add delivery charge is selected */}
                {formData.deliveryOption === 'add_delivery_charge' && (
                  <div className="ml-5 mt-2">
                    <input
                      type="number"
                      value={formData.deliveryCharges}
                      onChange={(e) => handleInputChange('deliveryCharges', e.target.value)}
                      className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter charge amount"
                      min="0"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Amount in ₹</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-start space-x-4 mt-8">
          <button
            onClick={() => {
              // Handle save logic here
              console.log('Saving product:', { formData, variants });
            }}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
          <button
            onClick={() => {
              // Clear all form data
              setFormData({
                productName: '',
                category: '',
                tags: '',
                warranty: '',
                slug: '',
                tax: '',
                brands: '',
                accessoriesWarranty: '',
                description: '',
                mainImage: null,
                otherImages: [],
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
              setVariants([]);
              setCurrentVariant({
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
            }}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Clear
          </button>
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
            onClick={() => {
              // Go back to variants if no specifications, otherwise to specifications
              setCurrentStep(filteredAttributes.length === 0 ? 2 : 3);
            }}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={handleSaveProduct}
            disabled={isSaving}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Complete & Save Product'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderCreateProductForm = () => (
    <div className="space-y-3">
      {/* App Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center p-3 border-b border-gray-200">
          <button
            onClick={() => window.history.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="ml-3 flex-1">
            <h1 className="text-base font-semibold text-gray-900">Add Product</h1>
            <p className="text-xs text-gray-500">Fill required fields *</p>
          </div>
        </div>
        {/* Step Indicator */}
        <div className="flex items-center justify-center py-2 px-4 bg-gray-50">
          <div className="flex items-center space-x-1">
            <div className="w-6 h-1 bg-red-600 rounded-full"></div>
            <div className="w-6 h-1 bg-gray-300 rounded-full"></div>
            <div className="w-6 h-1 bg-gray-300 rounded-full"></div>
            <div className="w-6 h-1 bg-gray-300 rounded-full"></div>
          </div>
          <span className="ml-2 text-[10px] text-gray-600">Step 1 of 4</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-3">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter Product Name"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
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
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
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
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Warranty</label>
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
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
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
              <p className="text-[10px] text-gray-500 mt-1">Auto-generated from product name</p>
            </div>

            {/* <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Tax</label>
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
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Brands</label>
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
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Accessories Warranty</label>
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
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Description <span className="text-red-500">*</span>
          </label>
          <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
            <Editor
              apiKey="mymgdxo6ffoiic2k7k6vkhfkly8o4l8nfbiwz708p64ett2f"
              value={formData.description}
              onEditorChange={(content) => handleInputChange('description', content)}
              init={{
                height: 280,
                menubar: false,
                mobile: {
                  menubar: false,
                  toolbar_mode: 'scrolling'
                },
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                  'anchor', 'searchreplace', 'visualblocks', 'code',
                  'insertdatetime', 'media', 'table', 'emoticons', 'wordcount'
                ],
                toolbar:
                  'undo redo | blocks | ' +
                  'bold italic underline forecolor | ' +
                  'alignleft aligncenter alignright | ' +
                  'bullist numlist | link image | removeformat',
                toolbar_mode: 'scrolling',
                toolbar_sticky: false,
                statusbar: false,
                font_size_formats: '12px 14px 16px 18px 20px 24px',
                image_caption: true,
                automatic_uploads: true,
                placeholder: 'Enter product description...',
                branding: false,
                promotion: false,
                content_style:
                  'body { font-family: Roboto, Helvetica, Arial, sans-serif; font-size: 14px; padding: 10px; }'
              }}
            />
          </div>
          <p className="text-[10px] text-gray-500 mt-1.5">
            Format your product description with basic styling
          </p>
        </div>

        {/* Image Upload Sections */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Image */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
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
              <p className="text-sm text-blue-600 hover:text-blue-800">Choose File</p>
              <p className="text-xs text-gray-500 mt-2">
                *Please choose square image of larger than 350px*350px & smaller than 550px*550px
              </p>
            </div>
            {formData.mainImage && (
              <div className="mt-4 relative inline-block">
                <div className="relative group">
                  <img
                    src={URL.createObjectURL(formData.mainImage)}
                    alt="Main product image preview"
                    className="w-28 h-28 object-cover rounded-lg shadow-md"
                  />
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, mainImage: null }))}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-gray-600 text-center mt-1.5">
                  {(formData.mainImage.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>

          {/* Other Images */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
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
              <p className="text-sm text-blue-600 hover:text-blue-800">Choose Files</p>
              <p className="text-xs text-gray-500 mt-2">
                *Please choose square image of larger than 350px*350px & smaller than 550px*550px
              </p>
            </div>
            {formData.otherImages.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {formData.otherImages.map((file, index) => (
                  <div key={index} className="relative inline-block">
                    <div className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Product image ${index + 1} preview`}
                        className="w-24 h-24 object-cover rounded-lg shadow-md"
                      />
                      <button
                        onClick={() => removeImage(index, 'otherImages')}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 text-center mt-1">
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
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Next: Product Variants
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Scroll target reference */}
      <div ref={pageTopRef} className="absolute top-0 left-0" style={{ height: 0, width: 0 }}></div>

      {currentStep === 1 && renderCreateProductForm()}
      {currentStep === 2 && renderProductVariantForm()}
      {currentStep === 3 && renderProductSpecificationsForm()}
      {currentStep === 4 && renderProductSettingsForm()}
    </div>
  );
};

export default AddProduct;
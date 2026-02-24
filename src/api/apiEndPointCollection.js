// API Endpoint Collection
export const API_ENDPOINTS = {
  // Authentication
  SELLER_REGISTER: '/register',
  SELLER_LOGIN: '/login',

  //send & verify aadhar otp
  SEND_AADHAR_OTP: '/sandbox/aadhar/send-otp',
  VERIFY_AADHAR_OTP: '/sandbox/aadhar/verify-otp',

  // seller bank verification
  SELLER_BANK_VERIFICATION_CREATE_TASK: '/idfy-verification/bank-account/create-task',
  SELLER_BANK_VERIFICATION_GET_TASK: '/idfy-verification/bank-account/get-task',

  // Seller Category
  SELLER_CATEGORY: '/categories',

  // seller gst verification
  SELLER_GST_VERIFICATION_CREATE_TASK: '/gst-verification/create-task',
  SELLER_GST_VERIFICATION_GET_TASK: '/gst-verification/get-task',

  // seller commission
  SELLER_COMMISSION: '/seller_commission',

  // seller dashboard
  SELLER_DASHBOARD: '/dashboard',

  //seller orders
  SELLER_ORDERS: '/orders',

  // view order details
  VIEW_ORDER_DETAILS: '/orders/view',

  // assign delivery boy
  ASSIGN_DELIVERY_BOY: '/orders/assign_delivery_boy',

  //seller categories
  SELLER_CATEGORIES: '/selected-categories',

  // order status
  ORDER_STATUS: '/order_statuses',

  //stock management
  STOCK_MANAGEMENT: '/products/get_product_variants',

  // update stock
  UPDATE_STOCK: '/products/update_variant_stock',

  // get withdraw request
  GET_SELLER_WITHDRAW_REQUEST: '/withdrawal_requests/get',

  // create withdraw request
  CREATE_SELLER_WITHDRAW_REQUEST: '/withdrawal_requests/add',

  // seller wallet transactions
  SELLER_WALLET_TRANSACTIONS: '/seller_wallet_transactions',

  // bank verification
  SELLER_BANK_VERIFICATION_CREATE_TASK: '/idfy-verification/bank-account/create-task',
  SELLER_BANK_VERIFICATION_GET_TASK: '/idfy-verification/bank-account/get-task',

  // get seller brands
  SELLER_BRANDS: '/products/brands',

  //taxes
  SELLER_TAXES: '/products/taxes',

  //get all tags
  ALL_TAGS: '/products/tags',

  // get units
  SELLER_UNITS: '/units',

  // get seller categories for product creation
  SELLER_CATEGORIES_FOR_PRODUCT: '/categories/seller_categories',

  // get all brands
  ALL_BRANDS: '/products/brands/get',

  // get all colors
  ALL_COLORS: '/products/colors',

  // get all sizes
  ALL_SIZES: '/products/sizes',

  //get all materials
  ALL_MATERIALS: '/products/materials',

  //get all patterns
  ALL_PATTERNS: '/products/patterns',

  //get all units
  ALL_UNITS: '/units/get',

  //get all warranties
  ALL_WARRANTIES: '/products/warranties/get?limit=1000',

  //get all countries
  ALL_COUNTRIES: '/countries/active',

  //get all product attributes
  ALL_PRODUCT_ATTRIBUTES: '/products/attributes',

  //save product
  SAVE_PRODUCT: '/products/save',

  //update product
  UPDATE_PRODUCT: '/products/update',

  // seller profile
  SELLER_PROFILE: '/sellers/edit/',

  //sellet profile update 
  SELLER_PROFILE_UPDATE: '/sellers/update',

  //get all cities
  ALL_CITIES: '/cities',

  //toggle store status
  TOGGLE_STORE_STATUS: '/seller/toggle-store-status',

  //seller store status
  SELLER_STORE_STATUS: '/seller/store-status',

  //seller all products
  SELLER_ALL_PRODUCTS: '/products',

  //view seller product
  VIEW_SELLER_PRODUCT: '/products/edit',

  // get product by id for editing
  GET_PRODUCT_BY_ID: '/products/edit',

  // product delete
  PRODUCT_DELETE: '/products/delete',

  // get all active products
  GET_ALL_ACTIVE_PRODUCTS: '/products/active',

  // get customer ratings
  GET_CUSTOMER_RATINGS: '/customer/products/ratings_list',

  // seller mail and sms settings
  SELLER_MAIL_AND_SMS_SETTINGS: '/mail_settings',

  //seller mail and sms setting save
  BUYER_MAIL_AND_SMS_SETTINGS_SAVE: '/mail_settings/save',

  //save change password
  SAVE_CHANGE_PASSWORD: '/system_users/change_password',

  // assign delivery boy
  ASSIGN_DELIVERY_BOY: '/orders/assign_delivery_boy',

  //generate invoice
  GENERATE_INVOICE: '/orders/invoice',

  // download invoice
  DOWNLOAD_INVOICE: '/orders/invoice_download',

  // get top notifications
  GET_TOP_NOTIFICATIONS: '/get_top_notifications',

  // notification read
  NOTIFICATION_READ: '/notification_read',

  //clear cache
  CLEAR_CACHE: '/clear',

  //seller packet products
  SELLER_PRODUCT_INFO: '/products/product_info',

  // seller product sales report
  SELLER_PRODUCT_SALES_REPORT: '/product_sales_reports',

  // seller sales report
  SELLER_SALES_REPORT: '/sales_reports',

  // order accept
  ORDER_ACCEPT_AND_REJECT: '/orders/seller-order-status',

  //get all support tickets
  GET_ALL_SUPPORT_TICKETS_CATEGORIES: '/support-tickets/categories',

  // create support ticket
  CREATE_SUPPORT_TICKET: '/support-tickets/create',

  // get all support tickets
  GET_ALL_SUPPORT_TICKETS: '/support-tickets/all',

  // get support ticket details by id
  GET_SUPPORT_TICKET_DETAILS: '/support-tickets',

  //change product availability status
  CHANGE_PRODUCT_AVAILABILITY_STATUS: '/products/change',


};

export default API_ENDPOINTS;

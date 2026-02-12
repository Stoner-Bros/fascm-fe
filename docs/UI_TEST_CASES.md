# FASCM Frontend (FE) - UI Test Cases

**Version:** 2.0.0  
**Last Updated:** 2025-12-12  
**Author:** QA Team  
**Repository:** Stoner-Bros/fascm-fe

## Table of Contents
1. [Authentication Tests](#1-authentication-tests)
2. [Category Management Tests](#2-category-management-tests-feature1)
3. [Product Management Tests](#3-product-management-tests-feature2)
4. [Harvest Schedule Tests](#4-harvest-schedule-tests)
5. [Order Schedule Tests](#5-order-schedule-tests)
6. [Harvest Phase Tests](#6-harvest-phase-tests)
7. [Order Phase Tests](#7-order-phase-tests)
8. [Delivery Management Tests](#8-delivery-management-tests)
9. [Payment Tests](#9-payment-tests)
10. [Import/Export Ticket Tests](#10-importexport-ticket-tests)
11. [UI Components Tests](#11-ui-components-tests)
12. [Responsive Design Tests](#12-responsive-design-tests)

## Test Execution Summary
- **Total Test Cases:** 75
- **Passed:** [Manual entry]
- **Failed:** [Manual entry]
- **Blocked:** [Manual entry]

---

## 1. Authentication Tests

**Description:** This section covers all authentication-related test cases for the FASCM Frontend application. It focuses on testing the login functionality, which is the primary entry point for all users accessing the system. Tests include validating user credentials (email and password), role-based authentication and redirection (Supplier, Consignee, Admin), session management (persistence and logout), and various error scenarios such as invalid inputs, wrong credentials, and unauthorized access attempts. The authentication system uses JWT tokens stored in cookies and manages user state through Zustand store.

**API Functions Covered:**
- Function #1: Login (with email & password)

**Total Test Cases:** 8 (TC_FE_AUTH_001 to TC_FE_AUTH_008)

### 1.1 Login Function Tests

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_AUTH_001 | Login with valid credentials (Supplier) | 1. Navigate to /auth/sign-in 2. Enter email 'supplier@test.com' 3. Enter password 'Test@123' 4. Click 'Sign In' button 5. Observe redirect | User redirected to /supplier/dashboard. Toast notification shows "Đăng nhập thành công" (Login successful). JWT token stored in cookies. User data stored in Zustand auth store | User with email 'supplier@test.com' exists in DB with role 'Supplier' and status 'active' | | | | | | | | | | |
| TC_FE_AUTH_002 | Login with valid credentials (Consignee) | 1. Navigate to /auth/sign-in 2. Enter email 'consignee@test.com' 3. Enter password 'Test@123' 4. Click 'Sign In' button 5. Observe redirect | User redirected to /consignee/dashboard. Toast notification shows "Đăng nhập thành công". JWT token stored in cookies. User data stored in auth store | User with email 'consignee@test.com' exists in DB with role 'Consignee' and status 'active' | | | | | | | | | | |
| TC_FE_AUTH_003 | Login with valid credentials (Admin) | 1. Navigate to /auth/sign-in 2. Enter email 'admin@test.com' 3. Enter password 'Test@123' 4. Click 'Sign In' button 5. Observe redirect | User redirected to admin dashboard. Toast shows success message. Admin role permissions applied | User with email 'admin@test.com' exists in DB with Admin role and status 'active' | | | | | | | | | | |
| TC_FE_AUTH_004 | Login with invalid email format | 1. Navigate to /auth/sign-in 2. Enter email 'invalid-email' 3. Enter password 'Test@123' 4. Click 'Sign In' button | Form validation error appears under email field: "Enter a valid email address". Submit button disabled or form not submitted. No API call made | None | | | | | | | | | | |
| TC_FE_AUTH_005 | Login with empty password | 1. Navigate to /auth/sign-in 2. Enter valid email 3. Leave password field empty 4. Click 'Sign In' button | Form validation error appears: "Password is required". Form not submitted. No API call made | None | | | | | | | | | | |
| TC_FE_AUTH_006 | Login with wrong credentials | 1. Navigate to /auth/sign-in 2. Enter valid email 3. Enter wrong password 'WrongPass123' 4. Click 'Sign In' button | API returns error 401. Toast shows "Email hoặc mật khẩu không đúng" (Email or password incorrect). User not logged in | User exists but password is wrong | | | | | | | | | | |
| TC_FE_AUTH_007 | Session persistence after page reload | 1. Login successfully 2. Verify redirect to dashboard 3. Reload page (F5 or Ctrl+R) 4. Verify user still logged in | After reload: User remains on dashboard. Auth state persists. User data still in auth store. No redirect to login page | User logged in successfully | | | | | | | | | | |
| TC_FE_AUTH_008 | Logout and clear session | 1. Login successfully 2. Navigate to dashboard 3. Click user avatar/menu 4. Click "Logout" button 5. Observe behavior | User logged out. Redirected to /auth/sign-in or home page. JWT cookie cleared. Zustand auth store cleared (user: null). Toast shows "Đăng xuất thành công" | User logged in | | | | | | | | | | |

---

## 2. Category Management Tests (Feature1)

**Description:** This section tests the product category management features available to Admin users. Categories are used to organize products into logical groups (e.g., "Rau củ" - vegetables, "Trái cây" - fruits, "Ngũ cốc" - grains). Test cases cover creating new categories with validation checks, viewing all existing categories, and searching/filtering categories. These features are essential for maintaining an organized product catalog and enabling efficient product browsing for all users. Admin users have exclusive permissions to create and manage categories, while other users can only view them.

**API Functions Covered:**
- Function #2: Create Category (Admin only)
- Function #3: Get All Categories (All logged-in users)

**Total Test Cases:** 5 (TC_FE_CAT_001 to TC_FE_CAT_005)

### 2.1 Create Category

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_CAT_001 | Create new product category with valid data | 1. Login as Admin 2. Navigate to Categories page 3. Click "Create Category" button 4. Enter category name 'Rau củ' 5. Enter description 6. Click "Submit" | Category created successfully. Toast shows "Tạo danh mục thành công". New category appears in list. Category ID generated | Admin logged in | | | | | | | | | | |
| TC_FE_CAT_002 | Create category with empty name | 1. Login as Admin 2. Navigate to Categories page 3. Click "Create Category" 4. Leave name empty 5. Enter description 6. Click "Submit" | Form validation error: "Tên danh mục là bắt buộc". Form not submitted | Admin logged in | | | | | | | | | | |
| TC_FE_CAT_003 | Create category with duplicate name | 1. Login as Admin 2. Navigate to Categories page 3. Click "Create Category" 4. Enter existing category name 5. Click "Submit" | API returns error. Toast shows "Danh mục đã tồn tại". Category not created | Admin logged in. Category with same name exists | | | | | | | | | | |

### 2.2 Get All Categories

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_CAT_004 | View all product categories | 1. Login as any user 2. Navigate to Categories page 3. Observe category list | All categories displayed in list/grid. Each category shows: name, description, product count | User logged in. Categories exist | | | | | | | | | | |
| TC_FE_CAT_005 | Search categories by keyword | 1. Login as user 2. Navigate to Categories page 3. Enter search keyword 'Rau' 4. Observe filtered results | Category list filters to show only matching categories. Search works on name and description | User logged in. Multiple categories exist | | | | | | | | | | |

---

## 3. Product Management Tests (Feature2)

**Description:** This section validates the complete product management lifecycle, including creating new products, viewing product lists with pagination and filtering, searching products by name, and updating existing product information. Products are the core entities in the agricultural supply chain system and must include details such as name, category, price, unit of measurement, and optional product images. Admin users can perform all CRUD operations on products, while regular users can browse and search the product catalog. The tests ensure data integrity through validation of required fields, price constraints (must be positive), and proper handling of product images.

**API Functions Covered:**
- Function #4: Create Product (Admin only)
- Function #5: Get All Products (All logged-in users)
- Function #6: Update Product (Admin only)

**Total Test Cases:** 8 (TC_FE_PROD_001 to TC_FE_PROD_008)

### 3.1 Create Product

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_PROD_001 | Create new product with valid data | 1. Login as Admin 2. Navigate to Products page 3. Click "Create Product" 4. Enter product name, category, price, unit 5. Upload product image 6. Click "Submit" | Product created successfully. Toast shows "Tạo sản phẩm thành công". New product appears in list. Product has ID, image, and all entered data | Admin logged in. Category exists | | | | | | | | | | |
| TC_FE_PROD_002 | Create product with missing required fields | 1. Login as Admin 2. Navigate to create product form 3. Leave product name empty 4. Fill other fields 5. Click "Submit" | Form validation error: "Tên sản phẩm là bắt buộc". Form not submitted | Admin logged in | | | | | | | | | | |
| TC_FE_PROD_003 | Create product with invalid price | 1. Login as Admin 2. Navigate to create product form 3. Enter product name 4. Enter negative price '-100' 5. Click "Submit" | Form validation error: "Giá phải lớn hơn 0". Form not submitted | Admin logged in | | | | | | | | | | |

### 3.2 Get All Products

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_PROD_004 | View all products with pagination | 1. Login as user 2. Navigate to Products page 3. Observe product list 4. Navigate through pages | Product list displays with: image, name, price, unit, category. Pagination controls at bottom. Items per page selector (10/25/50) | User logged in. Multiple products exist (>10 for pagination) | | | | | | | | | | |
| TC_FE_PROD_005 | Filter products by category | 1. Login as user 2. Navigate to Products page 3. Select category filter 'Rau củ' 4. Observe filtered results | Product list filters to show only products in selected category. Filter indicator shows active filter | User logged in. Products in multiple categories exist | | | | | | | | | | |
| TC_FE_PROD_006 | Search products by name | 1. Login as user 2. Navigate to Products page 3. Enter product name in search 4. Press Enter 5. Observe results | Search returns matching products. Results filter in real-time or on submit. No results message if no matches | User logged in. Multiple products exist | | | | | | | | | | |

### 3.3 Update Product

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_PROD_007 | Update product information | 1. Login as Admin 2. Navigate to Products page 3. Click on a product 4. Click "Edit" button 5. Update price and description 6. Click "Save Changes" | Product updated successfully. Toast shows "Cập nhật sản phẩm thành công". Changes reflected in product list and detail view | Admin logged in. Product exists | | | | | | | | | | |
| TC_FE_PROD_008 | Update product with invalid data | 1. Login as Admin 2. Open product edit form 3. Enter invalid price '0' 4. Click "Save Changes" | Form validation error: "Giá phải lớn hơn 0". Update not saved. Error message displayed | Admin logged in. Product exists | | | | | | | | | | |

---

## 4. Harvest Schedule Tests

**Description:** This section tests the harvest schedule management functionality that allows Suppliers to plan and request approval for their agricultural harvest activities. A harvest schedule includes details about which products will be harvested, quantities, harvest dates, location (selected via interactive map), and supporting certificates. The workflow involves Suppliers creating schedules with "Pending" status, which then require Admin approval before proceeding to harvest phases. Tests cover the complete lifecycle: creation with various validation scenarios, viewing schedules (both all schedules for Admin and personal schedules for Suppliers), updating pending schedules, and managing schedule status transitions (Approve, Reject, Cancel). This is a critical feature for supply chain planning and traceability.

**API Functions Covered:**
- Function #7: Create Harvest Schedule (Supplier only)
- Function #8: Get All Harvest Schedules (Admin/Staff view)
- Function #9: Get My Harvest Schedules (Supplier view - own schedules only)
- Function #10: Update Harvest Schedule (Supplier - pending schedules only)
- Function #11: Update Schedule Status - Approve/Reject/Cancel (Admin/Supplier with appropriate permissions)

**Total Test Cases:** 11 (TC_FE_HARV_001 to TC_FE_HARV_011)

### 4.1 Create Harvest Schedule

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_HARV_001 | Supplier creates harvest schedule request | 1. Login as Supplier 2. Navigate to /supplier/harvest-schedules 3. Click "Create Harvest Schedule" button 4. Select products with quantities 5. Set harvest date 6. Upload certificates 7. Select location on map 8. Click "Submit" | Harvest schedule created successfully. Toast shows "Tạo lịch thu hoạch thành công". New schedule appears in list with status "Pending". Schedule ID generated | Supplier logged in. Products exist | | | | | | | | | | |
| TC_FE_HARV_002 | Create harvest schedule with past date | 1. Login as Supplier 2. Navigate to create harvest schedule form 3. Select products 4. Set harvest date in the past 5. Click "Submit" | Form validation error: "Ngày thu hoạch phải là ngày trong tương lai". Form not submitted | Supplier logged in | | | | | | | | | | |
| TC_FE_HARV_003 | Create harvest schedule without products | 1. Login as Supplier 2. Navigate to create harvest schedule form 3. Set harvest date 4. Leave products empty 5. Click "Submit" | Form validation error: "Phải chọn ít nhất một sản phẩm". Form not submitted | Supplier logged in | | | | | | | | | | |

### 4.2 Get All/My Harvest Schedules

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_HARV_004 | View all harvest schedules (Admin view) | 1. Login as Admin 2. Navigate to Harvest Schedules page 3. Observe list | All harvest schedules from all suppliers displayed. List shows: Schedule ID, supplier name, products, harvest date, status. Pagination available | User logged in. Harvest schedules exist | | | | | | | | | | |
| TC_FE_HARV_005 | Supplier views own harvest schedules | 1. Login as Supplier 2. Navigate to /supplier/harvest-schedules 3. Observe list | Only current supplier's harvest schedules displayed. Other suppliers' schedules not visible. List shows: Schedule ID, products, harvest date, status | Supplier logged in. Supplier has created harvest schedules | | | | | | | | | | |
| TC_FE_HARV_006 | Filter my harvest schedules by status | 1. Login as Supplier 2. Navigate to harvest schedules page 3. Select status filter "Approved" 4. Observe results | List filters to show only "Approved" schedules. Other statuses hidden. Filter indicator visible. Count updates | Supplier logged in. Schedules with different statuses exist | | | | | | | | | | |

### 4.3 Update Harvest Schedule

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_HARV_007 | Update pending harvest schedule | 1. Login as Supplier 2. Navigate to harvest schedules 3. Click on "Pending" schedule 4. Click "Edit" 5. Update harvest date and products 6. Click "Save Changes" | Schedule updated successfully. Toast shows "Cập nhật lịch thu hoạch thành công". Changes reflected in schedule details | Supplier logged in. Schedule exists with status "Pending" | | | | | | | | | | |
| TC_FE_HARV_008 | Attempt to update approved schedule | 1. Login as Supplier 2. Navigate to harvest schedules 3. Click on "Approved" schedule 4. Observe edit button state | Edit button disabled or not visible for approved schedules. Toast or message: "Không thể chỉnh sửa lịch đã được phê duyệt" | Supplier logged in. Schedule exists with status "Approved" | | | | | | | | | | |

### 4.4 Update Harvest Schedule Status

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_HARV_009 | Admin approves harvest schedule | 1. Login as Admin 2. Navigate to Harvest Schedules 3. Click on "Pending" schedule 4. Click "Approve" button 5. Confirm action | Schedule status changes to "Approved". Toast shows "Phê duyệt thành công". Supplier receives notification via Socket.IO | Admin logged in with approval permissions. Schedule status is "Pending" | | | | | | | | | | |
| TC_FE_HARV_010 | Admin rejects harvest schedule | 1. Login as Admin 2. Navigate to Harvest Schedules 3. Click on "Pending" schedule 4. Click "Reject" button 5. Enter rejection reason 6. Confirm | Schedule status changes to "Rejected". Rejection reason saved. Toast shows success. Supplier receives notification with reason | Admin logged in. Schedule status is "Pending" | | | | | | | | | | |
| TC_FE_HARV_011 | Supplier cancels own pending schedule | 1. Login as Supplier 2. Navigate to harvest schedules 3. Click on "Pending" schedule 4. Click "Cancel" button 5. Confirm cancellation | Schedule status changes to "Cancelled". Toast shows "Hủy lịch thành công". Schedule remains visible but marked as cancelled | Supplier logged in. Schedule status is "Pending" | | | | | | | | | | |

---

## 5. Order Schedule Tests

**Description:** This section validates the order schedule (purchase order) management system used by Consignees to request products from approved harvest schedules. The order creation process involves selecting products from available inventory (approved harvest schedules), specifying quantities (with validation against available stock), providing delivery details including address and delivery date, and selecting delivery location via an interactive map with OSRM route planning. Tests cover the full order lifecycle: creation with multi-step validation, viewing orders (all orders for Admin/Staff, personal orders for Consignees), searching and filtering orders, updating pending orders, and managing order status (Approve, Reject, Cancel). The order status workflow ensures proper authorization and prevents unauthorized modifications to orders already in progress.

**API Functions Covered:**
- Function #12: Create Order Schedule (Consignee only)
- Function #13: Get All Order Schedules (Admin/Staff view)
- Function #14: Get My Order Schedules (Consignee view - own orders only)
- Function #15: Update Order Schedule (Consignee - pending orders only)
- Function #16: Update Order Schedule Status - Approve/Reject/Cancel (Admin/Staff/Consignee with appropriate permissions)

**Total Test Cases:** 10 (TC_FE_ORD_001 to TC_FE_ORD_010)

### 5.1 Create Order Schedule

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_ORD_001 | Consignee creates order schedule | 1. Login as Consignee 2. Navigate to /consignee/orders/new 3. Select products from approved harvest schedules 4. Specify quantities 5. Enter delivery address 6. Select delivery date 7. Click "Submit Order" | Order schedule created successfully. Toast shows "Đặt hàng thành công". Order appears in list with status "Pending". Order ID generated. Redirected to order detail page | Consignee logged in. Approved harvest schedules with available products exist | | | | | | | | | | |
| TC_FE_ORD_002 | Create order with quantity exceeding availability | 1. Login as Consignee 2. Navigate to create order 3. Select product 4. Enter quantity greater than available 5. Attempt to submit | Form validation error: "Số lượng vượt quá số lượng có sẵn". Order not created. Available quantity displayed | Consignee logged in. Product with limited quantity | | | | | | | | | | |
| TC_FE_ORD_003 | Create order with delivery location on map | 1. Login as Consignee 2. Navigate to create order Step 2 3. Click "Select Location on Map" 4. Map opens 5. Click on location 6. Confirm selection 7. Complete order | Map modal opens with OpenStreetMap. Click places marker. Address auto-populated via OSRM. Latitude/longitude saved. Order created with location data | Consignee logged in. Step 1 completed | | | | | | | | | | |

### 5.2 Get All/My Order Schedules

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_ORD_004 | View all order schedules (Admin/Staff view) | 1. Login as Admin or Staff 2. Navigate to Orders page 3. Observe list | All order schedules from all consignees displayed. List shows: Order ID, consignee name, products, total amount, delivery date, status. Pagination and filters available | User logged in with appropriate role. Order schedules exist | | | | | | | | | | |
| TC_FE_ORD_005 | Consignee views own order schedules | 1. Login as Consignee 2. Navigate to /consignee/orders 3. Observe list | Only current consignee's orders displayed. Other consignees' orders not visible. List shows: Order ID, products, total, delivery date, status, payment status | Consignee logged in. Consignee has created orders | | | | | | | | | | |
| TC_FE_ORD_006 | Search my orders by order number | 1. Login as Consignee 2. Navigate to orders page 3. Enter order number in search 4. Press Enter | Search returns matching order(s). Exact match prioritized. Order details displayed | Consignee logged in. Multiple orders exist | | | | | | | | | | |

### 5.3 Update Order Schedule & Status

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_ORD_007 | Update pending order schedule | 1. Login as Consignee 2. Navigate to orders 3. Click on "Pending" order 4. Click "Edit" 5. Update delivery address or date 6. Click "Save Changes" | Order updated successfully. Toast shows "Cập nhật đơn hàng thành công". Changes reflected in order details | Consignee logged in. Order exists with status "Pending" | | | | | | | | | | |
| TC_FE_ORD_008 | Admin/Staff approves order schedule | 1. Login as Admin or Staff 2. Navigate to Orders 3. Click on "Pending" order 4. Click "Approve" button 5. Confirm action | Order status changes to "Approved". Toast shows success message. Consignee receives notification. Order can proceed to phases | User logged in with approval permissions. Order status is "Pending" | | | | | | | | | | |
| TC_FE_ORD_009 | Admin/Staff rejects order schedule | 1. Login as Admin or Staff 2. Navigate to Orders 3. Click on "Pending" order 4. Click "Reject" button 5. Enter reason 6. Confirm | Order status changes to "Rejected". Reason saved. Consignee receives notification with reason. Order cannot proceed | User logged in with approval permissions. Order status is "Pending" | | | | | | | | | | |
| TC_FE_ORD_010 | Consignee cancels pending order | 1. Login as Consignee 2. Navigate to orders 3. Click on "Pending" or "Approved" order 4. Click "Cancel" button 5. Confirm cancellation | Confirmation modal appears. After confirm: Order status changes to "Cancelled". Toast shows "Đơn hàng đã được hủy". Refund initiated if paid | Consignee logged in. Order status is "Pending" or "Approved" | | | | | | | | | | |

---

## 6. Harvest Phase Tests

**Description:** This section tests the harvest phase tracking system that breaks down the harvest process into distinct stages (e.g., "Chuẩn bị đất" - land preparation, "Gieo trồng" - planting, "Chăm sóc" - care/maintenance, "Thu hoạch" - harvesting). Phases can only be created for approved harvest schedules and follow a sequential workflow with status transitions (Pending → In Progress → Completed). Each phase includes start and completion dates, descriptions, and the ability to upload proof images documenting the work performed. Tests validate phase creation (single and multiple phases), status progression with proper transition rules (e.g., cannot complete without starting), and the upload of visual evidence with validation for file types and sizes. This feature provides transparency and traceability throughout the agricultural production process.

**API Functions Covered:**
- Function #17: Create one or Multiple Harvest Phase(s) (Supplier/Admin - for approved schedules)
- Function #18: Update Harvest Phase Status (Supplier - valid status transitions only)
- Function #19: Upload Harvest Phase Proof - Upload images (Supplier - JPG/PNG files)

**Total Test Cases:** 8 (TC_FE_HPHASE_001 to TC_FE_HPHASE_008)

### 6.1 Create Harvest Phases

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_HPHASE_001 | Create single harvest phase | 1. Login as Supplier or Admin 2. Navigate to approved harvest schedule 3. Click "Add Phase" button 4. Enter phase name 'Chuẩn bị đất' 5. Set start date, expected completion date 6. Enter description 7. Click "Create" | Harvest phase created successfully. Toast shows success message. Phase appears in schedule timeline. Phase status is "Pending" | User logged in with permissions. Harvest schedule status is "Approved" | | | | | | | | | | |
| TC_FE_HPHASE_002 | Create multiple harvest phases | 1. Login as Supplier or Admin 2. Navigate to approved harvest schedule 3. Click "Add Multiple Phases" 4. Add phases: Chuẩn bị, Gieo trồng, Chăm sóc, Thu hoạch 5. Set dates for each 6. Click "Create All" | Multiple phases created successfully. All phases appear in timeline in order. Each phase has status "Pending". Toast shows "Tạo các giai đoạn thành công" | User logged in. Harvest schedule status is "Approved" | | | | | | | | | | |

### 6.2 Update Harvest Phase Status

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_HPHASE_003 | Update harvest phase status to In Progress | 1. Login as Supplier 2. Navigate to harvest schedule 3. Click on "Pending" phase 4. Click "Start Phase" button 5. Confirm | Phase status changes to "In Progress". Toast shows success. Start date recorded. Phase highlighted in timeline | Supplier logged in. Phase status is "Pending" | | | | | | | | | | |
| TC_FE_HPHASE_004 | Complete harvest phase | 1. Login as Supplier 2. Navigate to "In Progress" phase 3. Click "Complete Phase" button 4. Confirm completion | Phase status changes to "Completed". Completion date recorded. Next phase becomes available to start. Toast shows success | Supplier logged in. Phase status is "In Progress" | | | | | | | | | | |
| TC_FE_HPHASE_005 | Attempt invalid phase status transition | 1. Login as Supplier 2. Navigate to "Pending" phase 3. Try to mark as "Completed" without starting | Action blocked. Error message: "Phải bắt đầu giai đoạn trước khi hoàn thành". Status remains "Pending" | Supplier logged in. Phase status is "Pending" | | | | | | | | | | |

### 6.3 Upload Harvest Phase Proof

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_HPHASE_006 | Upload image proof for harvest phase | 1. Login as Supplier 2. Navigate to harvest phase details 3. Click "Upload Proof" button 4. Select valid image file (JPG/PNG, <5MB) 5. Add description 6. Click "Upload" | Image uploaded successfully. Progress indicator shows during upload. Image displayed in phase details with description. Upload timestamp recorded. Toast shows success | Supplier logged in. Phase exists. Valid image file available | | | | | | | | | | |
| TC_FE_HPHASE_007 | Upload multiple proof images | 1. Login as Supplier 2. Navigate to phase 3. Upload image 1 4. Upload image 2 5. Upload image 3 | All images uploaded successfully. All images displayed in phase details. Image gallery/carousel shows all proofs | Supplier logged in. Phase exists | | | | | | | | | | |
| TC_FE_HPHASE_008 | Attempt to upload invalid file type | 1. Login as Supplier 2. Navigate to phase 3. Select PDF or other non-image file 4. Attempt upload | Upload rejected. Error message: "Chỉ chấp nhận file ảnh JPG, PNG". File not uploaded | Supplier logged in. Non-image file available | | | | | | | | | | |

---

## 7. Order Phase Tests

**Description:** This section validates the order fulfillment phase tracking system that manages the journey of an order from approval to delivery. Order phases typically include stages like "Xử lý đơn hàng" (Order Processing), "Đóng gói" (Packing), "Vận chuyển" (Shipping), and "Giao hàng" (Delivery). Similar to harvest phases, order phases can only be created for approved orders and follow a sequential status progression. Staff members manage these phases, updating their status as work progresses, and upload proof images at each stage. Tests cover creating individual and multiple phases, managing status transitions with appropriate notifications to Consignees, uploading proof documentation, and the Consignee's ability to view uploaded proofs for transparency. The final delivery phase completion triggers the order status change to "Delivered."

**API Functions Covered:**
- Function #20: Create one or Multiple Order Phase(s) (Admin/Staff - for approved orders)
- Function #21: Update Order Phase Status (Staff - valid status transitions)
- Function #22: Upload Order Phase Proof - Upload images (Staff - with Consignee viewing access)

**Total Test Cases:** 6 (TC_FE_OPHASE_001 to TC_FE_OPHASE_006)

### 7.1 Create Order Phases

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_OPHASE_001 | Create single order phase | 1. Login as Admin or Staff 2. Navigate to approved order 3. Click "Add Phase" button 4. Enter phase name 'Xử lý đơn hàng' 5. Set expected dates 6. Click "Create" | Order phase created successfully. Phase appears in order timeline. Phase status is "Pending". Toast shows success message | User logged in with permissions. Order status is "Approved" | | | | | | | | | | |
| TC_FE_OPHASE_002 | Create multiple order phases | 1. Login as Admin or Staff 2. Navigate to approved order 3. Click "Add Multiple Phases" 4. Add phases: Processing, Packing, Shipping, Delivery 5. Set dates for each 6. Click "Create All" | Multiple phases created in sequence. All phases visible in order timeline. First phase status "Pending", others "Not Started". Toast shows success | User logged in. Order status is "Approved" | | | | | | | | | | |

### 7.2 Update Order Phase Status

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_OPHASE_003 | Update order phase status progression | 1. Login as Staff 2. Navigate to order 3. Click on current phase 4. Click "Move to Next Status" 5. Confirm | Phase status progresses: Pending → In Progress → Completed. Toast shows success. Next phase becomes active. Consignee receives notification | Staff logged in. Phase exists. Valid status transition available | | | | | | | | | | |
| TC_FE_OPHASE_004 | Complete final order phase (Delivery) | 1. Login as Staff 2. Navigate to order 3. Click on "Delivery" phase 4. Click "Mark as Delivered" 5. Confirm | Final phase status changes to "Completed". Order status changes to "Delivered". Delivery date recorded. Consignee receives notification. Toast shows "Giao hàng thành công" | Staff logged in. Order is in Delivery phase | | | | | | | | | | |

### 7.3 Upload Order Phase Proof

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_OPHASE_005 | Upload proof for order phase | 1. Login as Staff 2. Navigate to order phase 3. Click "Upload Proof" 4. Select image file 5. Add description 6. Click "Upload" | Image uploaded successfully. Image displayed in phase details. Timestamp recorded. Consignee can view proof in order details | Staff logged in. Order phase exists. Valid image file available | | | | | | | | | | |
| TC_FE_OPHASE_006 | View uploaded phase proofs as Consignee | 1. Login as Consignee 2. Navigate to order details 3. Click on completed phase 4. View proof images | All uploaded proofs visible. Images displayed in gallery. Descriptions and timestamps shown. Download option available | Consignee logged in. Order phase has uploaded proofs | | | | | | | | | | |

---

## 8. Delivery Management Tests

**Description:** This section tests the delivery management and real-time tracking system for order fulfillment. Deliveries are created by Admin/Staff after the packing phase is complete and involve assigning a driver/vehicle, calculating optimized routes using OSRM (Open Source Routing Machine), and setting estimated delivery times. The system supports real-time GPS tracking via Socket.IO, allowing Consignees to monitor their delivery's current location, route, and estimated arrival time on an interactive map. Tests validate delivery creation with route planning, status updates (Pending Pickup → In Transit → Delivered), real-time tracking functionality, and the completion process including proof of delivery photo uploads and optional consignee signatures. This feature enhances transparency and customer satisfaction in the supply chain.

**API Functions Covered:**
- Function #23: Create Delivery (Admin/Staff - for orders with completed packing phase)
- Function #24: Update Delivery Status (Driver/Staff - status transitions with real-time tracking)

**Total Test Cases:** 5 (TC_FE_DEL_001 to TC_FE_DEL_005)

### 8.1 Create Delivery

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_DEL_001 | Create delivery for order | 1. Login as Admin or Staff 2. Navigate to order with completed packing phase 3. Click "Create Delivery" button 4. Assign driver/vehicle 5. Set estimated delivery time 6. Click "Create" | Delivery created successfully. Delivery ID generated. Status is "Pending Pickup". Toast shows success. Consignee receives notification with tracking info | User logged in with permissions. Order phase exists and is ready for delivery | | | | | | | | | | |
| TC_FE_DEL_002 | Create delivery with route planning | 1. Login as Staff 2. Navigate to create delivery 3. View delivery location on map 4. System calculates route using OSRM 5. Review route and distance 6. Confirm delivery creation | Delivery created with optimized route. Route displayed on map. Distance and estimated time shown. Delivery assigned to driver | Staff logged in. Order has delivery location. OSRM service available | | | | | | | | | | |

### 8.2 Update Delivery Status

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_DEL_003 | Update delivery status to In Transit | 1. Login as Driver or Staff 2. Navigate to delivery 3. Click "Start Delivery" button 4. Confirm | Delivery status changes to "In Transit". Start time recorded. Real-time tracking activated. Consignee can track on map. Socket.IO sends location updates | Driver/Staff logged in. Delivery status is "Pending Pickup" | | | | | | | | | | |
| TC_FE_DEL_004 | Track delivery in real-time | 1. Login as Consignee 2. Navigate to order details 3. Click "Track Delivery" 4. Observe map | Map displays with: Current delivery location (moving marker), Delivery route from OSRM, Destination marker, ETA. Map updates in real-time via Socket.IO every 5-10 seconds | Consignee logged in. Delivery status is "In Transit". Real-time tracking active | | | | | | | | | | |
| TC_FE_DEL_005 | Complete delivery | 1. Login as Driver 2. Navigate to delivery 3. Click "Mark as Delivered" 4. Upload proof of delivery photo 5. Get consignee signature (optional) 6. Confirm | Delivery status changes to "Delivered". Completion time recorded. Order status updates to "Delivered". Proof uploaded. Toast shows success. All parties receive notification | Driver logged in. Delivery is "In Transit" and at destination | | | | | | | | | | |

---

## 9. Payment Tests

**Description:** This section validates the payment processing system integrated with two payment gateways: VNPay and PayOS. Consignees can pay for approved orders using either platform. The VNPay integration redirects users to the VNPay payment gateway, processes the payment with test sandbox credentials, and handles the callback with success/failure status updates. The PayOS integration generates QR codes for mobile payment scanning and provides real-time payment status checking. Tests cover the complete payment workflow: initiating payments through both gateways, handling successful payments with order status updates and notifications to Suppliers, managing payment cancellations, querying payment status via PayOS API, and viewing/downloading payment receipts. Payment security and proper transaction ID tracking are critical aspects validated in these tests.

**API Functions Covered:**
- Function #25: Create Payment (Consignee - via VNPay or PayOS gateways)
- Function #26: Get PayOS Payment Info - Query payment status (Consignee - check payment status)

**Total Test Cases:** 6 (TC_FE_PAY_001 to TC_FE_PAY_006)

### 9.1 Create Payment

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_PAY_001 | Create payment via VNPay | 1. Login as Consignee 2. Navigate to approved order 3. Click "Proceed to Payment" button 4. Select VNPay payment method 5. Click "Pay Now" | Redirected to VNPay payment gateway. Payment amount correct. Order ID passed to VNPay. Return URL configured. Payment transaction ID generated | Consignee logged in. Order exists with status "Approved" and "Pending Payment" | | | | | | | | | | |
| TC_FE_PAY_002 | Complete VNPay payment successfully | 1. At VNPay gateway (from TC_FE_PAY_001) 2. Enter test card details 3. Complete payment 4. Observe redirect back | Redirected back to application with success status. Order payment status updates to "Paid". Toast shows "Thanh toán thành công". Payment receipt available. Supplier receives notification | VNPay sandbox credentials available. Payment initiated | | | | | | | | | | |
| TC_FE_PAY_003 | Cancel VNPay payment | 1. At VNPay gateway 2. Click "Cancel" or "Back" button | Redirected back to application. Order payment status remains "Pending Payment". Toast shows "Thanh toán bị hủy". User can retry payment | Payment initiated at VNPay | | | | | | | | | | |
| TC_FE_PAY_004 | Create payment via PayOS | 1. Login as Consignee 2. Navigate to order 3. Select PayOS payment method 4. Click "Pay Now" | Redirected to PayOS payment page. Payment code generated. QR code displayed for scanning. Amount and order details correct | Consignee logged in. Order pending payment | | | | | | | | | | |

### 9.2 Get PayOS Payment Info

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_PAY_005 | Query PayOS payment status | 1. Login as Consignee 2. Navigate to order with PayOS payment 3. Click "Check Payment Status" 4. Observe status | System queries PayOS API. Payment status displayed: Pending/Success/Failed. If successful: Order payment status updates automatically. Toast shows current status | Consignee logged in. Payment code exists in PayOS system | | | | | | | | | | |
| TC_FE_PAY_006 | View payment receipt | 1. Login as Consignee 2. Navigate to paid order 3. Click "View Receipt" button | Payment receipt displays with: Order ID, payment method, amount, payment date, transaction ID. Download/Print option available | Consignee logged in. Order payment status is "Paid" | | | | | | | | | | |

---

## 10. Import/Export Ticket Tests

**Description:** This section validates the warehouse inventory management system through import and export tickets. Import tickets are created by warehouse Staff when receiving products from approved harvest schedules, recording quantities received, assigning storage areas, conducting quality checks (Pass/Fail with photo documentation), and updating inventory levels. Export tickets are created when fulfilling orders, verifying available inventory, deducting products from stock, and progressing order status. Both ticket types support filtering by storage area for organized warehouse management. Tests cover ticket creation workflows, quality control processes, inventory validation (preventing exports when stock is insufficient), area-based filtering, and the integration between tickets and the harvest/order schedules. This feature ensures accurate inventory tracking and supports warehouse operations efficiency.

**API Functions Covered:**
- Function #27: Create Import Ticket (Staff - record incoming inventory with quality checks)
- Function #28: Get Import Tickets By Area (Staff - filter import tickets by storage location)
- Function #29: Create Export Ticket (Staff - fulfill orders and deduct inventory)
- Function #30: Get Export Tickets By Area (Staff - filter export tickets by storage location)

**Total Test Cases:** 6 (TC_FE_IMP_001 to TC_FE_IMP_003, TC_FE_EXP_001 to TC_FE_EXP_003)

### 10.1 Import Ticket Tests

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_IMP_001 | Create import ticket | 1. Login as Staff 2. Navigate to Warehouse/Import Tickets 3. Click "Create Import Ticket" 4. Select harvest schedule/products 5. Enter quantities received 6. Select storage area 7. Add notes 8. Click "Create" | Import ticket created successfully. Ticket ID generated. Products added to inventory. Storage area updated. Toast shows "Tạo phiếu nhập thành công" | Staff logged in with warehouse role. Harvest schedule approved or products available | | | | | | | | | | |
| TC_FE_IMP_002 | Create import ticket with quality check | 1. Login as Staff 2. Navigate to create import ticket 3. Add products 4. For each product, enter quality check results 5. Mark quality status (Pass/Fail) 6. Upload quality check photos 7. Click "Create" | Import ticket created with quality data. Quality status recorded for each product. Photos attached. Only products passing quality check added to inventory | Staff logged in. Products available for import | | | | | | | | | | |
| TC_FE_IMP_003 | View import tickets filtered by storage area | 1. Login as Staff 2. Navigate to Import Tickets 3. Select area filter 'Area A' 4. Observe filtered results | List shows only import tickets for selected area. Each ticket shows: Ticket ID, import date, products, quantities, staff name. Total imported quantity per area displayed | Staff logged in. Storage area exists. Import tickets exist for that area | | | | | | | | | | |

### 10.2 Export Ticket Tests

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_EXP_001 | Create export ticket for order | 1. Login as Staff 2. Navigate to approved order 3. Click "Create Export Ticket" 4. Verify products and quantities 5. Select pickup area 6. Click "Create" | Export ticket created successfully. Ticket ID generated. Products deducted from inventory. Pickup area updated. Order status progresses. Toast shows success | Staff logged in. Order approved. Products available in inventory | | | | | | | | | | |
| TC_FE_EXP_002 | Attempt export with insufficient inventory | 1. Login as Staff 2. Navigate to order 3. Attempt to create export ticket 4. System checks inventory | Export blocked. Error message: "Số lượng tồn kho không đủ". Shows available vs required quantities. Export ticket not created | Staff logged in. Order requires more quantity than available in inventory | | | | | | | | | | |
| TC_FE_EXP_003 | View export tickets filtered by area | 1. Login as Staff 2. Navigate to Export Tickets 3. Select area filter 'Area B' 4. Observe filtered results | List shows only export tickets for selected area. Each ticket shows: Ticket ID, export date, order ID, products, quantities, staff name. Total exported quantity per area displayed | Staff logged in. Storage area exists. Export tickets exist for that area | | | | | | | | | | |

---

## 11. UI Components Tests

**Description:** This section tests the common UI components and user experience features shared across the entire application. These include the theme switcher (light/dark mode toggle with persistence), language switcher (English/Vietnamese using next-intl), toast notifications (success/error/info messages using Sonner library), loading states (spinners and skeletons during data fetching), and error handling (404 pages, form validation displays). These components are critical for providing a consistent, accessible, and user-friendly interface throughout all features. Tests ensure that user preferences persist across sessions, notifications display correctly with appropriate auto-dismiss behavior, loading indicators prevent interaction during async operations, and the application handles edge cases gracefully.

**API Functions Covered:**
- N/A - These are client-side UI components not directly mapped to backend APIs

**Total Test Cases:** 5 (TC_FE_UI_001 to TC_FE_UI_005)

### 11.1 Theme and Language

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_UI_001 | Toggle theme (light to dark) | 1. Login to any dashboard 2. Click theme toggle button (sun/moon icon) 3. Observe theme change | Theme switches from light to dark mode. All pages update: Background dark, Text light colored, Component styles adapt. Theme preference saved. Persists after page reload | User logged in | | | | | | | | | | |
| TC_FE_UI_002 | Switch language (English to Vietnamese) | 1. Login to any dashboard 2. Click language selector 3. Select "Tiếng Việt" 4. Observe language change | All UI text translates to Vietnamese. Buttons, labels, messages update. Language preference saved. Persists after page reload. next-intl handles translations | User logged in | | | | | | | | | | |
| TC_FE_UI_003 | Display toast notification | 1. Perform action that triggers notification (e.g., save profile) 2. Observe toast | Toast notification appears. Shows success/error icon. Message displayed correctly. Auto-dismisses after 3-5 seconds. Close button available | User logged in | | | | | | | | | | |
| TC_FE_UI_004 | Show loading spinner during data fetch | 1. Login to dashboard 2. Navigate to page with data loading 3. Observe loading state | Loading spinner/skeleton displayed while fetching. Prevents interaction during load. After data loads, spinner disappears, content renders | User logged in | | | | | | | | | | |
| TC_FE_UI_005 | Render 404 page for invalid routes | 1. Navigate to non-existent route (e.g., /invalid-page-12345) 2. Observe 404 page | Custom 404 error page displays. Shows "Page Not Found" message. "Go Home" button redirects to /. URL remains invalid | None | | | | | | | | | | |

---

## 12. Responsive Design Tests

**Description:** This section validates the responsive design implementation across different device sizes and screen resolutions using Tailwind CSS breakpoints. The application must provide optimal viewing and interaction experiences on mobile devices (<640px - smartphones), tablets (640-1024px - iPads), and desktop computers (>1024px - laptops and monitors). Tests verify that content adapts appropriately: stacking vertically on mobile with hamburger navigation menus, utilizing 2-column layouts on tablets with collapsible sidebars, and displaying full multi-column layouts with persistent sidebars on desktop. Specific attention is paid to touch-friendly button sizes on mobile, readable text without horizontal scrolling, proper table handling (scrolling or adapting), and consistent functionality across all viewport sizes. This ensures accessibility and usability for all users regardless of their device.

**API Functions Covered:**
- N/A - These are client-side responsive design validations not directly mapped to backend APIs

**Total Test Cases:** 3 (TC_FE_RESP_001 to TC_FE_RESP_003)

### 12.1 Mobile, Tablet, Desktop Layouts

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_RESP_001 | Test mobile layout (<640px) | 1. Open application on mobile device or resize browser to <640px 2. Navigate through all pages 3. Test interactions | All content stacks vertically. Text readable without horizontal scroll. Buttons appropriately sized for touch. Hamburger menu for navigation. Forms usable. Tables scroll or adapt | None | | | | | | | | | | |
| TC_FE_RESP_002 | Test tablet layout (640-1024px) | 1. Open application on tablet or resize browser to 768px 2. Navigate through pages 3. Test layout | Sidebar may collapse or remain visible. Content uses space efficiently. Grid layouts show 2 columns. Navigation adapted for touch. Forms utilize width | None | | | | | | | | | | |
| TC_FE_RESP_003 | Test desktop layout (>1024px) | 1. Open application on desktop (1920x1080 or larger) 2. Navigate through pages 3. Observe layout | Full sidebar visible. Content centered with max-width. Multi-column layouts. All features accessible. Hover states work. Optimal reading width | None | | | | | | | | | | |

---

## API Function Coverage Map

| No | Function Name | Test Case IDs | Status |
| :--- | :--- | :--- | :--- |
| 1 | Login | TC_FE_AUTH_001 to TC_FE_AUTH_008 | Covered |
| 2 | Create Category | TC_FE_CAT_001 to TC_FE_CAT_003 | Covered |
| 3 | Get All Categories | TC_FE_CAT_004, TC_FE_CAT_005 | Covered |
| 4 | Create Product | TC_FE_PROD_001 to TC_FE_PROD_003 | Covered |
| 5 | Get All Products | TC_FE_PROD_004 to TC_FE_PROD_006 | Covered |
| 6 | Update Product | TC_FE_PROD_007, TC_FE_PROD_008 | Covered |
| 7 | Create Harvest Schedule | TC_FE_HARV_001 to TC_FE_HARV_003 | Covered |
| 8 | Get All Harvest Schedules | TC_FE_HARV_004 | Covered |
| 9 | Get My Harvest Schedules | TC_FE_HARV_005, TC_FE_HARV_006 | Covered |
| 10 | Update Harvest Schedule | TC_FE_HARV_007, TC_FE_HARV_008 | Covered |
| 11 | Update Schedule Status | TC_FE_HARV_009 to TC_FE_HARV_011 | Covered |
| 12 | Create Order Schedule | TC_FE_ORD_001 to TC_FE_ORD_003 | Covered |
| 13 | Get All Order Schedules | TC_FE_ORD_004 | Covered |
| 14 | Get My Order Schedules | TC_FE_ORD_005, TC_FE_ORD_006 | Covered |
| 15 | Update Order Schedule | TC_FE_ORD_007 | Covered |
| 16 | Update Order Schedule Status | TC_FE_ORD_008 to TC_FE_ORD_010 | Covered |
| 17 | Create Harvest Phase(s) | TC_FE_HPHASE_001, TC_FE_HPHASE_002 | Covered |
| 18 | Update Harvest Phase Status | TC_FE_HPHASE_003 to TC_FE_HPHASE_005 | Covered |
| 19 | Upload Harvest Phase Proof | TC_FE_HPHASE_006 to TC_FE_HPHASE_008 | Covered |
| 20 | Create Order Phase(s) | TC_FE_OPHASE_001, TC_FE_OPHASE_002 | Covered |
| 21 | Update Order Phase Status | TC_FE_OPHASE_003, TC_FE_OPHASE_004 | Covered |
| 22 | Upload Order Phase Proof | TC_FE_OPHASE_005, TC_FE_OPHASE_006 | Covered |
| 23 | Create Delivery | TC_FE_DEL_001, TC_FE_DEL_002 | Covered |
| 24 | Update Delivery Status | TC_FE_DEL_003 to TC_FE_DEL_005 | Covered |
| 25 | Create Payment | TC_FE_PAY_001 to TC_FE_PAY_004 | Covered |
| 26 | Get PayOS Payment Info | TC_FE_PAY_005, TC_FE_PAY_006 | Covered |
| 27 | Create Import Ticket | TC_FE_IMP_001, TC_FE_IMP_002 | Covered |
| 28 | Get Import Tickets By Area | TC_FE_IMP_003 | Covered |
| 29 | Create Export Ticket | TC_FE_EXP_001, TC_FE_EXP_002 | Covered |
| 30 | Get Export Tickets By Area | TC_FE_EXP_003 | Covered |

**Total Test Cases: 75**  
**API Function Coverage: 30/30 (100%)**

---

**Document End**

**Next Review Date:** 2025-03-12  
**Approval:** [Pending]  
**Change Log:**
- 2025-12-12 v2.0.0: Complete version with all 75 detailed test cases covering all 30 API functions. All sections fully populated with test procedures, expected results, and pre-conditions.
- 2025-12-12 v1.0.0: Initial version created

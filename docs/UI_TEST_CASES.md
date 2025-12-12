# FASCM Frontend (FE) - UI Test Cases

**Version:** 1.0.0  
**Last Updated:** 2025-12-12  
**Author:** QA Team  
**Repository:** Stoner-Bros/fascm-fe

## Table of Contents
1. [Landing Page Tests](#1-landing-page-tests)
2. [Authentication Tests](#2-authentication-tests)
3. [Supplier Dashboard Tests](#3-supplier-dashboard-tests)
4. [Consignee Dashboard Tests](#4-consignee-dashboard-tests)
5. [Common UI Components Tests](#5-common-ui-components-tests)
6. [Real-time Features Tests](#6-real-time-features-tests)
7. [Responsive Design Tests](#7-responsive-design-tests)
8. [Accessibility Tests](#8-accessibility-tests)

## Test Execution Summary
- **Total Test Cases:** 56
- **Passed:** [Manual entry]
- **Failed:** [Manual entry]
- **Blocked:** [Manual entry]

---

## 1. Landing Page Tests

### 1.1 Hero Section Tests

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_LAND_001 | Display hero section correctly | 1. Navigate to home page (/) 2. Observe hero section content 3. Verify title, description, and CTA buttons are visible | Hero section displays with: background image, title with "Agriculture Supply Chain" highlight in green, description with blockchain and IoT mentions, "Sign In Supplier" and "Sign In Consignee" buttons visible | None | | | | | | | | | | |
| TC_FE_LAND_002 | Switch between Consignee/Supplier tabs in How It Works | 1. Navigate to home page (/) 2. Scroll to "How It Works" section 3. Click on "Consignee" tab 4. Verify content changes 5. Click on "Supplier" tab 6. Verify content changes | Tab switching works correctly. Consignee tab shows order process steps. Supplier tab shows harvest batch management steps. Content updates without page reload | None | | | | | | | | | | |
| TC_FE_LAND_003 | Navigate to sign-in page from hero | 1. Navigate to home page (/) 2. Click "Sign In Supplier" button in hero section | User redirected to /auth/sign-in page. URL changes correctly. Sign-in form is displayed | None | | | | | | | | | | |
| TC_FE_LAND_004 | Navigate to sign-up page | 1. Navigate to home page (/) 2. Scroll to footer or CTA section 3. Click "Get Started" or "Sign Up" button | User redirected to /auth/sign-up page. Registration form is displayed | None | | | | | | | | | | |
| TC_FE_LAND_005 | Track order by entering order code | 1. Navigate to home page (/) 2. Scroll to tracking section 3. Enter valid order code in input field 4. Click "Track Order" button | User redirected to order tracking page with order details. Order status and delivery information displayed on map | Order with entered code exists in system | | | | | | | | | | |
| TC_FE_LAND_006 | Responsive layout on mobile devices | 1. Open home page (/) on mobile viewport (<640px) 2. Scroll through all sections 3. Verify all sections are readable 4. Test navigation menu | All sections stack vertically. Text is readable. Images scale appropriately. Mobile navigation menu works (hamburger icon). CTA buttons are accessible | None | | | | | | | | | | |

### 1.2 Features Section Tests

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_LAND_007 | Display features section correctly | 1. Navigate to home page (/) 2. Scroll to Features section 3. Verify all feature cards are visible | Features section displays with cards showing: Blockchain transparency, IoT monitoring, Real-time tracking, Secure payments. Each card has icon, title, and description | None | | | | | | | | | | |

### 1.3 Footer Tests

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_LAND_008 | Footer links navigation | 1. Navigate to home page (/) 2. Scroll to footer 3. Click various footer links (About, Contact, Terms, Privacy) | All footer links are clickable. Links navigate to correct pages or sections. Social media icons are present | None | | | | | | | | | | |

---

## 2. Authentication Tests

### 2.1 Sign-In Tests

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_AUTH_001 | Login with valid credentials (Supplier role) | 1. Navigate to /auth/sign-in 2. Enter email 'supplier@test.com' 3. Enter password 'Test@123' 4. Click 'Sign In' button 5. Observe redirect | User redirected to /supplier/dashboard. Toast notification shows "Đăng nhập thành công" (Login successful). JWT token stored in cookies. User data stored in Zustand auth store | User with email 'supplier@test.com' exists in DB with role 'Supplier' and status 'active' | | | | | | | | | | |
| TC_FE_AUTH_002 | Login with valid credentials (Consignee role) | 1. Navigate to /auth/sign-in 2. Enter email 'consignee@test.com' 3. Enter password 'Test@123' 4. Click 'Sign In' button 5. Observe redirect | User redirected to /consignee/dashboard. Toast notification shows "Đăng nhập thành công". JWT token stored in cookies. User data stored in auth store | User with email 'consignee@test.com' exists in DB with role 'Consignee' and status 'active' | | | | | | | | | | |
| TC_FE_AUTH_003 | Login with invalid email format | 1. Navigate to /auth/sign-in 2. Enter email 'invalid-email' 3. Enter password 'Test@123' 4. Click 'Sign In' button | Form validation error appears under email field: "Enter a valid email address". Submit button disabled or form not submitted. No API call made | None | | | | | | | | | | |
| TC_FE_AUTH_004 | Login with empty password | 1. Navigate to /auth/sign-in 2. Enter valid email 3. Leave password field empty 4. Click 'Sign In' button | Form validation error appears: "Password is required". Form not submitted. No API call made | None | | | | | | | | | | |
| TC_FE_AUTH_005 | Login with inactive user account | 1. Navigate to /auth/sign-in 2. Enter email of inactive user 3. Enter correct password 4. Click 'Sign In' button | API returns error. Toast notification shows error message "Tài khoản đã bị vô hiệu hóa" (Account has been deactivated). User not logged in. No redirect occurs | User exists in DB with status 'inactive' | | | | | | | | | | |
| TC_FE_AUTH_006 | Redirect after successful login based on role | 1. Login as Supplier (TC_FE_AUTH_001) 2. Verify redirect to /supplier/dashboard 3. Logout 4. Login as Consignee (TC_FE_AUTH_002) 5. Verify redirect to /consignee/dashboard | Supplier redirected to supplier dashboard. Consignee redirected to consignee dashboard. Admin redirected to admin panel. Redirects are role-based and automatic | Users with different roles exist | | | | | | | | | | |
| TC_FE_AUTH_007 | Session persistence after page reload | 1. Login successfully (TC_FE_AUTH_001) 2. Verify redirect to dashboard 3. Reload page (F5 or Ctrl+R) 4. Verify user still logged in | After reload: User remains on dashboard. Auth state persists. User data still in auth store. No redirect to login page | User logged in successfully | | | | | | | | | | |
| TC_FE_AUTH_008 | Logout and clear session | 1. Login successfully 2. Navigate to dashboard 3. Click user avatar/menu 4. Click "Logout" button 5. Observe behavior | User logged out. Redirected to /auth/sign-in or home page. JWT cookie cleared. Zustand auth store cleared (user: null). Toast shows "Đăng xuất thành công" (Logged out successfully) | User logged in | | | | | | | | | | |
| TC_FE_AUTH_009 | Auto-redirect when accessing protected routes without auth | 1. Clear all cookies/session 2. Navigate directly to /supplier/dashboard 3. Observe redirect | User automatically redirected to /auth/sign-in. Toast shows "Vui lòng đăng nhập" (Please login). Original URL saved as callback parameter: /auth/sign-in?callbackUrl=/supplier/dashboard | No active session | | | | | | | | | | |

### 2.2 Sign-Up Tests

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_AUTH_010 | Register with valid data | 1. Navigate to /auth/sign-up 2. Enter firstName 'John' 3. Enter lastName 'Doe' 4. Enter email 'newuser@test.com' 5. Enter password 'Test@123' 6. Select role 'Supplier' 7. Click 'Sign Up' button | Registration successful. Toast shows "Đăng ký thành công" (Registration successful). User redirected to /auth/sign-in or auto-logged in. User account created in database | Email 'newuser@test.com' does not exist in system | | | | | | | | | | |
| TC_FE_AUTH_011 | Register with existing email | 1. Navigate to /auth/sign-up 2. Enter email that already exists 3. Fill other fields correctly 4. Click 'Sign Up' button | API returns error. Toast shows "Email đã được sử dụng" (Email already in use). Registration fails. User remains on sign-up page | User with entered email already exists | | | | | | | | | | |
| TC_FE_AUTH_012 | Register with weak password | 1. Navigate to /auth/sign-up 2. Enter valid email 3. Enter weak password '123' 4. Fill other fields 5. Click 'Sign Up' button | Form validation error: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt" (Password must have at least 8 characters including uppercase, lowercase, number and special character). Form not submitted | None | | | | | | | | | | |

---

## 3. Supplier Dashboard Tests

### 3.1 Dashboard Overview Tests

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_SUPP_001 | View dashboard statistics | 1. Login as Supplier 2. Navigate to /supplier/dashboard 3. Observe statistics cards | Dashboard displays statistics: Total harvest batches, Pending batches, Approved batches, Revenue (if applicable). Cards show numbers and trend indicators. Charts/graphs display data visualization | Supplier logged in with existing harvest batch data | | | | | | | | | | |

### 3.2 Harvest Batch Management Tests

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_SUPP_002 | Create new harvest batch with valid data | 1. Login as Supplier 2. Navigate to /supplier/harvest-batches 3. Click "Create Harvest Batch" button 4. Fill form: batchName, harvestDate, products, quantity 5. Click "Submit" | Harvest batch created successfully. Toast shows "Tạo lô thu hoạch thành công" (Harvest batch created successfully). Redirected to harvest batch list. New batch appears in list with status "Pending" | Supplier logged in | | | | | | | | | | |
| TC_FE_SUPP_003 | Create harvest batch with multiple products | 1. Login as Supplier 2. Navigate to create harvest batch form 3. Add product 1 with quantity 4. Click "Add Product" button 5. Add product 2 with quantity 6. Submit form | Multiple products added to batch. Each product shows in the form. Submission successful. Batch created with all products. Products list visible in batch details | Supplier logged in. Multiple products exist in system | | | | | | | | | | |
| TC_FE_SUPP_004 | Upload certificate file (valid format) | 1. Login as Supplier 2. Navigate to harvest batch form 3. Click certificate upload area 4. Select valid PDF/image file (<5MB) 5. Verify file preview 6. Submit form | File uploads successfully. Progress indicator shows during upload. File preview/name displayed. Form submission includes file. Certificate accessible in batch details | Supplier logged in. Valid certificate file prepared | | | | | | | | | | |
| TC_FE_SUPP_005 | Upload file exceeding size limit | 1. Login as Supplier 2. Navigate to file upload in harvest batch form 3. Select file >5MB 4. Attempt upload | Upload rejected. Error message: "Kích thước file vượt quá giới hạn 5MB" (File size exceeds 5MB limit). File not uploaded. User can select different file | Supplier logged in. File >5MB prepared | | | | | | | | | | |
| TC_FE_SUPP_006 | Select location using map picker | 1. Login as Supplier 2. Navigate to harvest batch form 3. Click "Select Location" button 4. Map modal opens 5. Click on map to select location 6. Confirm selection | Map opens with OpenStreetMap. Current location marker shown. Click adds new marker. Latitude/longitude captured. Modal closes. Location coordinates filled in form. Location display on map in details view | Supplier logged in. Browser location permission granted (optional) | | | | | | | | | | |
| TC_FE_SUPP_007 | Filter harvest batches by status | 1. Login as Supplier 2. Navigate to /supplier/harvest-batches 3. Click status filter dropdown 4. Select "Approved" 5. Observe filtered results | Batch list filters to show only "Approved" batches. Other statuses hidden. Filter indicator shows active filter. Count updates. Reset filter option available | Supplier logged in. Harvest batches with different statuses exist | | | | | | | | | | |
| TC_FE_SUPP_008 | Search harvest batches by keyword | 1. Login as Supplier 2. Navigate to harvest batch list 3. Enter batch name in search input 4. Press Enter or click search 5. Observe results | Search returns matching batches. Results filter in real-time or on submit. No results message if no matches. Search highlights or shows only matching items | Supplier logged in. Multiple harvest batches exist | | | | | | | | | | |
| TC_FE_SUPP_009 | View harvest batch details | 1. Login as Supplier 2. Navigate to harvest batch list 3. Click on a batch row/card 4. Observe details page | Redirected to /supplier/harvest-batches/[id]. Details page shows: Batch name, status badge (colored), harvest date, products list, quantities, certificates, location on map, QR code. Status history/timeline if available | Supplier logged in. Harvest batch exists | | | | | | | | | | |
| TC_FE_SUPP_010 | Update profile information | 1. Login as Supplier 2. Navigate to /supplier/profile 3. Update fields: firstName, lastName, phone 4. Click "Save Changes" | Profile updated successfully. Toast shows "Cập nhật thông tin thành công" (Profile updated successfully). New data displayed in profile. Changes reflect in user menu/avatar. Zustand store updates with new data | Supplier logged in | | | | | | | | | | |
| TC_FE_SUPP_011 | Receive real-time notifications | 1. Login as Supplier 2. Stay on dashboard 3. Admin approves a harvest batch (external action) 4. Observe notification | Real-time notification appears via Socket.IO. Toast notification shows: "Lô thu hoạch đã được phê duyệt" (Harvest batch approved). Notification bell icon updates with badge count. Dashboard statistics update automatically | Supplier logged in. Socket.IO connection active. Harvest batch pending approval | | | | | | | | | | |

### 3.3 Status Badge Display Tests

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_SUPP_012 | Display status badges correctly | 1. Login as Supplier 2. Navigate to harvest batch list 3. Observe different status badges | Status badges display with correct colors: Pending (yellow/orange), Approved (green), Rejected (red), Completed (blue). Badge text matches status. Consistent styling across all views | Supplier logged in. Batches with different statuses exist | | | | | | | | | | |

---

## 4. Consignee Dashboard Tests

### 4.1 Dashboard Overview Tests

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_CONS_001 | Browse available products | 1. Login as Consignee 2. Navigate to /consignee/products or browse section 3. View product list | Product catalog displays with: Product images, names, prices, quantities available, supplier info. Grid or list view available. Products from approved harvest batches only | Consignee logged in. Approved harvest batches exist | | | | | | | | | | |

### 4.2 Order Management Tests

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_CONS_002 | Create order - Step 1 (Select products) | 1. Login as Consignee 2. Navigate to /consignee/orders/new 3. Select products from catalog 4. Specify quantities 5. Click "Next" | Step 1 of multi-step form completed. Selected products show in cart/summary. Quantities editable. Total price calculated. "Next" button enabled. Progress indicator shows step 1 active | Consignee logged in. Available products exist | | | | | | | | | | |
| TC_FE_CONS_003 | Create order - Step 2 (Delivery details) | 1. Complete Step 1 (TC_FE_CONS_002) 2. Enter delivery address 3. Select delivery date 4. Choose delivery time slot 5. Click "Next" | Step 2 form accepts delivery details. Date picker allows future dates only. Address field validation works. Progress indicator shows step 2 active. "Back" button returns to step 1. Data persists when navigating back/forward | Step 1 completed | | | | | | | | | | |
| TC_FE_CONS_004 | Create order - Step 3 (Review and submit) | 1. Complete Steps 1-2 2. Review order summary 3. Verify products, quantities, delivery details 4. Check total price 5. Click "Submit Order" | Order summary displays all details: Products with quantities and prices, Delivery address and date, Total amount. "Submit" creates order. Toast shows "Đặt hàng thành công" (Order placed successfully). Redirected to order detail page. Order ID generated | Steps 1-2 completed | | | | | | | | | | |
| TC_FE_CONS_005 | Select delivery location on map | 1. Login as Consignee 2. Navigate to order creation Step 2 3. Click "Select Location on Map" 4. Map opens 5. Click on desired location 6. Confirm | Map modal opens with OpenStreetMap. Click places marker. Address auto-populated via reverse geocoding (OSRM). Latitude/longitude captured. Location saved to form. Map shows selected location with marker | Consignee logged in. Step 1 completed | | | | | | | | | | |
| TC_FE_CONS_006 | View order list with pagination | 1. Login as Consignee 2. Navigate to /consignee/orders 3. Observe order list 4. Navigate through pages | Order list displays: Order ID, date, status, total amount. Pagination controls at bottom. Items per page selector (10/25/50). Current page indicator. "Next" and "Previous" buttons work. Total count displayed | Consignee logged in. Multiple orders exist (>10 for pagination) | | | | | | | | | | |
| TC_FE_CONS_007 | Filter orders by status | 1. Login as Consignee 2. Navigate to order list 3. Select status filter "In Delivery" 4. Observe filtered results | List filters to show only "In Delivery" orders. Other statuses hidden. Active filter indicator shown. Count updates. Clear filter option available. Filter persists on page reload | Consignee logged in. Orders with different statuses exist | | | | | | | | | | |
| TC_FE_CONS_008 | View order detail with phases | 1. Login as Consignee 2. Navigate to order list 3. Click on an order 4. Observe order details | Redirected to /consignee/orders/[id]. Order details show: Order info, Products ordered, Delivery phases/timeline (Pending → Processing → In Delivery → Delivered), Current status highlighted, Supplier info, Payment status, Tracking map | Consignee logged in. Order exists | | | | | | | | | | |
| TC_FE_CONS_009 | Initiate VNPay payment | 1. Login as Consignee 2. Create new order (TC_FE_CONS_004) 3. Click "Proceed to Payment" 4. Select VNPay 5. Click "Pay Now" | Redirected to VNPay payment gateway. Payment amount correct. Order ID passed to VNPay. Return URL configured. After payment (in VNPay sandbox), redirected back with payment result. Order status updates to "Paid" if successful | Order created with "Pending Payment" status | | | | | | | | | | |
| TC_FE_CONS_010 | Track delivery in real-time on map | 1. Login as Consignee 2. Navigate to order with "In Delivery" status 3. Click "Track Delivery" 4. Observe map | Map displays with: Delivery route (OSRM), Current delivery location (moving marker if live), Destination marker, Estimated arrival time. Map updates in real-time via Socket.IO. Distance and time remaining shown | Order with "In Delivery" status. Delivery tracking active | | | | | | | | | | |
| TC_FE_CONS_011 | Cancel pending order | 1. Login as Consignee 2. Navigate to order with "Pending" status 3. Click "Cancel Order" button 4. Confirm in modal 5. Observe result | Confirmation modal appears: "Bạn có chắc muốn hủy đơn hàng?" (Are you sure you want to cancel order?). After confirm: Order status changes to "Cancelled". Toast shows "Đơn hàng đã được hủy" (Order cancelled). Cancel button disabled. Refund initiated if paid | Order with "Pending" or "Processing" status (not yet shipped) | | | | | | | | | | |
| TC_FE_CONS_012 | Search orders by order number | 1. Login as Consignee 2. Navigate to order list 3. Enter order number in search 4. Press Enter 5. Observe results | Search returns matching order(s). Exact match prioritized. Partial matches shown. No results message if no match. Search works across all order fields (ID, products, dates) | Consignee logged in. Multiple orders exist | | | | | | | | | | |

---

## 5. Common UI Components Tests

### 5.1 Theme and Language Tests

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_COMP_001 | Toggle theme (light to dark) | 1. Login to any dashboard 2. Click theme toggle button (sun/moon icon) 3. Observe theme change | Theme switches from light to dark mode. All pages update: Background dark, Text light colored, Component styles adapt (cards, buttons, inputs). Theme preference saved (localStorage/cookie). Persists after page reload | User logged in | | | | | | | | | | |
| TC_FE_COMP_002 | Switch language (English to Vietnamese) | 1. Login to any dashboard 2. Click language selector 3. Select "Tiếng Việt" 4. Observe language change | All UI text translates to Vietnamese. Buttons, labels, messages, navigation items update. Language preference saved. Persists after page reload. next-intl handles translations | User logged in | | | | | | | | | | |

### 5.2 Notification Tests

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_COMP_003 | Display toast notification | 1. Perform action that triggers notification (e.g., save profile) 2. Observe toast | Toast notification appears (top-right or bottom). Shows success/error icon. Message displayed correctly. Auto-dismisses after 3-5 seconds. Close button available. Sonner library used | User logged in | | | | | | | | | | |

### 5.3 Loading and Error States Tests

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_COMP_004 | Show loading spinner during data fetch | 1. Login to dashboard 2. Navigate to page with data loading (e.g., order list) 3. Observe loading state (may need to throttle network) | Loading spinner/skeleton displayed while fetching. Prevents interaction during load. Spinner replaces content area. After data loads, spinner disappears, content renders. Form submission shows button loading state | User logged in | | | | | | | | | | |
| TC_FE_COMP_005 | Render 404 page for invalid routes | 1. Navigate to non-existent route (e.g., /invalid-page-12345) 2. Observe 404 page | Custom 404 error page displays. Shows "Page Not Found" message. "Go Home" button redirects to /. Maintains site navigation/layout. URL remains /invalid-page-12345 | None | | | | | | | | | | |

### 5.4 Form Component Tests

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_COMP_006 | Date picker with valid date selection | 1. Login to any form with date field 2. Click date input 3. Calendar opens 4. Select future date 5. Confirm selection | Date picker calendar opens. Current date highlighted. Past dates disabled (if validation set). Selected date populates input. Date format correct (DD/MM/YYYY or configured format). Calendar closes after selection | User logged in | | | | | | | | | | |
| TC_FE_COMP_007 | File uploader drag-and-drop functionality | 1. Navigate to file upload area 2. Drag file from desktop 3. Drop on upload zone 4. Observe upload | Upload zone highlights on drag-over. File accepts on drop. Upload progress shown. File preview/name displayed. Multiple files supported if configured. Invalid file types rejected with message | User logged in. Form with file upload | | | | | | | | | | |

### 5.5 Navigation Tests

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_COMP_008 | Sidebar navigation functionality | 1. Login to dashboard 2. Observe sidebar 3. Click various menu items 4. Test collapse/expand | Sidebar displays navigation items. Current page highlighted. Menu items clickable, navigate correctly. Icons + labels shown. Collapsible sidebar (mobile). Role-based menu items (Supplier vs Consignee) | User logged in | | | | | | | | | | |

---

## 6. Real-time Features Tests

### 6.1 Socket.IO Notification Tests

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_NOTI_001 | Receive real-time order update notification | 1. Login as Consignee 2. Stay on dashboard 3. Order status changes (external action via admin/supplier) 4. Observe notification | Socket.IO notification received. Toast appears with update: "Đơn hàng #123 đã cập nhật trạng thái" (Order #123 status updated). Notification bell icon badge increments. Dashboard data refreshes automatically | Consignee logged in. Socket.IO connected. Order exists | | | | | | | | | | |
| TC_FE_NOTI_002 | Live order delivery tracking updates | 1. Login as Consignee 2. Open order with "In Delivery" status 3. View tracking map 4. Observe live updates | Map marker position updates in real-time. Delivery location changes as driver moves. ETA updates. Distance decreases. Socket.IO receives location updates every 5-10 seconds | Order in delivery. Tracking active. Socket.IO connected | | | | | | | | | | |

### 6.2 IoT Sensor Data Tests

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_NOTI_003 | Display IoT sensor data for harvest batch | 1. Login as Supplier 2. Navigate to harvest batch details 3. View IoT sensor section 4. Observe data | IoT sensor data displays: Temperature, Humidity, Location (if applicable). Data with timestamps. Charts show historical data. Real-time updates if sensors active. Data from IoT devices integrated | Supplier logged in. Harvest batch with IoT data exists | | | | | | | | | | |
| TC_FE_NOTI_004 | IoT sensor alert notification | 1. Login as Supplier 2. IoT sensor detects abnormal reading (e.g., high temperature) 3. Observe alert notification | Alert notification via Socket.IO. Toast shows: "Cảnh báo: Nhiệt độ vượt ngưỡng cho lô #123" (Warning: Temperature exceeds threshold for batch #123). Notification icon highlights. Alert badge on affected batch in list | Supplier logged in. IoT sensors active. Threshold breach configured | | | | | | | | | | |

---

## 7. Responsive Design Tests

### 7.1 Mobile Responsiveness Tests

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_RESP_001 | Test mobile layout (<640px) | 1. Open application on mobile device or resize browser to <640px 2. Navigate through all pages 3. Test interactions | All content stacks vertically. Text readable without horizontal scroll. Buttons and inputs appropriately sized for touch. Hamburger menu for navigation. Forms usable. Tables scroll horizontally or adapt. Tailwind breakpoint sm: applied correctly | None | | | | | | | | | | |

### 7.2 Tablet Responsiveness Tests

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_RESP_002 | Test tablet layout (640-1024px) | 1. Open application on tablet or resize browser to 768px width 2. Navigate through pages 3. Test layout | Sidebar may collapse or remain visible. Content uses available space efficiently. Grid layouts show 2 columns where appropriate. Navigation adapted for touch. Forms utilize width. Tailwind breakpoints md: and lg: applied | None | | | | | | | | | | |

### 7.3 Desktop Responsiveness Tests

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_RESP_003 | Test desktop layout (>1024px) | 1. Open application on desktop (1920x1080 or larger) 2. Navigate through pages 3. Observe layout | Full sidebar visible. Content centered with max-width. Multi-column layouts for lists/grids. All features accessible. Hover states work. No wasted space. Optimal reading width. Tailwind breakpoints xl: and 2xl: applied | None | | | | | | | | | | |

---

## 8. Accessibility Tests

### 8.1 Keyboard Navigation Tests

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_A11Y_001 | Navigate using keyboard only | 1. Open application 2. Use Tab to navigate through elements 3. Use Enter/Space to activate buttons 4. Test all interactive elements | All interactive elements keyboard accessible. Tab order logical. Focus indicators visible. Modals trap focus. Esc closes modals. Skip to content link available. No keyboard traps | None | | | | | | | | | | |

### 8.2 Screen Reader Tests

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_A11Y_002 | Test with screen reader (NVDA/JAWS) | 1. Enable screen reader 2. Navigate through application 3. Test form fields and buttons 4. Verify announcements | ARIA labels present on all interactive elements. Form fields have associated labels. Button purposes announced. Image alt text descriptive. Heading hierarchy logical (h1, h2, h3). Status messages announced. Landmarks used (nav, main, aside) | Screen reader software installed | | | | | | | | | | |

### 8.3 Color Contrast Tests

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_FE_A11Y_003 | Verify color contrast ratios | 1. Open application in both light and dark themes 2. Use browser dev tools or WAVE tool 3. Check contrast ratios 4. Test all text elements | All text meets WCAG AA standards: Normal text 4.5:1, Large text 3:1. Interactive elements distinguishable. Error states clear without color alone. Status indicators use icons + color. Dark mode maintains contrast | None | | | | | | | | | | |

---

## Test Execution Guidelines

### Pre-Test Setup
1. **Environment**: Use staging/test environment, not production
2. **Test Data**: Ensure test users exist for each role (Supplier, Consignee, Admin)
3. **Browser**: Test on Chrome (latest), Firefox (latest), Safari (latest), Edge (latest)
4. **Devices**: Test on mobile (iPhone, Android), tablet (iPad), desktop (1920x1080)
5. **Network**: Test on normal and slow 3G connections

### Test Execution Process
1. Execute tests in order by section
2. Document results in Round 1 columns
3. For failures, document in Note column:
   - Steps to reproduce
   - Actual result vs expected
   - Screenshot/video if applicable
4. Assign to developer for fix
5. Re-test in Round 2 after fixes
6. Round 3 for regression testing

### Pass/Fail Criteria
- **Pass**: Expected result achieved, no errors
- **Fail**: Expected result not achieved, errors present, UI incorrect
- **Blocked**: Cannot test due to dependency (e.g., feature not deployed)
- **N/A**: Not applicable for current test cycle

### Test Data Requirements

#### Supplier Test User
- Email: supplier@test.com
- Password: Test@123
- Role: Supplier
- Status: active
- Has 3+ harvest batches with different statuses

#### Consignee Test User
- Email: consignee@test.com
- Password: Test@123
- Role: Consignee
- Status: active
- Has 5+ orders with different statuses

#### Test Harvest Batches
- Batch 1: Status "Pending", with products, no certificates
- Batch 2: Status "Approved", with products, with certificate
- Batch 3: Status "Rejected", with products
- Batch 4: Status "Completed", with products, with QR code

#### Test Orders
- Order 1: Status "Pending Payment"
- Order 2: Status "Processing"
- Order 3: Status "In Delivery"
- Order 4: Status "Delivered"
- Order 5: Status "Cancelled"

### Known Limitations
- VNPay payment gateway testing requires sandbox credentials
- Real-time tracking requires active delivery simulation
- IoT sensor testing requires test devices or mocked data
- Socket.IO testing may require multiple browser sessions

### Browser Compatibility Matrix

| Browser | Version | OS | Status |
| :--- | :--- | :--- | :--- |
| Chrome | Latest (130+) | Windows/Mac/Linux | Supported |
| Firefox | Latest (120+) | Windows/Mac/Linux | Supported |
| Safari | Latest (17+) | Mac/iOS | Supported |
| Edge | Latest (130+) | Windows | Supported |
| Mobile Safari | iOS 16+ | iOS | Supported |
| Chrome Mobile | Latest | Android | Supported |

---

**Document End**

**Next Review Date:** 2025-03-12  
**Approval:** [Pending]  
**Change Log:**
- 2025-12-12: Initial version 1.0.0 created

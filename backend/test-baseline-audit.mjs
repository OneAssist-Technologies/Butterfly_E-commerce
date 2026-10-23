// Master E2E and Full-Stack Regression Audit Suite
const API_BASE = 'http://localhost:3001/api/v1';
const FRONTEND_BASE = 'http://localhost:3000';

async function runMasterAudit() {
  console.log('================================================================');
  console.log('    FULL-STACK AUTOMATED REGRESSION & COMPREHENSIVE AUDIT       ');
  console.log('================================================================\n');

  const results = [];

  function record(phase, testName, status, details, evidence) {
    results.push({ phase, testName, status, details, evidence });
    const mark = status === 'PASS' ? '✅ PASS' : status === 'FAIL' ? '❌ FAIL' : '⚠️ BLOCKED';
    console.log(`${mark} [${phase}] ${testName}: ${details}`);
  }

  // -------------------------------------------------------------
  // PHASE 1: System Health & Connectivity
  // -------------------------------------------------------------
  try {
    const res = await fetch(`${API_BASE}/health`);
    const data = await res.json();
    record('PHASE 1', 'Backend Health & DB Connection', res.status === 200 ? 'PASS' : 'FAIL', `HTTP ${res.status}`, data);
  } catch (err) {
    record('PHASE 1', 'Backend Health & DB Connection', 'FAIL', err.message, null);
  }

  // -------------------------------------------------------------
  // PHASE 6: Authentication & Authorization
  // -------------------------------------------------------------
  let adminToken = null;
  let customerToken = null;

  // 1. Super Admin Login
  try {
    const res = await fetch(`${API_BASE}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@butterfly.com', password: 'Butterfly@2026' }),
    });
    const data = await res.json();
    if (res.status === 200 && data.token) {
      adminToken = data.token;
      record('PHASE 6', 'Admin Login - Valid Credentials', 'PASS', `Role: ${data.user?.role}`, {
        status: res.status,
        role: data.user?.role,
      });
    } else {
      record('PHASE 6', 'Admin Login - Valid Credentials', 'FAIL', `HTTP ${res.status}`, data);
    }
  } catch (err) {
    record('PHASE 6', 'Admin Login - Valid Credentials', 'FAIL', err.message, null);
  }

  // 2. Admin Login - Incorrect Password
  try {
    const res = await fetch(`${API_BASE}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@butterfly.com', password: 'IncorrectPassword999!' }),
    });
    const data = await res.json();
    record('PHASE 6', 'Admin Login - Wrong Password Rejection', res.status === 401 ? 'PASS' : 'FAIL', `Returned HTTP ${res.status}`, data);
  } catch (err) {
    record('PHASE 6', 'Admin Login - Wrong Password Rejection', 'FAIL', err.message, null);
  }

  // 3. Customer Registration & Duplicate Prevention
  const testCustomerEmail = `test-user-${Date.now()}@example.com`;
  try {
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated Test Customer',
        email: testCustomerEmail,
        password: 'Password@123',
      }),
    });
    const regData = await regRes.json();
    customerToken = regData.token;
    record('PHASE 6', 'Customer Registration', regRes.status === 201 && regData.token ? 'PASS' : 'FAIL', `HTTP ${regRes.status}`, regData);

    // Duplicate check
    const dupRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Customer',
        email: testCustomerEmail,
        password: 'Password@123',
      }),
    });
    record('PHASE 6', 'Duplicate Registration Prevention', dupRes.status === 409 || dupRes.status === 400 ? 'PASS' : 'FAIL', `Returned HTTP ${dupRes.status} on duplicate`, null);
  } catch (err) {
    record('PHASE 6', 'Customer Registration', 'FAIL', err.message, null);
  }

  // 4. Role Authorization: Customer attempting Admin Operations
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    record('PHASE 6', 'Customer Forbidden on Admin Orders Route', res.status === 403 ? 'PASS' : 'FAIL', `Returned HTTP ${res.status}`, null);
  } catch (err) {
    record('PHASE 6', 'Customer Forbidden on Admin Orders Route', 'FAIL', err.message, null);
  }

  // 5. Unauthenticated User Blocked on Protected Routes
  try {
    const res1 = await fetch(`${API_BASE}/orders`);
    const res2 = await fetch(`${API_BASE}/enquiries`);
    const res3 = await fetch(`${API_BASE}/products/test-id`, { method: 'DELETE' });

    const allBlocked = res1.status === 401 && res2.status === 401 && res3.status === 401;
    record('PHASE 6', 'Protected Routes Block Unauthenticated Requests', allBlocked ? 'PASS' : 'FAIL', `orders: ${res1.status}, enquiries: ${res2.status}, delete: ${res3.status}`, {
      ordersStatus: res1.status,
      enquiriesStatus: res2.status,
      deleteStatus: res3.status,
    });
  } catch (err) {
    record('PHASE 6', 'Protected Routes Block Unauthenticated Requests', 'FAIL', err.message, null);
  }

  // -------------------------------------------------------------
  // PHASE 2 & 9: Database Catalog Integrity
  // -------------------------------------------------------------
  try {
    const res = await fetch(`${API_BASE}/products`);
    const data = await res.json();
    const count = Array.isArray(data) ? data.length : 0;
    record('PHASE 2 & 9', 'Full Catalog Upsert Verification', count >= 24 ? 'PASS' : 'FAIL', `PostgreSQL contains ${count} products`, {
      countInDB: count,
      expected: 24,
    });
  } catch (err) {
    record('PHASE 2 & 9', 'Full Catalog Upsert Verification', 'FAIL', err.message, null);
  }

  // -------------------------------------------------------------
  // PHASE 4 & 5: Product Filtering, Sorting, and Search
  // -------------------------------------------------------------
  // 1. Filter by Size (55")
  try {
    const res = await fetch(`${API_BASE}/products?size=55%22`);
    const items = await res.json();
    const valid = Array.isArray(items) && items.length > 0 && items.every((i) => i.size === '55"');
    record('PHASE 5', 'Backend Filter by Size (55")', valid ? 'PASS' : 'FAIL', `Returned ${items.length} 55" items`, { count: items.length });
  } catch (err) {
    record('PHASE 5', 'Backend Filter by Size (55")', 'FAIL', err.message, null);
  }

  // 2. Filter by Resolution (4K UHD)
  try {
    const res = await fetch(`${API_BASE}/products?resolution=4K%20UHD`);
    const items = await res.json();
    const valid = Array.isArray(items) && items.length > 0 && items.every((i) => (i.resolutionCategory || i.resolution || '').includes('4K'));
    record('PHASE 5', 'Backend Filter by Resolution (4K UHD)', valid ? 'PASS' : 'FAIL', `Returned ${items.length} 4K items`, { count: items.length });
  } catch (err) {
    record('PHASE 5', 'Backend Filter by Resolution (4K UHD)', 'FAIL', err.message, null);
  }

  // 3. Search Query
  try {
    const res = await fetch(`${API_BASE}/products?search=QLED`);
    const items = await res.json();
    const valid = Array.isArray(items) && items.length > 0 && items.every((i) => (i.name + i.model + (i.displayTech || '')).toLowerCase().includes('qled'));
    record('PHASE 5', 'Backend Search Query (QLED)', valid ? 'PASS' : 'FAIL', `Returned ${items.length} matching items`, { count: items.length });
  } catch (err) {
    record('PHASE 5', 'Backend Search Query (QLED)', 'FAIL', err.message, null);
  }

  // 4. Sorting by Price Ascending
  try {
    const res = await fetch(`${API_BASE}/products?sort=price-asc`);
    const items = await res.json();
    let isAsc = true;
    for (let i = 0; i < items.length - 1; i++) {
      if (items[i].numericPrice > items[i + 1].numericPrice) {
        isAsc = false;
        break;
      }
    }
    record('PHASE 5', 'Backend Sorting (Price Ascending)', isAsc ? 'PASS' : 'FAIL', `Min: ₹${items[0]?.numericPrice}, Max: ₹${items[items.length - 1]?.numericPrice}`, {
      min: items[0]?.numericPrice,
      max: items[items.length - 1]?.numericPrice,
    });
  } catch (err) {
    record('PHASE 5', 'Backend Sorting (Price Ascending)', 'FAIL', err.message, null);
  }

  // -------------------------------------------------------------
  // PHASE 7: Admin CRUD Operations with Token
  // -------------------------------------------------------------
  let testProductId = null;
  try {
    // Create new test product as Admin
    const newProductPayload = {
      model: `BF-TEST-${Date.now()}`,
      name: '50" Test Smart TV Edition',
      size: '50"',
      resolution: '4K UHD Resolution',
      resolutionCategory: '4K UHD',
      os: 'Android 11',
      sound: '20W Dolby Audio',
      price: '₹ 29,990',
      numericPrice: 29990,
      image: '/tv_lake.jpg',
    };
    const createRes = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(newProductPayload),
    });
    const createdProduct = await createRes.json();
    testProductId = createdProduct.id;
    record('PHASE 7', 'Admin Product Creation', createRes.status === 201 && testProductId ? 'PASS' : 'FAIL', `Created product ${createdProduct.model} (ID: ${testProductId})`, createdProduct);

    // Toggle stock as Admin
    const stockRes = await fetch(`${API_BASE}/products/${testProductId}/toggle-stock`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const updatedStock = await stockRes.json();
    record('PHASE 7', 'Admin Product Stock Toggle', stockRes.status === 200 && updatedStock.inStock === false ? 'PASS' : 'FAIL', `inStock toggled to ${updatedStock.inStock}`, updatedStock);

    // Delete product as Admin
    const delRes = await fetch(`${API_BASE}/products/${testProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record('PHASE 7', 'Admin Product Deletion', delRes.status === 200 ? 'PASS' : 'FAIL', `HTTP ${delRes.status}`, null);
  } catch (err) {
    record('PHASE 7', 'Admin Product Operations', 'FAIL', err.message, null);
  }

  // -------------------------------------------------------------
  // PHASE 8 & 9: Customer Journey, Order & Enquiry Persistence
  // -------------------------------------------------------------
  // Order placement & foreign key relation
  let createdOrderId = null;
  try {
    const orderPayload = {
      customerName: 'Regression Test Buyer',
      email: 'buyer-regression@example.com',
      amount: '₹ 24,990',
      payment: 'Prepaid (UPI)',
      items: [
        {
          model: 'BF43S1',
          name: '43" Full HD Smart TV',
          price: '₹ 24,990',
          quantity: 2,
        },
      ],
    };
    const orderRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });
    const orderData = await orderRes.json();
    createdOrderId = orderData.id;

    // Verify server-side calculation: 2 * 24990 = 49980
    const correctCalculation = orderData.numericAmount === 49980;
    const itemHasProductId = orderData.items?.[0]?.productId != null;

    record(
      'PHASE 8 & 9',
      'Order Placement & Trusted Server-Side Calculation',
      orderRes.status === 201 && correctCalculation && itemHasProductId ? 'PASS' : 'FAIL',
      `Order ${orderData.orderNumber}: total calculated ₹${orderData.numericAmount}, linked productId: ${orderData.items?.[0]?.productId}`,
      {
        orderNumber: orderData.orderNumber,
        numericAmount: orderData.numericAmount,
        items: orderData.items,
      }
    );

    // Admin updates order status
    const updateRes = await fetch(`${API_BASE}/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'Dispatched' }),
    });
    const updatedOrder = await updateRes.json();
    record('PHASE 7 & 9', 'Admin Order Status Update', updateRes.status === 200 && updatedOrder.status === 'Dispatched' ? 'PASS' : 'FAIL', `Status updated to ${updatedOrder.status}`, updatedOrder);

    // Clean up test order
    if (createdOrderId) {
      await fetch(`${API_BASE}/orders/${createdOrderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    }
  } catch (err) {
    record('PHASE 8 & 9', 'Order Placement & Processing', 'FAIL', err.message, null);
  }

  // Enquiry placement & status update
  let createdEnquiryId = null;
  try {
    const enquiryPayload = {
      name: 'Regression Enquiry User',
      phone: '+91 9876543210',
      email: 'enquiry-test@butterfly.com',
      city: 'Chennai',
      productModel: 'BF65Q1',
      message: 'Automated full-stack verification test enquiry',
    };
    const enqRes = await fetch(`${API_BASE}/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiryPayload),
    });
    const enqData = await enqRes.json();
    createdEnquiryId = enqData.id;

    record('PHASE 8 & 9', 'Enquiry Submission & Persistence', enqRes.status === 201 && enqData.enquiryNumber ? 'PASS' : 'FAIL', `Enquiry ${enqData.enquiryNumber} recorded`, enqData);

    // Admin updates enquiry status
    const statusRes = await fetch(`${API_BASE}/enquiries/${createdEnquiryId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'Contacted' }),
    });
    const updatedEnq = await statusRes.json();
    record('PHASE 7 & 9', 'Admin Enquiry Status Update', statusRes.status === 200 && updatedEnq.status === 'Contacted' ? 'PASS' : 'FAIL', `Status updated to ${updatedEnq.status}`, updatedEnq);

    // Clean up test enquiry
    if (createdEnquiryId) {
      await fetch(`${API_BASE}/enquiries/${createdEnquiryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    }
  } catch (err) {
    record('PHASE 8 & 9', 'Enquiry Submission & Processing', 'FAIL', err.message, null);
  }

  // Clean up test customer account
  try {
    const usersRes = await fetch(`${API_BASE}/auth/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const users = await usersRes.json();
    const createdUser = users.find((u) => u.email === testCustomerEmail);
    if (createdUser) {
      await fetch(`${API_BASE}/auth/users/${createdUser.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    }
  } catch {
    // cleanup ignore
  }

  // -------------------------------------------------------------
  // PHASE 10: Frontend Route Accessibility & Filter Navigation
  // -------------------------------------------------------------
  const frontendRoutes = [
    { path: '/', name: 'Home Landing' },
    { path: '/products', name: 'Product Catalog' },
    { path: '/products?size=55%22', name: 'Filtered Catalog by Size' },
    { path: '/products?resolution=4K%20UHD', name: 'Filtered Catalog by Resolution' },
    { path: '/products/bf43s1', name: 'Product Detail Page (BF43S1)' },
    { path: '/cart', name: 'Shopping Cart' },
    { path: '/about', name: 'About Us' },
    { path: '/support', name: 'Customer Support' },
    { path: '/contact', name: 'Contact Us' },
    { path: '/login', name: 'Member Sign-In' },
    { path: '/signup', name: 'Member Registration' },
    { path: '/admin', name: 'Admin Dashboard' },
  ];

  for (const r of frontendRoutes) {
    try {
      const res = await fetch(`${FRONTEND_BASE}${r.path}`);
      record('PHASE 10', `Route: ${r.name} (${r.path})`, res.status === 200 ? 'PASS' : 'FAIL', `HTTP ${res.status}`, null);
    } catch (err) {
      record('PHASE 10', `Route: ${r.name} (${r.path})`, 'FAIL', err.message, null);
    }
  }

  console.log('\n================================================================');
  console.log('              AUTOMATED REGRESSION AUDIT SUMMARY                ');
  console.log('================================================================');
  const passes = results.filter((r) => r.status === 'PASS').length;
  const fails = results.filter((r) => r.status === 'FAIL').length;
  console.log(`TOTAL AUDIT POINTS TESTED: ${results.length}`);
  console.log(`✅ PASS: ${passes}`);
  console.log(`❌ FAIL: ${fails}`);
  console.log('================================================================\n');

  return { total: results.length, passes, fails, results };
}

runMasterAudit().catch(console.error);

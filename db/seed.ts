import { getDb } from "../api/queries/connection";
import { products, categories, orders, activities } from "./schema";
import { sql } from "drizzle-orm";

const db = getDb();

async function seed() {
  console.log("Clearing existing data...");

  // Clear tables in correct order (respecting FK constraints)
  await db.delete(orders);
  await db.delete(products);
  await db.delete(activities);
  await db.delete(categories);

  console.log("Seeding database...");

  // Seed categories
  const categoryData = [
    { name: "Electronics", description: "Electronic devices and components", color: "#2563eb" },
    { name: "Office Supplies", description: "Daily office essentials", color: "#8b5cf6" },
    { name: "Furniture", description: "Office and warehouse furniture", color: "#059669" },
    { name: "Industrial", description: "Industrial machinery and tools", color: "#d97706" },
    { name: "Packaging", description: "Boxes, wraps, and packaging materials", color: "#dc2626" },
    { name: "Raw Materials", description: "Raw production materials", color: "#7c3aed" },
    { name: "Safety Equipment", description: "Safety gear and protective equipment", color: "#0891b2" },
    { name: "Tools", description: "Hand and power tools", color: "#be185d" },
  ];

  await db.insert(categories).values(categoryData);
  console.log(`Inserted ${categoryData.length} categories`);

  // Get category IDs
  const cats = await db.select().from(categories);
  const catMap = new Map(cats.map((c) => [c.name, c.id]));

  // Seed products
  const productData = [
    { name: "Wireless Keyboard", sku: "ELEC-001", description: "Bluetooth mechanical keyboard", categoryId: catMap.get("Electronics"), quantity: 45, threshold: 15, unitPrice: "79.99", location: "A-12" },
    { name: "24\" Monitor", sku: "ELEC-002", description: "Full HD IPS display", categoryId: catMap.get("Electronics"), quantity: 8, threshold: 10, unitPrice: "249.99", location: "A-14" },
    { name: "USB-C Hub", sku: "ELEC-003", description: "7-in-1 USB-C adapter", categoryId: catMap.get("Electronics"), quantity: 120, threshold: 20, unitPrice: "34.99", location: "A-15" },
    { name: "Wireless Mouse", sku: "ELEC-004", description: "Ergonomic wireless mouse", categoryId: catMap.get("Electronics"), quantity: 3, threshold: 10, unitPrice: "29.99", location: "A-12" },
    { name: "Laptop Stand", sku: "ELEC-005", description: "Adjustable aluminum stand", categoryId: catMap.get("Electronics"), quantity: 0, threshold: 5, unitPrice: "49.99", location: "B-03" },
    { name: "Webcam 1080p", sku: "ELEC-006", description: "HD webcam with microphone", categoryId: catMap.get("Electronics"), quantity: 22, threshold: 10, unitPrice: "59.99", location: "A-16" },
    { name: "A4 Paper Ream", sku: "OFFC-001", description: "Premium 500 sheet ream", categoryId: catMap.get("Office Supplies"), quantity: 200, threshold: 50, unitPrice: "5.99", location: "C-01" },
    { name: "Ballpoint Pens (Box)", sku: "OFFC-002", description: "Pack of 50 blue pens", categoryId: catMap.get("Office Supplies"), quantity: 75, threshold: 20, unitPrice: "12.99", location: "C-02" },
    { name: "Stapler Heavy Duty", sku: "OFFC-003", description: "Industrial stapler", categoryId: catMap.get("Office Supplies"), quantity: 4, threshold: 10, unitPrice: "18.99", location: "C-03" },
    { name: "Sticky Notes", sku: "OFFC-004", description: "3x3 inch assorted colors", categoryId: catMap.get("Office Supplies"), quantity: 150, threshold: 30, unitPrice: "3.99", location: "C-04" },
    { name: "File Folders (Box)", sku: "OFFC-005", description: "Manila folders pack of 100", categoryId: catMap.get("Office Supplies"), quantity: 0, threshold: 15, unitPrice: "9.99", location: "C-05" },
    { name: "Desk Chair", sku: "FURN-001", description: "Ergonomic mesh office chair", categoryId: catMap.get("Furniture"), quantity: 12, threshold: 5, unitPrice: "299.99", location: "D-01" },
    { name: "Standing Desk", sku: "FURN-002", description: "Electric height adjustable", categoryId: catMap.get("Furniture"), quantity: 6, threshold: 5, unitPrice: "549.99", location: "D-02" },
    { name: "Bookshelf", sku: "FURN-003", description: "5-tier metal bookshelf", categoryId: catMap.get("Furniture"), quantity: 8, threshold: 5, unitPrice: "89.99", location: "D-03" },
    { name: "Filing Cabinet", sku: "FURN-004", description: "4-drawer locking cabinet", categoryId: catMap.get("Furniture"), quantity: 2, threshold: 3, unitPrice: "179.99", location: "D-04" },
    { name: "Pallet Jack", sku: "INDS-001", description: "5500 lbs capacity", categoryId: catMap.get("Industrial"), quantity: 5, threshold: 2, unitPrice: "449.99", location: "E-01" },
    { name: "Shelf Unit", sku: "INDS-002", description: "Industrial steel shelving", categoryId: catMap.get("Industrial"), quantity: 15, threshold: 5, unitPrice: "129.99", location: "E-02" },
    { name: "Work Bench", sku: "INDS-003", description: "Steel top work bench", categoryId: catMap.get("Industrial"), quantity: 3, threshold: 2, unitPrice: "349.99", location: "E-03" },
    { name: "Cardboard Boxes (Large)", sku: "PACK-001", description: "20x20x20 inch, pack of 25", categoryId: catMap.get("Packaging"), quantity: 80, threshold: 30, unitPrice: "24.99", location: "F-01" },
    { name: "Bubble Wrap Roll", sku: "PACK-002", description: "3/16\" 175 ft roll", categoryId: catMap.get("Packaging"), quantity: 40, threshold: 15, unitPrice: "19.99", location: "F-02" },
    { name: "Packing Tape", sku: "PACK-003", description: "Heavy duty 2 inch, pack of 6", categoryId: catMap.get("Packaging"), quantity: 60, threshold: 20, unitPrice: "14.99", location: "F-03" },
    { name: "Shipping Labels", sku: "PACK-004", description: "4x6 thermal labels, roll of 500", categoryId: catMap.get("Packaging"), quantity: 7, threshold: 10, unitPrice: "16.99", location: "F-04" },
    { name: "Steel Sheet 4x8", sku: "RAW-001", description: "16 gauge steel sheet", categoryId: catMap.get("Raw Materials"), quantity: 25, threshold: 10, unitPrice: "89.99", location: "G-01" },
    { name: "Aluminum Rod 1\"", sku: "RAW-002", description: "6061-T6 aluminum, 12ft", categoryId: catMap.get("Raw Materials"), quantity: 18, threshold: 8, unitPrice: "45.99", location: "G-02" },
    { name: "Safety Glasses", sku: "SAFE-001", description: "Anti-fog safety glasses", categoryId: catMap.get("Safety Equipment"), quantity: 100, threshold: 25, unitPrice: "8.99", location: "H-01" },
    { name: "Hard Hat", sku: "SAFE-002", description: "ANSI certified hard hat", categoryId: catMap.get("Safety Equipment"), quantity: 30, threshold: 10, unitPrice: "14.99", location: "H-02" },
    { name: "Work Gloves", sku: "SAFE-003", description: "Leather work gloves, pair", categoryId: catMap.get("Safety Equipment"), quantity: 55, threshold: 20, unitPrice: "12.99", location: "H-03" },
    { name: "Cordless Drill", sku: "TOOL-001", description: "20V brushless drill/driver", categoryId: catMap.get("Tools"), quantity: 10, threshold: 5, unitPrice: "129.99", location: "I-01" },
    { name: "Tape Measure", sku: "TOOL-002", description: "25ft magnetic tape measure", categoryId: catMap.get("Tools"), quantity: 35, threshold: 10, unitPrice: "16.99", location: "I-02" },
    { name: "Socket Set", sku: "TOOL-003", description: "108-piece chrome socket set", categoryId: catMap.get("Tools"), quantity: 8, threshold: 5, unitPrice: "79.99", location: "I-03" },
    { name: "Cable Ties (Pack)", sku: "ELEC-007", description: " assorted sizes, pack of 500", categoryId: catMap.get("Electronics"), quantity: 0, threshold: 20, unitPrice: "7.99", location: "A-17" },
    { name: "HDMI Cable 6ft", sku: "ELEC-008", description: "High speed HDMI 2.1", categoryId: catMap.get("Electronics"), quantity: 60, threshold: 15, unitPrice: "11.99", location: "A-18" },
    { name: "Notebook (Pack)", sku: "OFFC-006", description: "Spiral notebooks, pack of 12", categoryId: catMap.get("Office Supplies"), quantity: 40, threshold: 15, unitPrice: "15.99", location: "C-06" },
    { name: "Printer Paper", sku: "OFFC-007", description: "Premium 2500 sheet case", categoryId: catMap.get("Office Supplies"), quantity: 12, threshold: 10, unitPrice: "29.99", location: "C-07" },
    { name: "Conference Table", sku: "FURN-005", description: "10-person meeting table", categoryId: catMap.get("Furniture"), quantity: 2, threshold: 2, unitPrice: "899.99", location: "D-05" },
    { name: "Storage Bin", sku: "INDS-004", description: "Heavy duty plastic bin", categoryId: catMap.get("Industrial"), quantity: 45, threshold: 15, unitPrice: "22.99", location: "E-04" },
    { name: "Stretch Wrap", sku: "PACK-005", description: "18 inch 1500ft roll", categoryId: catMap.get("Packaging"), quantity: 20, threshold: 10, unitPrice: "27.99", location: "F-05" },
    { name: "Copper Wire 12ga", sku: "RAW-003", description: "THHN copper wire, 500ft", categoryId: catMap.get("Raw Materials"), quantity: 5, threshold: 8, unitPrice: "119.99", location: "G-03" },
    { name: "Dust Masks (Box)", sku: "SAFE-004", description: "N95 masks, box of 20", categoryId: catMap.get("Safety Equipment"), quantity: 0, threshold: 15, unitPrice: "24.99", location: "H-04" },
    { name: "Circular Saw", sku: "TOOL-004", description: "7-1/4 inch circular saw", categoryId: catMap.get("Tools"), quantity: 6, threshold: 3, unitPrice: "89.99", location: "I-04" },
    { name: "Rubber Gloves (Box)", sku: "SAFE-005", description: "Nitrile gloves, box of 100", categoryId: catMap.get("Safety Equipment"), quantity: 90, threshold: 20, unitPrice: "18.99", location: "H-05" },
    { name: "LED Work Light", sku: "TOOL-005", description: "Portable 5000 lumen", categoryId: catMap.get("Tools"), quantity: 14, threshold: 5, unitPrice: "54.99", location: "I-05" },
    { name: "Whiteboard 48x36", sku: "FURN-006", description: "Magnetic dry erase board", categoryId: catMap.get("Furniture"), quantity: 9, threshold: 5, unitPrice: "69.99", location: "D-06" },
    { name: "Label Printer", sku: "ELEC-009", description: "Thermal label printer", categoryId: catMap.get("Electronics"), quantity: 7, threshold: 5, unitPrice: "149.99", location: "A-19" },
    { name: "Paper Shredder", sku: "OFFC-008", description: "Cross-cut shredder", categoryId: catMap.get("Office Supplies"), quantity: 11, threshold: 5, unitPrice: "59.99", location: "C-08" },
    { name: "Pneumatic Nailer", sku: "TOOL-006", description: "Brad nailer 18 gauge", categoryId: catMap.get("Tools"), quantity: 4, threshold: 3, unitPrice: "119.99", location: "I-06" },
    { name: "Welding Helmet", sku: "SAFE-006", description: "Auto-darkening helmet", categoryId: catMap.get("Safety Equipment"), quantity: 8, threshold: 5, unitPrice: "79.99", location: "H-06" },
    { name: "Plywood Sheet", sku: "RAW-004", description: "3/4\" birch plywood 4x8", categoryId: catMap.get("Raw Materials"), quantity: 30, threshold: 10, unitPrice: "54.99", location: "G-04" },
    { name: "Shrink Wrap", sku: "PACK-006", description: "PVC shrink film roll", categoryId: catMap.get("Packaging"), quantity: 0, threshold: 8, unitPrice: "32.99", location: "F-06" },
    { name: "Floor Scale", sku: "INDS-005", description: "5000 lb digital floor scale", categoryId: catMap.get("Industrial"), quantity: 2, threshold: 2, unitPrice: "699.99", location: "E-05" },
    { name: "Router Tool", sku: "TOOL-007", description: "Variable speed plunge router", categoryId: catMap.get("Tools"), quantity: 5, threshold: 3, unitPrice: "159.99", location: "I-07" },
    { name: "Power Strip", sku: "ELEC-010", description: "12-outlet surge protector", categoryId: catMap.get("Electronics"), quantity: 28, threshold: 10, unitPrice: "24.99", location: "A-20" },
    { name: "Desk Lamp", sku: "FURN-007", description: "LED adjustable desk lamp", categoryId: catMap.get("Furniture"), quantity: 16, threshold: 8, unitPrice: "34.99", location: "D-07" },
  ];

  for (const product of productData) {
    let status: "in_stock" | "low_stock" | "out_of_stock" = "in_stock";
    if (product.quantity === 0) status = "out_of_stock";
    else if (product.quantity <= product.threshold) status = "low_stock";

    await db.insert(products).values({
      ...product,
      status,
    });
  }
  console.log(`Inserted ${productData.length} products`);

  // Get product IDs for orders
  const prods = await db.select().from(products);
  const prodMap = new Map(prods.map((p) => [p.sku, p.id]));

  // Seed orders
  const orderData = [
    { orderNumber: "ORD-2026001", type: "incoming" as const, status: "pending" as const, productId: prodMap.get("ELEC-002") ?? 1, quantity: 20, totalPrice: "4999.80", supplier: "TechCorp Inc." },
    { orderNumber: "ORD-2026002", type: "incoming" as const, status: "pending" as const, productId: prodMap.get("ELEC-004") ?? 1, quantity: 50, totalPrice: "1499.50", supplier: "Global Electronics" },
    { orderNumber: "ORD-2026003", type: "outgoing" as const, status: "pending" as const, productId: prodMap.get("ELEC-001") ?? 1, quantity: 15, totalPrice: "1199.85", supplier: "Acme Solutions" },
    { orderNumber: "ORD-2026004", type: "incoming" as const, status: "approved" as const, productId: prodMap.get("FURN-001") ?? 1, quantity: 10, totalPrice: "2999.90", supplier: "Comfort Seating Co." },
    { orderNumber: "ORD-2026005", type: "outgoing" as const, status: "approved" as const, productId: prodMap.get("OFFC-001") ?? 1, quantity: 100, totalPrice: "599.00", supplier: "PaperMills Ltd." },
    { orderNumber: "ORD-2026006", type: "incoming" as const, status: "denied" as const, productId: prodMap.get("TOOL-003") ?? 1, quantity: 25, totalPrice: "449.75", supplier: "Tools Unlimited" },
    { orderNumber: "ORD-2026007", type: "incoming" as const, status: "pending" as const, productId: prodMap.get("ELEC-005") ?? 1, quantity: 30, totalPrice: "1499.70", supplier: "OfficeGear Pro" },
    { orderNumber: "ORD-2026008", type: "outgoing" as const, status: "pending" as const, productId: prodMap.get("INDS-001") ?? 1, quantity: 3, totalPrice: "1349.97", supplier: "Warehouse Systems" },
    { orderNumber: "ORD-2026009", type: "incoming" as const, status: "completed" as const, productId: prodMap.get("SAFE-001") ?? 1, quantity: 60, totalPrice: "899.40", supplier: "SafetyFirst Corp" },
    { orderNumber: "ORD-2026010", type: "incoming" as const, status: "pending" as const, productId: prodMap.get("OFFC-005") ?? 1, quantity: 40, totalPrice: "399.60", supplier: "Office Supplies Direct" },
    { orderNumber: "ORD-2026011", type: "outgoing" as const, status: "approved" as const, productId: prodMap.get("PACK-001") ?? 1, quantity: 50, totalPrice: "1249.50", supplier: "ShipRight Logistics" },
    { orderNumber: "ORD-2026012", type: "incoming" as const, status: "pending" as const, productId: prodMap.get("RAW-001") ?? 1, quantity: 15, totalPrice: "1349.85", supplier: "SteelWorks Inc." },
    { orderNumber: "ORD-2026013", type: "outgoing" as const, status: "denied" as const, productId: prodMap.get("TOOL-001") ?? 1, quantity: 20, totalPrice: "339.80", supplier: "BuildIt Construction" },
    { orderNumber: "ORD-2026014", type: "incoming" as const, status: "completed" as const, productId: prodMap.get("RAW-004") ?? 1, quantity: 20, totalPrice: "1099.80", supplier: "Material Source Co." },
    { orderNumber: "ORD-2026015", type: "incoming" as const, status: "pending" as const, productId: prodMap.get("SAFE-005") ?? 1, quantity: 50, totalPrice: "899.50", supplier: "GloveMakers Ltd." },
    { orderNumber: "ORD-2026016", type: "outgoing" as const, status: "pending" as const, productId: prodMap.get("FURN-005") ?? 1, quantity: 8, totalPrice: "1199.92", supplier: "Furniture Depot" },
    { orderNumber: "ORD-2026017", type: "incoming" as const, status: "approved" as const, productId: prodMap.get("RAW-004") ?? 1, quantity: 15, totalPrice: "824.85", supplier: "WoodCraft Supplies" },
    { orderNumber: "ORD-2026018", type: "outgoing" as const, status: "pending" as const, productId: prodMap.get("TOOL-003") ?? 1, quantity: 25, totalPrice: "449.75", supplier: "Tool Rental Plus" },
    { orderNumber: "ORD-2026019", type: "incoming" as const, status: "completed" as const, productId: prodMap.get("OFFC-002") ?? 1, quantity: 100, totalPrice: "1299.00", supplier: "Pen World Inc." },
    { orderNumber: "ORD-2026020", type: "incoming" as const, status: "pending" as const, productId: prodMap.get("FURN-004") ?? 1, quantity: 5, totalPrice: "449.95", supplier: "Storage Solutions" },
  ];

  await db.insert(orders).values(orderData);
  console.log(`Inserted ${orderData.length} orders`);

  // Seed activities
  const activityData = [
    { type: "product_created", description: "Added Wireless Keyboard to inventory" },
    { type: "stock_alert", description: "Low stock alert: Wireless Mouse (3 remaining)" },
    { type: "order_approved", description: "Approved order ORD-2026004 from Comfort Seating Co." },
    { type: "product_updated", description: "Updated stock for A4 Paper Ream: 200 units" },
    { type: "order_created", description: "Created incoming order ORD-2026001 from TechCorp Inc." },
    { type: "stock_alert", description: "Out of stock: Laptop Stand" },
    { type: "order_denied", description: "Denied order ORD-2026006 from Tools Unlimited" },
    { type: "product_created", description: "Added Safety Glasses to inventory" },
    { type: "order_completed", description: "Completed order ORD-2026009 from SafetyFirst Corp" },
    { type: "stock_alert", description: "Low stock alert: Filing Cabinet (2 remaining)" },
    { type: "product_updated", description: "Updated price for Standing Desk: $549.99" },
    { type: "order_approved", description: "Approved order ORD-2026005 from PaperMills Ltd." },
    { type: "stock_alert", description: "Low stock alert: Shipping Labels (7 remaining)" },
    { type: "product_created", description: "Added LED Work Light to inventory" },
    { type: "order_completed", description: "Completed order ORD-2026014 from Material Source Co." },
  ];

  await db.insert(activities).values(activityData);
  console.log(`Inserted ${activityData.length} activities`);

  console.log("Seeding complete!");
}

seed().catch(console.error);

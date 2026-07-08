import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

config();

const globalForPrisma = globalThis as unknown as {
    prisma: ReturnType<typeof createPrismaClient>;
};

function createPrismaClient() {
    return new PrismaClient({
        accelerateUrl: process.env.DATABASE_URL!,
    }).$extends(withAccelerate());
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ── Seed data ──────────────────────────────────────────

const CATEGORIES = [
    { name: "Wedding", slug: "wedding", description: "Elegant bouquets for your special day — classic white, blush, and mixed arrangements to complement any wedding theme." },
    { name: "Birthday", slug: "birthday", description: "Bright and cheerful bouquets to celebrate another trip around the sun." },
    { name: "Anniversary", slug: "anniversary", description: "Romantic arrangements to mark your milestone moments together." },
    { name: "Sympathy", slug: "sympathy", description: "Gentle, respectful arrangements to express condolences and offer comfort." },
    { name: "Graduation", slug: "graduation", description: "Celebrate academic achievements with vibrant, congratulatory bouquets." },
    { name: "Get Well", slug: "get-well", description: "Warm and uplifting arrangements to brighten someone's recovery." },
    { name: "Romance", slug: "romance", description: "Whimsical and intimate bouquets for dates, proposals, and quiet declarations." },
    { name: "Just Because", slug: "just-because", description: "Surprise someone special with a thoughtful arrangement for no reason at all." },
];

const PRODUCTS_DATA: {
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    categorySlug: string;
    occasionTags: string[];
    images: { alt: string; order: number }[];
    variants: { name: string; price: number; sku: string }[];
    addOns: { name: string; price: number }[];
}[] = [
        {
            name: "Ivory Dream",
            slug: "ivory-dream",
            description: "A timeless hand-tied bouquet of ivory crochet roses, eucalyptus stems, and delicate baby's breath. Perfect for brides or anyone who loves understated elegance.",
            basePrice: 1200,
            categorySlug: "wedding",
            occasionTags: ["wedding", "romance"],
            images: [
                { alt: "Ivory Dream bouquet front view", order: 0 },
                { alt: "Ivory Dream bouquet detail", order: 1 },
            ],
            variants: [
                { name: "Small", price: 0, sku: "IVR-DRM-S" },
                { name: "Medium", price: 200, sku: "IVR-DRM-M" },
                { name: "Large", price: 450, sku: "IVR-DRM-L" },
            ],
            addOns: [
                { name: "Message Card +₱50", price: 50 },
                { name: "Gift Wrap +₱80", price: 80 },
            ],
        },
        {
            name: "Blush Garden",
            slug: "blush-garden",
            description: "A soft cascade of blush-pink tulips, peonies, and lavender sprigs — all handcrafted in premium yarn. A romantic favorite.",
            basePrice: 950,
            categorySlug: "romance",
            occasionTags: ["romance", "anniversary", "just-because"],
            images: [
                { alt: "Blush Garden bouquet front view", order: 0 },
                { alt: "Blush Garden bouquet side view", order: 1 },
            ],
            variants: [
                { name: "Small", price: 0, sku: "BLSH-GDN-S" },
                { name: "Medium", price: 150, sku: "BLSH-GDN-M" },
                { name: "Large", price: 350, sku: "BLSH-GDN-L" },
            ],
            addOns: [
                { name: "Message Card +₱50", price: 50 },
            ],
        },
        {
            name: "Sunshine Posy",
            slug: "sunshine-posy",
            description: "Cheerful yellow sunflowers and white daisies in a hand-tied bundle. Guaranteed to bring a smile.",
            basePrice: 700,
            categorySlug: "get-well",
            occasionTags: ["get-well", "birthday", "just-because"],
            images: [
                { alt: "Sunshine Posy bouquet front view", order: 0 },
                { alt: "Sunshine Posy bouquet top view", order: 1 },
            ],
            variants: [
                { name: "Small", price: 0, sku: "SUN-POSY-S" },
                { name: "Medium", price: 120, sku: "SUN-POSY-M" },
            ],
            addOns: [
                { name: "Gift Wrap +₱80", price: 80 },
            ],
        },
        {
            name: "Lavender Fields",
            slug: "lavender-fields",
            description: "A calming arrangement of lavender crochet stems, sage leaves, and cream accents. Ideal for sympathy or quiet moments.",
            basePrice: 850,
            categorySlug: "sympathy",
            occasionTags: ["sympathy", "just-because"],
            images: [
                { alt: "Lavender Fields bouquet front view", order: 0 },
                { alt: "Lavender Fields bouquet detail", order: 1 },
                { alt: "Lavender Fields bouquet arranged on table", order: 2 },
            ],
            variants: [
                { name: "Small", price: 0, sku: "LAV-FLD-S" },
                { name: "Medium", price: 160, sku: "LAV-FLD-M" },
            ],
            addOns: [
                { name: "Message Card +₱50", price: 50 },
                { name: "Ribbon Upgrade +₱60", price: 60 },
            ],
        },
        {
            name: "Crimson Heart",
            slug: "crimson-heart",
            description: "Deep red roses with burgundy accents and dark greenery. A bold statement of passion and devotion.",
            basePrice: 1100,
            categorySlug: "romance",
            occasionTags: ["romance", "anniversary", "valentines"],
            images: [
                { alt: "Crimson Heart bouquet front view", order: 0 },
                { alt: "Crimson Heart bouquet close-up", order: 1 },
            ],
            variants: [
                { name: "Small", price: 0, sku: "CRM-HRT-S" },
                { name: "Medium", price: 180, sku: "CRM-HRT-M" },
                { name: "Large", price: 400, sku: "CRM-HRT-L" },
            ],
            addOns: [
                { name: "Message Card +₱50", price: 50 },
                { name: "Gift Wrap +₱80", price: 80 },
                { name: "Vase Upgrade +₱150", price: 150 },
            ],
        },
        {
            name: "Coral Sunset",
            slug: "coral-sunset",
            description: "Vibrant coral and peach blooms with gold-thread accents. A modern favorite for celebratory occasions.",
            basePrice: 900,
            categorySlug: "graduation",
            occasionTags: ["graduation", "birthday", "just-because"],
            images: [
                { alt: "Coral Sunset bouquet front view", order: 0 },
                { alt: "Coral Sunset bouquet angled view", order: 1 },
            ],
            variants: [
                { name: "Small", price: 0, sku: "CRL-SUN-S" },
                { name: "Medium", price: 140, sku: "CRL-SUN-M" },
            ],
            addOns: [
                { name: "Message Card +₱50", price: 50 },
                { name: "Gift Wrap +₱80", price: 80 },
            ],
        },
        {
            name: "Snowdrop Serenity",
            slug: "snowdrop-serenity",
            description: "Pure white crochet snowdrops and silver foliage in a minimalist hand-tied bunch. Clean, elegant, and serene.",
            basePrice: 780,
            categorySlug: "sympathy",
            occasionTags: ["sympathy", "wedding"],
            images: [
                { alt: "Snowdrop Serenity bouquet front view", order: 0 },
                { alt: "Snowdrop Serenity bouquet detail", order: 1 },
            ],
            variants: [
                { name: "Small", price: 0, sku: "SNW-SER-S" },
                { name: "Medium", price: 130, sku: "SNW-SER-M" },
            ],
            addOns: [
                { name: "Message Card +₱50", price: 50 },
            ],
        },
        {
            name: "Birthday Burst",
            slug: "birthday-burst",
            description: "A colorful explosion of multi-colored crochet blooms — tulips, roses, and daisies — tied with a cheerful ribbon.",
            basePrice: 820,
            categorySlug: "birthday",
            occasionTags: ["birthday", "just-because"],
            images: [
                { alt: "Birthday Burst bouquet front view", order: 0 },
                { alt: "Birthday Burst bouquet top view", order: 1 },
                { alt: "Birthday Burst bouquet with ribbon", order: 2 },
            ],
            variants: [
                { name: "Small", price: 0, sku: "BRT-BST-S" },
                { name: "Medium", price: 150, sku: "BRT-BST-M" },
            ],
            addOns: [
                { name: "Message Card +₱50", price: 50 },
                { name: "Gift Wrap +₱80", price: 80 },
            ],
        },
        {
            name: "Golden Hour",
            slug: "golden-hour",
            description: "Warm golden and amber blooms with dried-look accents. Inspired by the glow of sunset.",
            basePrice: 930,
            categorySlug: "anniversary",
            occasionTags: ["anniversary", "romance"],
            images: [
                { alt: "Golden Hour bouquet front view", order: 0 },
                { alt: "Golden Hour bouquet side view", order: 1 },
            ],
            variants: [
                { name: "Small", price: 0, sku: "GLD-HR-S" },
                { name: "Medium", price: 170, sku: "GLD-HR-M" },
            ],
            addOns: [
                { name: "Message Card +₱50", price: 50 },
                { name: "Vase Upgrade +₱150", price: 150 },
            ],
        },
        {
            name: "Tiny Dancer",
            slug: "tiny-dancer",
            description: "A petite posy of mixed pastel mini blooms. Sweet, dainty, and perfect for a bedside or desk.",
            basePrice: 550,
            categorySlug: "just-because",
            occasionTags: ["just-because", "get-well"],
            images: [
                { alt: "Tiny Dancer bouquet front view", order: 0 },
            ],
            variants: [
                { name: "Small", price: 0, sku: "TNY-DNC-S" },
            ],
            addOns: [
                { name: "Message Card +₱50", price: 50 },
            ],
        },
        {
            name: "Mountain Meadow",
            slug: "mountain-meadow",
            description: "Wildflower-inspired mix of blues, purples, and soft whites. Free-spirited and fresh.",
            basePrice: 880,
            categorySlug: "birthday",
            occasionTags: ["birthday", "graduation", "just-because"],
            images: [
                { alt: "Mountain Meadow bouquet front view", order: 0 },
                { alt: "Mountain Meadow bouquet overhead", order: 1 },
            ],
            variants: [
                { name: "Small", price: 0, sku: "MTN-MDW-S" },
                { name: "Medium", price: 140, sku: "MTN-MDW-M" },
            ],
            addOns: [
                { name: "Gift Wrap +₱80", price: 80 },
            ],
        },
        {
            name: "Rustic Charm",
            slug: "rustic-charm",
            description: "Earth-toned blooms with burlap-wrapped stems, dried lavender sprigs, and cinnamon sticks. Warm and farmhouse-style.",
            basePrice: 1020,
            categorySlug: "wedding",
            occasionTags: ["wedding", "anniversary"],
            images: [
                { alt: "Rustic Charm bouquet front view", order: 0 },
                { alt: "Rustic Charm bouquet detail", order: 1 },
                { alt: "Rustic Charm bouquet with burlap wrap", order: 2 },
            ],
            variants: [
                { name: "Small", price: 0, sku: "RST-CHM-S" },
                { name: "Medium", price: 190, sku: "RST-CHM-M" },
                { name: "Large", price: 420, sku: "RST-CHM-L" },
            ],
            addOns: [
                { name: "Message Card +₱50", price: 50 },
                { name: "Ribbon Upgrade +₱60", price: 60 },
            ],
        },
        {
            name: "Lilac Reverie",
            slug: "lilac-reverie",
            description: "Purple and mauve blooms with trailing ivy vines. Romantic and dreamy — a showstopper for any occasion.",
            basePrice: 1050,
            categorySlug: "romance",
            occasionTags: ["romance", "anniversary", "wedding"],
            images: [
                { alt: "Lilac Reverie bouquet front view", order: 0 },
                { alt: "Lilac Reverie bouquet side angle", order: 1 },
            ],
            variants: [
                { name: "Small", price: 0, sku: "LIL-REV-S" },
                { name: "Medium", price: 180, sku: "LIL-REV-M" },
            ],
            addOns: [
                { name: "Message Card +₱50", price: 50 },
                { name: "Gift Wrap +₱80", price: 80 },
                { name: "Vase Upgrade +₱150", price: 150 },
            ],
        },
        {
            name: "Capri Breeze",
            slug: "capri-breeze",
            description: "Cool blues and crisp whites with ocean-inspired accents. Light, airy, and vacation-ready.",
            basePrice: 760,
            categorySlug: "graduation",
            occasionTags: ["graduation", "birthday"],
            images: [
                { alt: "Capri Breeze bouquet front view", order: 0 },
                { alt: "Capri Breeze bouquet overhead", order: 1 },
            ],
            variants: [
                { name: "Small", price: 0, sku: "CAP-BRZ-S" },
                { name: "Medium", price: 120, sku: "CAP-BRZ-M" },
            ],
            addOns: [
                { name: "Message Card +₱50", price: 50 },
            ],
        },
        {
            name: "Cozy Cottage",
            slug: "cozy-cottage",
            description: "A warm, gathered bunch of rust, mustard, and cream blooms in a homespun style. Like a hug in flower form.",
            basePrice: 680,
            categorySlug: "just-because",
            occasionTags: ["just-because", "get-well"],
            images: [
                { alt: "Cozy Cottage bouquet front view", order: 0 },
                { alt: "Cozy Cottage bouquet detail", order: 1 },
            ],
            variants: [
                { name: "Small", price: 0, sku: "COZ-COT-S" },
                { name: "Medium", price: 110, sku: "COZ-COT-M" },
            ],
            addOns: [
                { name: "Message Card +₱50", price: 50 },
                { name: "Gift Wrap +₱80", price: 80 },
            ],
        },
        {
            name: "Velvet Noir",
            slug: "velvet-noir",
            description: "Deep burgundy and nearly-black roses with charcoal foliage. Dramatic and sophisticated.",
            basePrice: 1300,
            categorySlug: "anniversary",
            occasionTags: ["anniversary", "romance"],
            images: [
                { alt: "Velvet Noir bouquet front view", order: 0 },
                { alt: "Velvet Noir bouquet detail", order: 1 },
                { alt: "Velvet Noir bouquet dark setting", order: 2 },
            ],
            variants: [
                { name: "Small", price: 0, sku: "VLV-NR-S" },
                { name: "Medium", price: 220, sku: "VLV-NR-M" },
                { name: "Large", price: 500, sku: "VLV-NR-L" },
            ],
            addOns: [
                { name: "Message Card +₱50", price: 50 },
                { name: "Gift Wrap +₱80", price: 80 },
                { name: "Ribbon Upgrade +₱60", price: 60 },
            ],
        },
    ];

const NOW = new Date();
const SELLER_USER = {
    clerkId: "seed_seller",
    email: "seller@bloom.test",
    name: "Bloom & Bind",
    role: "SELLER" as const,
};

const CUSTOMER_USERS = [
    {
        clerkId: "seed_customer_1",
        email: "alice@example.test",
        name: "Alice Reyes",
        role: "CUSTOMER" as const,
    },
    {
        clerkId: "seed_customer_2",
        email: "ben@example.test",
        name: "Ben Torres",
        role: "CUSTOMER" as const,
    },
];

// ── Helpers ────────────────────────────────────────────

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
const CLOUDINARY_BASE = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

function placeholderUrl(index: number): string {
    // Must be a valid public Cloudinary demo CDN asset so next/image doesn't throw.
    // Keep same base file; only keep deterministic ordering via `order` field.
    return `${CLOUDINARY_BASE}/sample.jpg`;
}

function formatOrderNumber(index: number): string {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `BB-${y}${m}${d}-${String(index).padStart(4, "0")}`;
}

// ── Main seed function ─────────────────────────────────

async function main() {
    console.log("🌱 Seeding Bloom & Bind database...");

    // Clean existing data in dependency order
    await prisma.review.deleteMany();
    await prisma.message.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.inventory.deleteMany();
    await prisma.addOn.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.proposal.deleteMany();
    await prisma.customRequest.deleteMany();
    await prisma.address.deleteMany();
    await prisma.user.deleteMany();
    await prisma.category.deleteMany();

    console.log("   Cleared existing data.");

    // ── Categories ───────────────────────────────────────

    await prisma.category.createMany({
        data: CATEGORIES.map((cat) => ({
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
        })),
        skipDuplicates: true,
    });

    const categories = await prisma.category.findMany({
        where: { slug: { in: CATEGORIES.map((c) => c.slug) } },
    });

    const categoryMap = new Map<string, string>(
        categories.map((c) => [c.slug, c.id])
    );

    if (categoryMap.size !== CATEGORIES.length) {
        throw new Error(
            `Expected ${CATEGORIES.length} categories, found ${categoryMap.size}`
        );
    }

    console.log(`   Created ${CATEGORIES.length} categories.`);

    // ── Users ────────────────────────────────────────────
    // Idempotent inserts (unique on User.clerkId)

    await prisma.user.createMany({
        data: [
            { ...SELLER_USER },
            ...CUSTOMER_USERS.map((u) => ({ ...u })),
        ],
        skipDuplicates: true,
    });

    const users = await prisma.user.findMany({
        where: { clerkId: { in: [SELLER_USER.clerkId, ...CUSTOMER_USERS.map((u) => u.clerkId)] } },
    });

    const seller = users.find((u) => u.clerkId === SELLER_USER.clerkId);
    if (!seller) throw new Error("Seed seller user not found after createMany");

    const customers = users.filter((u) => u.role === "CUSTOMER");

    console.log(`   Created 1 seller + ${customers.length} customers.`);

    // ── Products (with images, variants, add-ons) ────────

    const productIdMap = new Map<string, string>();
    const productBasePriceMap = new Map<string, number>();

    for (const pd of PRODUCTS_DATA) {
        const categoryId = categoryMap.get(pd.categorySlug);
        if (!categoryId) throw new Error(`Category not found: ${pd.categorySlug}`);

        const product = await prisma.product.create({
            data: {
                name: pd.name,
                slug: pd.slug,
                description: pd.description,
                basePrice: pd.basePrice,
                categoryId,
                occasionTags: pd.occasionTags,
                isActive: true,
                images: {
                    createMany: {
                        data: pd.images.map((img) => ({
                            url: placeholderUrl(img.order),
                            alt: img.alt,
                            order: img.order,
                        })),
                    },
                },
                variants: {
                    createMany: {
                        data: pd.variants.map((v) => ({
                            name: v.name,
                            price: v.price,
                            sku: v.sku,
                        })),
                    },
                },
                addOns: {
                    createMany: {
                        data: pd.addOns.map((a) => ({
                            name: a.name,
                            price: a.price,
                        })),
                    },
                },
            },
        });

        productIdMap.set(pd.slug, product.id);
        productBasePriceMap.set(pd.slug, pd.basePrice);
    }

    console.log(
        `   Created ${PRODUCTS_DATA.length} products with images, variants, and add-ons.`
    );

    // ── Inventory (for a few products) ────────────────────

    const inventoryProducts = [
        "ivory-dream",
        "blush-garden",
        "sunshine-posy",
        "crimson-heart",
        "lavender-fields",
    ];

    const inventoryRows = inventoryProducts
        .map((slug) => {
            const productId = productIdMap.get(slug);
            if (!productId) return null;
            return {
                productId,
                quantity: 20,
                unit: "pieces",
                lowStock: 5,
            };
        })
        .filter(Boolean) as { productId: string; quantity: number; unit: string; lowStock: number }[];

    await prisma.inventory.createMany({
        data: inventoryRows,
        skipDuplicates: true, // Inventory unique on productId
    });

    console.log(`   Created ${inventoryRows.length} inventory rows.`);

    // ── Sample Orders ────────────────────────────────────

    const orderData = [
        {
            // DELIVERED order — Alice
            userIndex: 0,
            status: "DELIVERED" as const,
            productSlug: "ivory-dream",
            variantIndex: 1, // Medium
            quantity: 1,
            addOnSlugs: ["Message Card +₱50"],
            deliverySlot: "MORNING" as const,
            paymentMethod: "COD" as const,
            deliveryDate: new Date(NOW.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        },
        {
            // PREPARING order — Alice
            userIndex: 0,
            status: "PREPARING" as const,
            productSlug: "blush-garden",
            variantIndex: 0, // Small
            quantity: 2,
            addOnSlugs: ["Message Card +₱50", "Gift Wrap +₱80"],
            deliverySlot: "AFTERNOON" as const,
            paymentMethod: "EWALLET" as const,
            deliveryDate: new Date(NOW.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        },
        {
            // PENDING order — Ben
            userIndex: 1,
            status: "PENDING" as const,
            productSlug: "crimson-heart",
            variantIndex: 2, // Large
            quantity: 1,
            addOnSlugs: ["Message Card +₱50", "Gift Wrap +₱80", "Vase Upgrade +₱150"],
            deliverySlot: "EVENING" as const,
            paymentMethod: "MANUAL" as const,
            deliveryDate: new Date(NOW.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        },
        {
            // DELIVERED order — Ben
            userIndex: 1,
            status: "DELIVERED" as const,
            productSlug: "sunshine-posy",
            variantIndex: 0, // Small
            quantity: 1,
            addOnSlugs: [],
            deliverySlot: "MORNING" as const,
            paymentMethod: "COD" as const,
            deliveryDate: new Date(NOW.getTime() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        },
        {
            // CONFIRMED order — Alice
            userIndex: 0,
            status: "CONFIRMED" as const,
            productSlug: "lavender-fields",
            variantIndex: 1, // Medium
            quantity: 1,
            addOnSlugs: ["Message Card +₱50"],
            deliverySlot: "AFTERNOON" as const,
            paymentMethod: "EWALLET" as const,
            deliveryDate: new Date(NOW.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        },
    ];

    let orderIndex = 0;
    const createdOrders: { id: string; userId: string; status: string; productId: string }[] = [];

    for (const od of orderData) {
        orderIndex++;
        const customer = customers[od.userIndex];
        const productId = productIdMap.get(od.productSlug)!;
        const basePrice = productBasePriceMap.get(od.productSlug)!;

        // Find variant and add-on records that were created with the product
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { variants: true, addOns: true },
        });
        if (!product) throw new Error(`Product not found: ${od.productSlug}`);

        const variant = product.variants[od.variantIndex];
        if (!variant) throw new Error(`Variant index ${od.variantIndex} not found for ${od.productSlug}`);

        const selectedAddOns = product.addOns.filter((a) =>
            od.addOnSlugs.some((slug) => a.name === slug)
        );
        const addOnTotal = selectedAddOns.reduce((sum, a) => sum + Number(a.price), 0);
        const unitPrice = basePrice + Number(variant.price);
        const itemTotal = unitPrice * od.quantity;
        const subtotal = itemTotal + addOnTotal;
        const deliveryFee = 100; // flat delivery fee
        const total = subtotal + deliveryFee;

        const order = await prisma.order.create({
            data: {
                orderNumber: formatOrderNumber(orderIndex),
                userId: customer.id,
                status: od.status,
                subtotal,
                deliveryFee,
                total,
                deliveryAddress: `${customer.name ?? "Customer"}, 123 ${(customer.name ?? "Customer").split(" ")[0]} Street, Barangay Central, Quezon City, 1100`,
                deliveryDate: od.deliveryDate,
                deliverySlot: od.deliverySlot,
                paymentMethod: od.paymentMethod,
                items: {
                    create: {
                        productId,
                        variantId: variant.id,
                        quantity: od.quantity,
                        customizations: { size: variant.name },
                        price: unitPrice,
                    },
                },
            },
            include: { items: true },
        });

        createdOrders.push({ id: order.id, userId: customer.id, status: od.status, productId });
    }

    console.log(`   Created ${orderData.length} sample orders.`);

    // ── Reviews (attached to DELIVERED orders) ──────────

    const deliveredOrders = createdOrders.filter((o) => o.status === "DELIVERED");
    const reviewData = [
        {
            userIndex: 0, // Alice
            orderIndex: 0, // First delivered order (Ivory Dream)
            rating: 5,
            comment: "Absolutely stunning! The ivory roses looked even more beautiful in person. Perfect for our wedding — thank you, Bloom & Bind!",
        },
        {
            userIndex: 1, // Ben
            orderIndex: 1, // Second delivered order (Sunshine Posy)
            rating: 4,
            comment: "My mom loved the Sunshine Posy! It's bright and cheerful, exactly what she needed. Will order again.",
        },
        {
            userIndex: 0, // Alice
            orderIndex: 0, // Same order as first review (Ivory Dream) — unique constraint userId+orderId
            // Skip — can only have one review per user+order
        },
    ];

    let reviewCount = 0;
    for (const rv of reviewData) {
        if (rv.orderIndex === undefined) continue;
        if (rv.userIndex === undefined) continue;

        const order = deliveredOrders[rv.orderIndex];
        if (!order || !rv.rating) continue;

        // Check uniqueness constraint
        const existing = await prisma.review.findUnique({
            where: { userId_orderId: { userId: customers[rv.userIndex].id, orderId: order.id } },
        });
        if (existing) continue;

        await prisma.review.create({
            data: {
                userId: customers[rv.userIndex].id,
                productId: order.productId,
                orderId: order.id,
                rating: rv.rating,
                comment: rv.comment ?? null,
            },
        });
        reviewCount++;
    }

    console.log(`   Created ${reviewCount} reviews.`);

    // ── Summary ──────────────────────────────────────────

    const counts = {
        categories: await prisma.category.count(),
        products: await prisma.product.count(),
        productImages: await prisma.productImage.count(),
        productVariants: await prisma.productVariant.count(),
        addOns: await prisma.addOn.count(),
        users: await prisma.user.count(),
        orders: await prisma.order.count(),
        orderItems: await prisma.orderItem.count(),
        reviews: await prisma.review.count(),
        inventory: await prisma.inventory.count(),
    };

    console.log("\n✅ Seed complete! Summary:");
    for (const [key, value] of Object.entries(counts)) {
        console.log(`   ${key}: ${value}`);
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error("❌ Seed failed:", e);
        await prisma.$disconnect();
        process.exit(1);
    });
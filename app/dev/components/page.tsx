'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Toggle } from '@/components/ui/toggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Heart, Settings, ChevronDown, ShoppingCart } from 'lucide-react';
import { ThemeSettingsStub } from '@/components/layout/ThemeSettingsStub';
import { useTheme } from '@/lib/theme/ThemeProvider';

// ─── Active Badge ─────────────────────────────────────────────────────────────

function ThemeBadge() {
    const { color, mode, motion } = useTheme();
    return (
        <div className="flex flex-wrap gap-2 items-center">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent-primary text-text-primary border border-border-interactive">
                {color.charAt(0).toUpperCase() + color.slice(1)} Theme
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-bg-elevated text-text-primary border border-border-default">
                {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-bg-elevated text-text-primary border border-border-default">
                Motion: {motion.charAt(0).toUpperCase() + motion.slice(1)}
            </span>
        </div>
    );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-text-primary">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
        </section>
    );
}

function DemoPanel({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="p-6 rounded-2xl border border-border-default bg-bg-surface space-y-4 shadow-sm">
            <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
            {children}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ComponentGalleryPage() {
    return (
        <div className="p-8 min-h-screen bg-bg-base text-text-primary transition-colors duration-200">
            <div className="max-w-5xl mx-auto space-y-12 pb-32">

                {/* Header */}
                <div className="space-y-3">
                    <h1 className="text-4xl font-bold tracking-tight text-text-primary">
                        shadcn/ui Component Gallery
                    </h1>
                    <p className="text-text-muted">
                        All components render with Bloom & Bind design tokens. Use the settings
                        panel (bottom-right) to verify correct rendering across all four theme
                        combinations (Blue/Pink × Light/Dark).
                    </p>
                    <ThemeBadge />
                </div>

                {/* ── Card ──────────────────────────────────────────────────────────── */}
                <Section title="Card">
                    <DemoPanel title="Default Card">
                        <Card className="border-border-default">
                            <CardHeader>
                                <CardTitle>Product Card</CardTitle>
                                <CardDescription>Blush Pink Bouquet — Medium</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-32 rounded-xl bg-bg-elevated flex items-center justify-center text-text-muted text-sm">
                                    Product Image Placeholder
                                </div>
                                <p className="mt-3 text-sm text-text-muted">
                                    A handcrafted bouquet with blush pink roses, eucalyptus, and
                                    baby's breath in a kraft-paper wrap.
                                </p>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <span className="text-lg font-semibold text-text-primary">₱850</span>
                                <Button size="sm">Add to Cart</Button>
                            </CardFooter>
                        </Card>
                    </DemoPanel>

                    <DemoPanel title="Card Variants">
                        <Card className="border-border-default bg-bg-elevated">
                            <CardHeader>
                                <CardTitle>Elevated Card</CardTitle>
                                <CardDescription>on bg-elevated surface</CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm text-text-muted">
                                This card uses bg-elevated instead of the default bg-surface for
                                visual hierarchy in a bento grid layout.
                            </CardContent>
                            <CardFooter>
                                <Badge>Featured</Badge>
                            </CardFooter>
                        </Card>
                    </DemoPanel>
                </Section>

                {/* ── Form Controls ─────────────────────────────────────────────────── */}
                <Section title="Form Controls">
                    <DemoPanel title="Input & Label">
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" placeholder="Enter your name" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" placeholder="you@example.com" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="disabled-input">Disabled</Label>
                                <Input id="disabled-input" disabled value="Cannot edit" />
                            </div>
                        </div>
                    </DemoPanel>

                    <DemoPanel title="Select">
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <Label htmlFor="occasion">Occasion</Label>
                                <Select>
                                    <SelectTrigger id="occasion" className="w-full">
                                        <SelectValue placeholder="Select occasion" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="wedding">Wedding</SelectItem>
                                        <SelectItem value="birthday">Birthday</SelectItem>
                                        <SelectItem value="anniversary">Anniversary</SelectItem>
                                        <SelectItem value="sympathy">Sympathy</SelectItem>
                                        <SelectItem value="just-because">Just Because</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="size">Bouquet Size</Label>
                                <Select>
                                    <SelectTrigger id="size" className="w-full">
                                        <SelectValue placeholder="Select size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="small">Small — ₱550</SelectItem>
                                        <SelectItem value="medium">Medium — ₱850</SelectItem>
                                        <SelectItem value="large">Large — ₱1,200</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </DemoPanel>

                    <DemoPanel title="Textarea">
                        <div className="space-y-1">
                            <Label htmlFor="message">Message Card (max 200 chars)</Label>
                            <Textarea
                                id="message"
                                placeholder="Write your personalized message..."
                                className="min-h-[100px]"
                            />
                        </div>
                    </DemoPanel>

                    <DemoPanel title="Checkbox">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Checkbox id="wrapping" />
                                <Label htmlFor="wrapping" className="cursor-pointer">Premium Wrapping (+₱150)</Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <Checkbox id="vase" />
                                <Label htmlFor="vase" className="cursor-pointer">Glass Vase (+₱200)</Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <Checkbox id="ribbon" />
                                <Label htmlFor="ribbon" className="cursor-pointer">Ribbon Upgrade (+₱80)</Label>
                            </div>
                        </div>
                    </DemoPanel>

                    <DemoPanel title="Radio Group">
                        <div className="space-y-1">
                            <Label>Payment Method</Label>
                            <RadioGroup defaultValue="cod" className="mt-2 space-y-2">
                                <div className="flex items-center gap-3">
                                    <RadioGroupItem value="cod" id="cod" />
                                    <Label htmlFor="cod" className="cursor-pointer">Cash on Delivery</Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <RadioGroupItem value="ewallet" id="ewallet" />
                                    <Label htmlFor="ewallet" className="cursor-pointer">E-wallet Transfer</Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <RadioGroupItem value="manual" id="manual" />
                                    <Label htmlFor="manual" className="cursor-pointer">Manual Arrangement</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </DemoPanel>

                    <DemoPanel title="Toggle">
                        <div className="space-y-3">
                            <Label>Size Selector</Label>
                            <div className="flex gap-2">
                                <Toggle aria-label="Small size">S</Toggle>
                                <Toggle aria-label="Medium size" defaultPressed>M</Toggle>
                                <Toggle aria-label="Large size">L</Toggle>
                            </div>
                            <Label className="block mt-3">Feature Toggle</Label>
                            <Toggle aria-label="Toggle heart" className="gap-2">
                                <Heart className="h-4 w-4" />
                                <span>Wishlist</span>
                            </Toggle>
                        </div>
                    </DemoPanel>
                </Section>

                {/* ── Tabs ──────────────────────────────────────────────────────────── */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-text-primary">Tabs</h2>
                    <DemoPanel title="Customization Studio Wizard">
                        <Tabs defaultValue="size" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="size">Size</TabsTrigger>
                                <TabsTrigger value="color">Color</TabsTrigger>
                                <TabsTrigger value="extras">Extras</TabsTrigger>
                            </TabsList>
                            <TabsContent value="size" className="p-4 text-sm text-text-muted border border-border-default rounded-xl mt-2">
                                Choose your bouquet size: Small (₱550), Medium (₱850), or Large (₱1,200).
                            </TabsContent>
                            <TabsContent value="color" className="p-4 text-sm text-text-muted border border-border-default rounded-xl mt-2">
                                Pick from available flower colors: Blush Pink, Coral, Ivory, Lavender, Sunflower, Red Rose, White.
                            </TabsContent>
                            <TabsContent value="extras" className="p-4 text-sm text-text-muted border border-border-default rounded-xl mt-2">
                                Add premium wrapping, a glass vase, a ribbon upgrade, or a personalized message card.
                            </TabsContent>
                        </Tabs>
                    </DemoPanel>
                </section>

                {/* ── Badge ─────────────────────────────────────────────────────────── */}
                <Section title="Badge">
                    <DemoPanel title="Status Indicators">
                        <div className="flex flex-wrap gap-2">
                            <Badge>Default</Badge>
                            <Badge variant="secondary">Secondary</Badge>
                            <Badge variant="outline">Outline</Badge>
                            <Badge variant="destructive">Cancelled</Badge>
                        </div>
                    </DemoPanel>

                    <DemoPanel title="Contextual Badges">
                        <div className="flex flex-wrap gap-2 items-center">
                            <Badge className="bg-accent-primary text-text-primary hover:bg-accent-primary-hover">In Stock</Badge>
                            <Badge className="bg-accent-secondary text-text-primary hover:bg-accent-secondary-hover">Best Seller</Badge>
                            <Badge className="bg-state-success text-white hover:bg-state-success">Delivered</Badge>
                            <Badge className="bg-state-warning text-white hover:bg-state-warning">Pending</Badge>
                        </div>
                    </DemoPanel>
                </Section>

                {/* ── Skeleton ──────────────────────────────────────────────────────── */}
                <Section title="Skeleton">
                    <DemoPanel title="Product Card Skeleton">
                        <div className="space-y-3">
                            <Skeleton className="h-32 w-full rounded-xl" />
                            <Skeleton className="h-4 w-3/4 rounded-md" />
                            <Skeleton className="h-3 w-1/2 rounded-md" />
                            <div className="flex justify-between items-center pt-2">
                                <Skeleton className="h-5 w-16 rounded-md" />
                                <Skeleton className="h-8 w-24 rounded-lg" />
                            </div>
                        </div>
                    </DemoPanel>

                    <DemoPanel title="Order List Skeleton">
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-1/2 rounded-md" />
                                        <Skeleton className="h-3 w-1/3 rounded-md" />
                                    </div>
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </DemoPanel>
                </Section>

                {/* ── Dialog ────────────────────────────────────────────────────────── */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-text-primary">Dialog</h2>
                    <DemoPanel title="Modal Triggers">
                        <div className="flex flex-wrap gap-3">
                            <Dialog>
                                <DialogTrigger>
                                    <Button>Open Confirmation</Button>
                                </DialogTrigger>
                                <DialogContent className="rounded-[20px]">
                                    <DialogHeader>
                                        <DialogTitle>Confirm Order</DialogTitle>
                                        <DialogDescription>
                                            You are about to place this order. Once confirmed, you will
                                            receive a delivery schedule confirmation.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-2 py-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-muted">Item</span>
                                            <span className="font-medium">Blush Pink Bouquet (Medium)</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-muted">Total</span>
                                            <span className="font-semibold">₱1,080</span>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline">Cancel</Button>
                                        <Button>Confirm Order</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Dialog>
                                <DialogTrigger>
                                    <Button variant="outline">Cancel Dialog</Button>
                                </DialogTrigger>
                                <DialogContent className="rounded-[20px]">
                                    <DialogHeader>
                                        <DialogTitle>Cancel Order?</DialogTitle>
                                        <DialogDescription>
                                            This action cannot be undone. Your order will be cancelled
                                            and any applicable refund will be processed manually.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button variant="outline">Keep Order</Button>
                                        <Button variant="destructive">Cancel Order</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </DemoPanel>
                </section>

                {/* ── Dropdown Menu ─────────────────────────────────────────────────── */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-text-primary">Dropdown Menu</h2>
                    <DemoPanel title="Account & Sort Menus">
                        <div className="flex flex-wrap gap-3">
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <Button variant="outline" className="gap-2">
                                        <Settings className="h-4 w-4" />
                                        Account Menu
                                        <ChevronDown className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-48">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>Profile</DropdownMenuItem>
                                    <DropdownMenuItem>Orders</DropdownMenuItem>
                                    <DropdownMenuItem>Messages</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-state-error">Sign Out</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <Button variant="outline" className="gap-2">
                                        Sort By
                                        <ChevronDown className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-40">
                                    <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
                                    <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
                                    <DropdownMenuItem>Newest First</DropdownMenuItem>
                                    <DropdownMenuItem>Best Rated</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </DemoPanel>
                </section>

                {/* ── Sonner Toast ──────────────────────────────────────────────────── */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-text-primary">Toast / Sonner</h2>
                    <DemoPanel title="Toast Triggers">
                        <div className="flex flex-wrap gap-3">
                            <Button
                                variant="outline"
                                onClick={() => toast.success('Added to Cart', {
                                    description: 'Blush Pink Bouquet (Medium) — ₱850',
                                    icon: <ShoppingCart className="h-4 w-4" />,
                                })}
                            >
                                Success Toast
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => toast.error('Order Failed', {
                                    description: 'Please check your delivery address and try again.',
                                })}
                            >
                                Error Toast
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => toast('Order Placed', {
                                    description: 'Your order #BB-2024 has been confirmed.',
                                    action: {
                                        label: 'View',
                                        onClick: () => console.log('View order'),
                                    },
                                })}
                            >
                                Action Toast
                            </Button>
                        </div>
                    </DemoPanel>
                </section>

                {/* ── Button (reference) ────────────────────────────────────────────── */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-text-primary">Button (Reference)</h2>
                    <DemoPanel title="Button Variants">
                        <div className="flex flex-wrap gap-3">
                            <Button>Default (Primary)</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="destructive">Destructive</Button>
                            <Button disabled>Disabled</Button>
                        </div>
                    </DemoPanel>
                </section>

            </div>

            {/* Toast container */}
            <Toaster richColors closeButton />

            {/* Floating settings panel */}
            <ThemeSettingsStub />
        </div>
    );
}
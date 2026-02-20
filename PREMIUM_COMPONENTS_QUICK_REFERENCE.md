# Premium Components Quick Reference 🚀

**Use this guide to quickly apply premium components to any page.**

---

## Import Statement

```tsx
import { StatCard, PremiumButton, PremiumCard, SkeletonLoader, Toast } from '@/components/premium'
```

---

## Component Quick Patterns

### Pattern 1: Stats Grid
```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  {stats.map((stat) => (
    <StatCard
      key={stat.label}
      label={stat.label}
      value={stat.value}
      icon={stat.icon}
      color="indigo"
      trend={{ value: 12, isPositive: true }}
    />
  ))}
</div>
```

### Pattern 2: Action Buttons
```tsx
<div className="flex gap-3">
  <PremiumButton variant="primary" size="lg">
    <Plus className="h-4 w-4" />
    Primary Action
  </PremiumButton>
  
  <PremiumButton variant="secondary" size="lg">
    Secondary Action
  </PremiumButton>
  
  <PremiumButton variant="ghost" size="lg">
    Ghost Action
  </PremiumButton>
</div>
```

### Pattern 3: Content Card
```tsx
<PremiumCard
  title="Section Title"
  description="Optional description"
  footer={<PremiumButton>Action</PremiumButton>}
>
  <p>Your content here</p>
</PremiumCard>
```

### Pattern 4: Loading State
```tsx
{loading ? (
  <SkeletonLoader count={4} height="h-32" />
) : (
  <div>Your content</div>
)}
```

### Pattern 5: Feature Grid
```tsx
<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
  {features.map((feature) => (
    <PremiumCard key={feature.name} hoverable>
      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center mb-3">
        <feature.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{feature.name}</h3>
      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{feature.desc}</p>
    </PremiumCard>
  ))}
</div>
```

---

## Color Variants

### StatCard Colors
```tsx
color="indigo"   // Primary (Indigo 600)
color="emerald"  // Success (Emerald 500)
color="amber"    // Warning (Amber 500)
color="rose"     // Danger (Rose 500)
color="blue"     // Info (Blue 500)
```

### Button Variants
```tsx
variant="primary"    // Indigo background
variant="secondary"  // Slate background
variant="ghost"      // Transparent with border
variant="danger"     // Rose background
```

### Button Sizes
```tsx
size="sm"   // 12px padding, 14px text
size="md"   // 16px padding, 14px text
size="lg"   // 24px padding, 16px text
```

---

## Typography Classes

```tsx
// Use these for consistent text hierarchy
<h1 className="text-premium-h1">Page Title</h1>
<h2 className="text-premium-h2">Section Title</h2>
<h3 className="text-premium-h3">Card Title</h3>
<p className="text-premium-body">Body text</p>
<p className="text-premium-small">Small text</p>
<p className="text-premium-tiny">Tiny text</p>
```

---

## Spacing Classes

```tsx
// Use these for consistent spacing
<div className="space-premium-xs">8px gap</div>
<div className="space-premium-sm">12px gap</div>
<div className="space-premium-md">16px gap</div>
<div className="space-premium-lg">24px gap</div>
<div className="space-premium-xl">32px gap</div>
```

---

## Shadow Classes

```tsx
// Use these for consistent shadows
<div className="shadow-premium-sm">Light shadow</div>
<div className="shadow-premium-md">Medium shadow</div>
<div className="shadow-premium-lg">Dark shadow</div>
```

---

## Common Page Patterns

### Dashboard Page
```tsx
<div className="space-y-8">
  {/* Welcome Section */}
  <div>
    <h1 className="text-premium-h1">Welcome back</h1>
    <p className="text-premium-body text-slate-600">Description</p>
  </div>

  {/* Stats Grid */}
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {/* StatCard components */}
  </div>

  {/* Quick Actions */}
  <div>
    <h2 className="text-premium-h2 mb-4">Quick Actions</h2>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {/* PremiumCard components */}
    </div>
  </div>

  {/* Content Sections */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* PremiumCard components */}
  </div>
</div>
```

### Feature Page
```tsx
<div className="space-y-8">
  {/* Header */}
  <div>
    <h1 className="text-premium-h1">Feature Name</h1>
    <p className="text-premium-body text-slate-600">Description</p>
    <PremiumButton className="mt-4">Get Started</PremiumButton>
  </div>

  {/* Main Content */}
  <PremiumCard title="Main Content">
    {/* Your content */}
  </PremiumCard>

  {/* Related Items */}
  <div>
    <h2 className="text-premium-h2 mb-4">Related</h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* PremiumCard components */}
    </div>
  </div>
</div>
```

---

## Dark Mode

All components automatically support dark mode. No additional code needed!

```tsx
// This works in both light and dark modes
<StatCard
  label="Active Cases"
  value={12}
  color="indigo"
/>
```

---

## Responsive Breakpoints

```tsx
// Mobile first approach
<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
  {/* 2 columns on mobile, 4 on tablet+, 4 on desktop */}
</div>
```

---

## Loading States

### Skeleton Loader
```tsx
{loading ? (
  <SkeletonLoader count={4} height="h-32" />
) : (
  <div>Content</div>
)}
```

### Button Loading
```tsx
<PremiumButton isLoading={loading}>
  <Sparkles className="h-4 w-4" />
  Process
</PremiumButton>
```

---

## Common Mistakes to Avoid

❌ **Don't**: Mix old and new components
```tsx
// Bad
<div className="bg-gray-100 rounded-2xl p-4">
  <StatCard />
</div>
```

✅ **Do**: Use PremiumCard wrapper
```tsx
// Good
<PremiumCard>
  <StatCard />
</PremiumCard>
```

---

❌ **Don't**: Use random colors
```tsx
// Bad
<div className="bg-blue-200 text-purple-600">
```

✅ **Do**: Use design system colors
```tsx
// Good
<StatCard color="indigo" />
```

---

❌ **Don't**: Inconsistent spacing
```tsx
// Bad
<div className="p-2 m-8 gap-3">
```

✅ **Do**: Use spacing classes
```tsx
// Good
<div className="space-premium-lg">
```

---

## Testing Checklist

- [ ] Component renders without errors
- [ ] Dark mode works correctly
- [ ] Mobile responsive (< 768px)
- [ ] Tablet responsive (768px - 1024px)
- [ ] Desktop responsive (> 1024px)
- [ ] Hover states work
- [ ] Loading states work
- [ ] Accessibility (keyboard navigation)
- [ ] No console errors

---

## Performance Tips

1. **Use SkeletonLoader** instead of spinners
2. **Lazy load** heavy components
3. **Memoize** repeated components
4. **Use CSS classes** instead of inline styles
5. **Avoid re-renders** with proper dependencies

---

## Need Help?

- **Component docs**: `PREMIUM_COMPONENTS_IMPLEMENTATION.md`
- **Design system**: `PREMIUM_DASHBOARD_DESIGN_SYSTEM.md`
- **Example**: `src/app/dashboard/page.tsx`

---

**Last Updated**: February 20, 2026  
**Version**: 1.0

const fs = require('fs');

const files = [
  'src/app/(auth)/login/page.tsx',
  'src/app/(auth)/signup/page.tsx',
  'src/app/(dashboard)/accounts/[id]/edit/page.tsx',
  'src/app/(dashboard)/accounts/[id]/page.tsx',
  'src/app/(dashboard)/accounts/create/page.tsx',
  'src/app/(dashboard)/accounts/page.tsx',
  'src/app/(dashboard)/businesses/create/page.tsx',
  'src/app/(dashboard)/businesses/page.tsx',
  'src/app/(dashboard)/cheques/create/page.tsx',
  'src/app/(dashboard)/cheques/page.tsx',
  'src/app/(dashboard)/features/page.tsx',
  'src/app/(dashboard)/page.tsx',
  'src/app/(dashboard)/parties/[id]/edit/page.tsx',
  'src/app/(dashboard)/parties/[id]/page.tsx',
  'src/app/(dashboard)/parties/create/page.tsx',
  'src/app/(dashboard)/parties/page.tsx',
  'src/app/(dashboard)/settings/page.tsx',
  'src/app/onboarding/page.tsx',
  'src/components/bank-selector.tsx',
  'src/components/bottom-nav.tsx',
  'src/components/business-switcher.tsx',
  'src/components/cheque-card.tsx',
  'src/components/global-search.tsx',
  'src/components/top-nav.tsx',
  'src/components/ui/calendar.tsx',
  'src/components/ui/checkbox.tsx',
  'src/components/ui/combobox.tsx',
  'src/components/ui/command.tsx',
  'src/components/ui/data-state.tsx',
  'src/components/ui/delete-dialog.tsx',
  'src/components/ui/dialog.tsx',
  'src/components/ui/empty-state.tsx',
  'src/components/ui/entity-avatar.tsx',
  'src/components/ui/select.tsx',
  'src/components/ui/toast.tsx'
];

let allIcons = new Set();

files.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const regex = /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const icons = match[1].split(',').map(s => s.trim()).filter(s => s);
      icons.forEach(i => allIcons.add(i));
    }
  }
});

console.log(Array.from(allIcons).sort());

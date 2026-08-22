import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
    },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-64 space-y-2">
      <Label htmlFor="email">Email address</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  ),
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'you@example.com',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: '••••••••',
  },
};

export const WithError: Story = {
  render: () => (
    <div className="w-64 space-y-2">
      <Label htmlFor="email-error">Email address</Label>
      <Input
        id="email-error"
        type="email"
        placeholder="you@example.com"
        value="invalid-email"
        aria-invalid={true}
        aria-describedby="email-error-msg"
        className="border-destructive focus-visible:ring-destructive"
      />
      <p id="email-error-msg" className="text-xs text-destructive" role="alert">
        Please enter a valid email address
      </p>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="w-64 space-y-2">
      <Label htmlFor="search">Search</Label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="search"
          type="search"
          placeholder="Search reports..."
          className="pl-9"
        />
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
    value: 'Cannot edit',
  },
};

export const Required: Story = {
  args: {
    placeholder: 'Required field',
    required: true,
  },
};

export const WithHelperText: Story = {
  render: () => (
    <div className="w-64 space-y-2">
      <Label htmlFor="password">Password</Label>
      <Input
        id="password"
        type="password"
        placeholder="••••••••"
        aria-describedby="password-hint"
      />
      <p id="password-hint" className="text-xs text-muted-foreground">
        Must be at least 8 characters
      </p>
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <form className="w-72 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" type="text" placeholder="John Doe" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-form">Email</Label>
        <Input id="email-form" type="email" placeholder="john@example.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password-form">Password</Label>
        <Input
          id="password-form"
          type="password"
          placeholder="••••••••"
          required
          aria-describedby="password-hint"
        />
        <p id="password-hint" className="text-xs text-muted-foreground">
          Min. 8 characters
        </p>
      </div>
      <button type="submit" className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        Create Account
      </button>
    </form>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="grid gap-4 w-64">
      <div className="space-y-2">
        <Label>Default</Label>
        <Input placeholder="Default state" />
      </div>
      <div className="space-y-2">
        <Label>Hover</Label>
        <Input placeholder="Hover me" defaultValue="Hover state" />
      </div>
      <div className="space-y-2">
        <Label>Focus</Label>
        <Input placeholder="Focus me" defaultValue="Focused" />
      </div>
      <div className="space-y-2">
        <Label>Filled</Label>
        <Input defaultValue="Pre-filled value" />
      </div>
      <div className="space-y-2">
        <Label>Error</Label>
        <Input
          placeholder="Error state"
          defaultValue="invalid"
          className="border-destructive focus-visible:ring-destructive"
          aria-invalid={true}
        />
      </div>
      <div className="space-y-2">
        <Label>Disabled</Label>
        <Input placeholder="Disabled" disabled defaultValue="Can't edit" />
      </div>
    </div>
  ),
};
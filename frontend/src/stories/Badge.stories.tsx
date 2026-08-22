import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, XCircle, Loader2, Info as InfoIcon, ShieldCheck } from 'lucide-react';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    tone: {
      control: 'select',
      options: ['primary', 'success', 'warning', 'destructive', 'info', 'neutral', 'subtle', 'brand'],
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
    },
    variant: {
      control: 'select',
      options: ['soft', 'solid', 'outline'],
    },
    dot: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const Primary: Story = {
  args: {
    tone: 'primary',
    children: 'Primary',
  },
};

export const Success: Story = {
  args: {
    tone: 'success',
    children: 'Success',
  },
};

export const Warning: Story = {
  args: {
    tone: 'warning',
    children: 'Warning',
  },
};

export const Destructive: Story = {
  args: {
    tone: 'destructive',
    children: 'Destructive',
  },
};

export const Info: Story = {
  args: {
    tone: 'info',
    children: 'Info',
  },
};

export const Neutral: Story = {
  args: {
    tone: 'neutral',
    children: 'Neutral',
  },
};

export const Subtle: Story = {
  args: {
    tone: 'subtle',
    children: 'Subtle',
  },
};

export const Brand: Story = {
  args: {
    tone: 'brand',
    children: 'Role Brand',
  },
};

export const WithIcon: Story = {
  args: {
    tone: 'success',
    icon: <CheckCircle2 />,
    children: 'Verified',
  },
};

export const WithDot: Story = {
  args: {
    tone: 'warning',
    dot: true,
    children: 'Pending',
  },
};

export const AllTones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge tone="primary">Primary</Badge>
      <Badge tone="success">Success</Badge>
      <Badge tone="warning">Warning</Badge>
      <Badge tone="destructive">Destructive</Badge>
      <Badge tone="info">Info</Badge>
      <Badge tone="neutral">Neutral</Badge>
      <Badge tone="subtle">Subtle</Badge>
      <Badge tone="brand">Brand</Badge>
    </div>
  ),
};

export const AllTonesSolid: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge tone="primary" variant="solid">Primary</Badge>
      <Badge tone="success" variant="solid">Success</Badge>
      <Badge tone="warning" variant="solid">Warning</Badge>
      <Badge tone="destructive" variant="solid">Destructive</Badge>
      <Badge tone="info" variant="solid">Info</Badge>
      <Badge tone="neutral" variant="solid">Neutral</Badge>
      <Badge tone="brand" variant="solid">Brand</Badge>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Badge size="sm">Small</Badge>
      <Badge size="default">Default</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
};

export const StatusExamples: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge tone="primary" icon={<Loader2 className="animate-spin" />} dot>Pending</Badge>
      <Badge tone="success" icon={<CheckCircle2 />} dot>Resolved</Badge>
      <Badge tone="warning" icon={<AlertTriangle />} dot>Needs Review</Badge>
      <Badge tone="destructive" icon={<XCircle />} dot>Rejected</Badge>
      <Badge tone="info" icon={<InfoIcon />} dot>Verified</Badge>
      <Badge tone="brand" icon={<ShieldCheck />} dot>Authority</Badge>
    </div>
  ),
};

export const SLABadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge tone="success" variant="solid" dot>On Track</Badge>
      <Badge tone="warning" variant="solid" dot>Warning</Badge>
      <Badge tone="destructive" variant="solid" dot>Critical</Badge>
      <Badge tone="destructive" variant="solid" dot>Overdue</Badge>
    </div>
  ),
};
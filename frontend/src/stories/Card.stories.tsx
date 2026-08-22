import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'interactive', 'elevated', 'outlined'],
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'default', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    variant: 'default',
    padding: 'default',
    children: (
      <>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description goes here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Card content with default padding.</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm">Action</Button>
        </CardFooter>
      </>
    ),
  },
};

export const Interactive: Story = {
  args: {
    variant: 'interactive',
    padding: 'default',
    children: (
      <>
        <CardHeader>
          <CardTitle>Interactive Card</CardTitle>
          <CardDescription>Hover to see elevation effect</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">This card has hover effects.</p>
        </CardContent>
      </>
    ),
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    padding: 'default',
    children: (
      <>
        <CardHeader>
          <CardTitle>Elevated Card</CardTitle>
          <CardDescription>Higher shadow for emphasis</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Elevated card with larger shadow.</p>
        </CardContent>
      </>
    ),
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    padding: 'default',
    children: (
      <>
        <CardHeader>
          <CardTitle>Outlined Card</CardTitle>
          <CardDescription>Subtle border, no shadow</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Outlined variant for subtle separation.</p>
        </CardContent>
      </>
    ),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card variant="default">
        <CardHeader>
          <CardTitle>Default</CardTitle>
        </CardHeader>
        <CardContent>Standard card with subtle shadow.</CardContent>
      </Card>
      <Card variant="interactive">
        <CardHeader>
          <CardTitle>Interactive</CardTitle>
        </CardHeader>
        <CardContent>Hover for elevation effect.</CardContent>
      </Card>
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Elevated</CardTitle>
        </CardHeader>
        <CardContent>Higher shadow for emphasis.</CardContent>
      </Card>
      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Outlined</CardTitle>
        </CardHeader>
        <CardContent>Subtle border, no shadow.</CardContent>
      </Card>
    </div>
  ),
};

export const WithBadge: Story = {
  args: {
    variant: 'default',
    padding: 'default',
    children: (
      <>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Report Card</CardTitle>
            <CardDescription>With status and SLA badges</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="primary" dot>Pending</Badge>
            <Badge tone="warning" variant="solid" dot>Warning</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Pothole on Main Street near the bus stop.</p>
        </CardContent>
        <CardFooter>
          <Button size="sm" variant="outline">View Details</Button>
        </CardFooter>
      </>
    ),
  },
};

export const Compact: Story = {
  args: {
    variant: 'default',
    padding: 'sm',
    children: (
      <>
        <CardHeader padding="sm">
          <CardTitle size="sm">Compact Card</CardTitle>
        </CardHeader>
        <CardContent padding="sm">
          <p className="text-xs text-muted-foreground">Smaller padding for dense layouts.</p>
        </CardContent>
      </>
    ),
  },
};

export const NoPadding: Story = {
  args: {
    variant: 'default',
    padding: 'none',
    children: (
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5" />
    ),
  },
};

export const ComplexExample: Story = {
  render: () => (
    <Card variant="interactive" className="max-w-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Pothole Report</CardTitle>
            <CardDescription>CP-00142 • 2 hours ago</CardDescription>
          </div>
          <Badge tone="primary" dot>Pending</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="aspect-video bg-muted/40 rounded-md" />
        <div className="space-y-1">
          <p className="text-sm font-medium">Large pothole near bus stop on Main St</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span>📍</span> 40.7128, -74.0060
          </p>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <Badge tone="warning" variant="solid" size="sm">SLA: 24h</Badge>
          <span>Reported by John D.</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">View</Button>
        <Button size="sm">Resolve</Button>
      </CardFooter>
    </Card>
  ),
};
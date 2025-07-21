
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

interface CrateItem {
  name: string;
  image_url?: string;
  value: number;
  drop_chance: number;
  rarity: string;
}

interface CrateFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export const CrateForm: React.FC<CrateFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    image_url: initialData?.image_url || '',
    rarity: initialData?.rarity || 'common',
    min_value: initialData?.min_value || 0,
    max_value: initialData?.max_value || 0,
    risk_level: initialData?.risk_level || 'LOW RISK',
    is_active: initialData?.is_active ?? true,
    items: [] as CrateItem[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        name: '',
        image_url: '',
        value: 0,
        drop_chance: 0,
        rarity: 'common'
      }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: keyof CrateItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Crate Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Crate Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="rarity">Rarity</Label>
              <Select value={formData.rarity} onValueChange={(value) => setFormData(prev => ({ ...prev, rarity: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="common">Common</SelectItem>
                  <SelectItem value="uncommon">Uncommon</SelectItem>
                  <SelectItem value="rare">Rare</SelectItem>
                  <SelectItem value="epic">Epic</SelectItem>
                  <SelectItem value="legendary">Legendary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_value">Minimum Value</Label>
              <Input
                id="min_value"
                type="number"
                min="0"
                step="0.01"
                value={formData.min_value}
                onChange={(e) => setFormData(prev => ({ ...prev, min_value: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="max_value">Maximum Value</Label>
              <Input
                id="max_value"
                type="number"
                min="0"
                step="0.01"
                value={formData.max_value}
                onChange={(e) => setFormData(prev => ({ ...prev, max_value: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="risk_level">Risk Level</Label>
            <Select value={formData.risk_level} onValueChange={(value) => setFormData(prev => ({ ...prev, risk_level: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW RISK">Low Risk</SelectItem>
                <SelectItem value="MEDIUM RISK">Medium Risk</SelectItem>
                <SelectItem value="HIGH RISK">High Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
        </CardContent>
      </Card>

      {/* Crate Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Crate Items</CardTitle>
            <Button type="button" onClick={addItem} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.items.map((item, index) => (
            <div key={index} className="border p-4 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Item {index + 1}</h4>
                <Button
                  type="button"
                  onClick={() => removeItem(index)}
                  variant="ghost"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Item Name</Label>
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>Image URL</Label>
                  <Input
                    type="url"
                    value={item.image_url || ''}
                    onChange={(e) => updateItem(index, 'image_url', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Value</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.value}
                    onChange={(e) => updateItem(index, 'value', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

                <div>
                  <Label>Drop Chance (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={item.drop_chance}
                    onChange={(e) => updateItem(index, 'drop_chance', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

                <div>
                  <Label>Rarity</Label>
                  <Select 
                    value={item.rarity} 
                    onValueChange={(value) => updateItem(index, 'rarity', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="common">Common</SelectItem>
                      <SelectItem value="uncommon">Uncommon</SelectItem>
                      <SelectItem value="rare">Rare</SelectItem>
                      <SelectItem value="epic">Epic</SelectItem>
                      <SelectItem value="legendary">Legendary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}

          {formData.items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No items added yet. Click "Add Item" to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (initialData ? 'Update Crate' : 'Create Crate')}
        </Button>
      </div>
    </form>
  );
};

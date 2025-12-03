'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fetchCategories } from '@/services/category.service';
import { createProduct } from '@/services/product.service';
import { uploadFile } from '@/services/file.service';
import type { Category } from '@/types/product';
import { IconDeviceFloppy, IconPlus } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { FileUploader } from '@/components/file-uploader';
import Image from 'next/image';

interface CreateProductDialogProps {
  onSuccess?: () => void;
}

export function CreateProductDialog({ onSuccess }: CreateProductDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pricePerKg: '',
    categoryId: '',
    minStorageHumidity: '',
    maxStorageHumidity: '',
    minStorageTemperature: '',
    maxStorageTemperature: ''
  });

  useEffect(() => {
    if (open) {
      loadCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const loadCategories = async () => {
    try {
      const response = await fetchCategories({ page: 1, limit: 100 });
      setCategories(response.data);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive'
      });
    }
  };

  const handleImageUpload = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      setUploading(true);
      const uploadedFile = await uploadFile(files[0]);
      const imageUrl = uploadedFile.path;
      setUploadedImageUrl(imageUrl);
      toast({
        title: 'Success',
        description: 'Image uploaded successfully'
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message ?? 'Failed to upload image',
        variant: 'destructive'
      });
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      pricePerKg: '',
      categoryId: '',
      minStorageHumidity: '',
      maxStorageHumidity: '',
      minStorageTemperature: '',
      maxStorageTemperature: ''
    });
    setUploadedImageUrl('');
    setImageFiles([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast({
        title: 'Validation Error',
        description: 'Product name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      await createProduct({
        name: formData.name,
        description: formData.description || null,
        pricePerKg: formData.pricePerKg
          ? parseFloat(formData.pricePerKg)
          : null,
        image: uploadedImageUrl || null,
        categoryId: formData.categoryId ? { id: formData.categoryId } : null,
        minStorageHumidity: formData.minStorageHumidity || null,
        maxStorageHumidity: formData.maxStorageHumidity || null,
        minStorageTemperature: formData.minStorageTemperature || null,
        maxStorageTemperature: formData.maxStorageTemperature || null
      });

      toast({
        title: 'Success',
        description: 'Product created successfully'
      });

      resetForm();
      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message ?? 'Failed to create product',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconPlus className='mr-2 h-4 w-4' />
          Add New Product
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
          <DialogDescription>
            Add a new product to your inventory
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className='max-h-[calc(90vh-180px)] pr-4'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Basic Information */}
            <div className='space-y-4'>
              <h3 className='text-base font-semibold'>Basic Information</h3>
              <div className='grid gap-4 md:grid-cols-3'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>
                    Product Name <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='name'
                    placeholder='e.g., Organic Tomatoes'
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='category'>Category</Label>
                  <Select
                    value={
                      formData.categoryId === ''
                        ? undefined
                        : formData.categoryId
                    }
                    onValueChange={(value) =>
                      setFormData({ ...formData, categoryId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select a category' />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter(
                          (category) =>
                            category.id && category.id.trim().length > 0
                        )
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name || 'Unnamed Category'}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='pricePerKg'>Price per Kg ($)</Label>
                  <Input
                    id='pricePerKg'
                    type='number'
                    step='0.01'
                    min='0'
                    placeholder='e.g., 2.50'
                    value={formData.pricePerKg}
                    onChange={(e) =>
                      setFormData({ ...formData, pricePerKg: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description'>Description</Label>
                <Textarea
                  id='description'
                  placeholder='Enter product description...'
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Storage Conditions */}
            <div className='space-y-4'>
              <h3 className='text-base font-semibold'>Storage Conditions</h3>
              <div className='space-y-4'>
                {/* Temperature Range */}
                <div className='space-y-2'>
                  <Label>Temperature Range (°C)</Label>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label
                        htmlFor='minStorageTemperature'
                        className='text-muted-foreground text-xs font-normal'
                      >
                        Minimum
                      </Label>
                      <Input
                        id='minStorageTemperature'
                        type='number'
                        step='0.1'
                        placeholder='e.g., 12'
                        value={formData.minStorageTemperature}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minStorageTemperature: e.target.value
                          })
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label
                        htmlFor='maxStorageTemperature'
                        className='text-muted-foreground text-xs font-normal'
                      >
                        Maximum
                      </Label>
                      <Input
                        id='maxStorageTemperature'
                        type='number'
                        step='0.1'
                        placeholder='e.g., 15'
                        value={formData.maxStorageTemperature}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maxStorageTemperature: e.target.value
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Humidity Range */}
                <div className='space-y-2'>
                  <Label>Humidity Range (%)</Label>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label
                        htmlFor='minStorageHumidity'
                        className='text-muted-foreground text-xs font-normal'
                      >
                        Minimum
                      </Label>
                      <Input
                        id='minStorageHumidity'
                        type='number'
                        step='0.1'
                        min='0'
                        max='100'
                        placeholder='e.g., 60'
                        value={formData.minStorageHumidity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minStorageHumidity: e.target.value
                          })
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label
                        htmlFor='maxStorageHumidity'
                        className='text-muted-foreground text-xs font-normal'
                      >
                        Maximum
                      </Label>
                      <Input
                        id='maxStorageHumidity'
                        type='number'
                        step='0.1'
                        min='0'
                        max='100'
                        placeholder='e.g., 70'
                        value={formData.maxStorageHumidity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maxStorageHumidity: e.target.value
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Image */}
            <div className='space-y-4'>
              <h3 className='text-base font-semibold'>Product Image</h3>
              <div className='space-y-2'>
                {uploadedImageUrl ? (
                  <div className='space-y-4'>
                    <div className='relative aspect-video w-full overflow-hidden rounded-lg border'>
                      <Image
                        src={uploadedImageUrl}
                        alt='Product preview'
                        fill
                        className='object-cover'
                      />
                    </div>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setUploadedImageUrl('')}
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <FileUploader
                    value={imageFiles}
                    onValueChange={setImageFiles}
                    onUpload={handleImageUpload}
                    maxFiles={1}
                    maxSize={1024 * 1024 * 5}
                    accept={{ 'image/*': [] }}
                    disabled={uploading}
                  />
                )}
              </div>
            </div>
          </form>
        </ScrollArea>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => {
              resetForm();
              setOpen(false);
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={loading || uploading}
            onClick={handleSubmit}
          >
            <IconDeviceFloppy className='mr-2 h-4 w-4' />
            {loading ? 'Creating...' : 'Create Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

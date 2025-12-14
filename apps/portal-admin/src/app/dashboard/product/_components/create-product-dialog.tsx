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
import { useTranslations } from 'next-intl';

interface CreateProductDialogProps {
  onSuccess?: () => void;
}

export function CreateProductDialog({ onSuccess }: CreateProductDialogProps) {
  const { toast } = useToast();
  const t = useTranslations('Product');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: ''
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
        title: t('toast.error'),
        description: t('createDialog.toast.loadCategoriesError'),
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
        title: t('toast.success'),
        description: t('toast.uploadSuccess')
      });
    } catch (err: any) {
      toast({
        title: t('toast.error'),
        description: err?.message ?? t('toast.uploadError'),
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
      categoryId: ''
    });
    setUploadedImageUrl('');
    setImageFiles([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast({
        title: t('toast.validationError'),
        description: t('createDialog.validation.nameRequired'),
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      await createProduct({
        name: formData.name,
        description: formData.description || null,
        image: uploadedImageUrl || null,
        category: formData.categoryId ? { id: formData.categoryId } : null
      });

      toast({
        title: t('toast.success'),
        description: t('toast.createSuccess')
      });

      resetForm();
      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      toast({
        title: t('toast.error'),
        description: err?.message ?? t('toast.createError'),
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
          {t('createDialog.trigger')}
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] max-w-3xl'>
        <DialogHeader>
          <DialogTitle>{t('createDialog.title')}</DialogTitle>
          <DialogDescription>{t('createDialog.description')}</DialogDescription>
        </DialogHeader>
        <ScrollArea className='max-h-[calc(90vh-180px)] pr-4'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Basic Information */}
            <div className='space-y-4'>
              <h3 className='text-base font-semibold'>
                {t('createDialog.basicTitle')}
              </h3>
              <div className='grid gap-4 md:grid-cols-3'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>
                    {t('createDialog.nameLabel')}{' '}
                    <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='name'
                    placeholder={t('createDialog.namePlaceholder')}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='category'>
                    {t('createDialog.categoryLabel')}
                  </Label>
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
                      <SelectValue
                        placeholder={t('createDialog.categoryPlaceholder')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter(
                          (category) =>
                            category.id && category.id.trim().length > 0
                        )
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name || t('common.unnamedCategory')}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description'>
                  {t('createDialog.descriptionLabel')}
                </Label>
                <Textarea
                  id='description'
                  placeholder={t('createDialog.descriptionPlaceholder')}
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Product Image */}
            <div className='space-y-4'>
              <h3 className='text-base font-semibold'>
                {t('createDialog.image.title')}
              </h3>
              <div className='space-y-2'>
                {uploadedImageUrl ? (
                  <div className='space-y-4'>
                    <div className='relative aspect-video w-full overflow-hidden rounded-lg border'>
                      <Image
                        src={uploadedImageUrl}
                        alt={t('createDialog.image.previewAlt')}
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
                      {t('createDialog.image.change')}
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
            {t('common.cancel')}
          </Button>
          <Button
            type='submit'
            disabled={loading || uploading}
            onClick={handleSubmit}
          >
            <IconDeviceFloppy className='mr-2 h-4 w-4' />
            {loading
              ? t('createDialog.footer.creating')
              : t('createDialog.footer.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

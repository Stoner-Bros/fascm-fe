'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

import { useToast } from '@/components/ui/use-toast';
import { useTranslations } from 'next-intl';

import {
  createConsignee,
  deleteConsignee,
  fetchConsignees,
  updateConsignee
} from '@/services/consignee.service';
import type { Consignee } from '@/types/consignee';

type ConsigneeForm = {
  contact: string;
  taxCode: string;
  address: string;
  certificate: string;
  qrCode: string;
  organizationName: string;
  representativeName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const DEFAULT_FORM: ConsigneeForm = {
  contact: '',
  taxCode: '',
  address: '',
  certificate: '',
  qrCode: '',
  organizationName: '',
  representativeName: '',
  firstName: '',
  lastName: '',
  email: '',
  password: ''
};

const formatDateTime = (value?: string | Date) => {
  if (!value) return '—';
  try {
    const date = typeof value === 'string' ? new Date(value) : value;
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date);
  } catch {
    return String(value);
  }
};

export default function ConsigneesAccount() {
  const t = useTranslations('Accounts.Consignees');
  const { toast } = useToast();
  const toastRef = useRef(toast);
  const isFetchingRef = useRef(false);

  const [form, setForm] = useState<ConsigneeForm>(DEFAULT_FORM);
  const [consignees, setConsignees] = useState<Consignee[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [organizationFilter, setOrganizationFilter] = useState<'ALL' | string>(
    'ALL'
  );
  const [editingConsignee, setEditingConsignee] = useState<Consignee | null>(
    null
  );

  // luôn sync ref với hook toast
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const resetForm = () => {
    setForm(DEFAULT_FORM);
  };

  // LOAD DATA – không phụ thuộc toast để tránh re-fetch
  const loadData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const res = await fetchConsignees({ page: 1, limit: 50 });
      setConsignees(res.data);
    } catch (error) {
      toastRef.current?.({
        variant: 'destructive',
        title: t('toast.loadError'),
        description:
          error instanceof Error ? error.message : t('toast.tryAgain')
      });
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, []); // <── deps rỗng, không bị tạo lại

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
      setEditingConsignee(null);
    }
  };

  const handleSubmit = async () => {
    if (
      !form.organizationName ||
      !form.representativeName ||
      !form.contact ||
      !form.address ||
      !form.taxCode ||
      !form.email ||
      !form.firstName ||
      !form.lastName ||
      (!editingConsignee && !form.password)
    ) {
      toast({
        variant: 'destructive',
        title: t('form.fillRequired')
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingConsignee) {
        await updateConsignee(editingConsignee.id, {
          contact: form.contact,
          taxCode: form.taxCode,
          address: form.address,
          certificate: form.certificate || undefined,
          qrCode: form.qrCode || undefined,
          organizationName: form.organizationName,
          representativeName: form.representativeName,
          user: {
            email: form.email,
            password: form.password || '',
            firstName: form.firstName,
            lastName: form.lastName
          }
        });
        toast({ title: t('toast.updateSuccess') });
      } else {
        await createConsignee({
          contact: form.contact,
          taxCode: form.taxCode,
          address: form.address,
          certificate: form.certificate || undefined,
          qrCode: form.qrCode || undefined,
          organizationName: form.organizationName,
          representativeName: form.representativeName,
          user: {
            email: form.email,
            password: form.password,
            firstName: form.firstName,
            lastName: form.lastName
          }
        });
        toast({ title: t('toast.createSuccess') });
      }

      resetForm();
      setEditingConsignee(null);
      setIsDialogOpen(false);
      await loadData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: editingConsignee
          ? t('toast.updateError')
          : t('toast.createError'),
        description:
          error instanceof Error ? error.message : t('toast.tryAgain')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('actions.confirmDelete'))) return;
    try {
      await deleteConsignee(id);
      toast({ title: t('toast.deleteSuccess') });
      await loadData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('toast.deleteError'),
        description:
          error instanceof Error ? error.message : t('toast.tryAgain')
      });
    }
  };

  const handleEdit = (consignee: Consignee) => {
    setForm({
      contact: consignee.contact ?? '',
      taxCode: consignee.taxCode ?? '',
      address: consignee.address ?? '',
      certificate: consignee.certificate ?? '',
      qrCode: consignee.qrCode ?? '',
      organizationName: consignee.organizationName ?? '',
      representativeName: consignee.representativeName ?? '',
      firstName: consignee.user?.firstName ?? '',
      lastName: consignee.user?.lastName ?? '',
      email: consignee.user?.email ?? '',
      password: ''
    });
    setEditingConsignee(consignee);
    setIsDialogOpen(true);
  };

  const tableData = useMemo(() => {
    const sorted = [...consignees].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt as string).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt as string).getTime() : 0;
      return bTime - aTime;
    });

    return sorted.map((consignee) => ({
      ...consignee,
      email: consignee.user?.email ?? '—',
      organizationLabel: consignee.organizationName ?? '—',
      createdAtDisplay: formatDateTime(consignee.createdAt)
    }));
  }, [consignees]);

  const filteredConsignees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tableData.filter((consignee) => {
      const matchesSearch =
        query.length === 0 ||
        consignee.organizationLabel.toLowerCase().includes(query) ||
        (consignee.representativeName ?? '').toLowerCase().includes(query) ||
        consignee.email.toLowerCase().includes(query) ||
        (consignee.contact ?? '').toLowerCase().includes(query) ||
        (consignee.taxCode ?? '').toLowerCase().includes(query);

      const matchesFilter =
        organizationFilter === 'ALL' ||
        consignee.organizationName === organizationFilter;

      return matchesSearch && matchesFilter;
    });
  }, [organizationFilter, searchQuery, tableData]);

  const organizationOptions = useMemo(() => {
    const unique = new Set(
      tableData
        .map((consignee) => consignee.organizationName)
        .filter(Boolean) as string[]
    );
    return Array.from(unique);
  }, [tableData]);

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      <div className='flex flex-1 flex-col gap-6 overflow-y-auto pb-10'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-2'>
            <h1 className='text-3xl font-bold tracking-tight'>
              {t('header.title')}
            </h1>
            <p className='text-muted-foreground'>{t('header.description')}</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button size='lg'>
                {editingConsignee
                  ? t('actions.editConsignee')
                  : t('actions.createConsignee')}
              </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[95vh] overflow-y-auto sm:max-w-3xl'>
              <DialogHeader>
                <DialogTitle>
                  {editingConsignee
                    ? t('dialog.editTitle')
                    : t('dialog.createTitle')}
                </DialogTitle>
                <DialogDescription>
                  {editingConsignee
                    ? t('dialog.editDescription')
                    : t('dialog.createDescription')}
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-4'>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label>{t('form.organizationName')}</Label>
                    <Input
                      value={form.organizationName}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          organizationName: e.target.value
                        }))
                      }
                      placeholder={t('placeholders.organizationName')}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>{t('form.representativeName')}</Label>
                    <Input
                      value={form.representativeName}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          representativeName: e.target.value
                        }))
                      }
                      placeholder={t('placeholders.representativeName')}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>{t('form.contact')}</Label>
                    <Input
                      value={form.contact}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          contact: e.target.value
                        }))
                      }
                      placeholder={t('placeholders.contact')}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>{t('form.taxCode')}</Label>
                    <Input
                      value={form.taxCode}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          taxCode: e.target.value
                        }))
                      }
                      placeholder={t('placeholders.taxCode')}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>{t('form.address')}</Label>
                    <Input
                      value={form.address}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          address: e.target.value
                        }))
                      }
                      placeholder={t('placeholders.address')}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>{t('form.certificate')}</Label>
                    <Input
                      value={form.certificate}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          certificate: e.target.value
                        }))
                      }
                      placeholder={t('placeholders.certificate')}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>{t('form.qrCode')}</Label>
                    <Input
                      value={form.qrCode}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, qrCode: e.target.value }))
                      }
                      placeholder={t('placeholders.qrCode')}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>{t('form.email')}</Label>
                    <Input
                      type='email'
                      value={form.email}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                      placeholder={t('placeholders.emailConsignee')}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>
                      {editingConsignee
                        ? t('form.passwordOptional')
                        : t('form.password')}
                    </Label>
                    <Input
                      type='password'
                      value={form.password}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          password: e.target.value
                        }))
                      }
                      placeholder={t('placeholders.password')}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>{t('form.firstName')}</Label>
                    <Input
                      value={form.firstName}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          firstName: e.target.value
                        }))
                      }
                      placeholder={t('placeholders.firstName')}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>{t('form.lastName')}</Label>
                    <Input
                      value={form.lastName}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          lastName: e.target.value
                        }))
                      }
                      placeholder={t('placeholders.lastName')}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className='mt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => handleDialogChange(false)}
                  disabled={isSubmitting}
                >
                  {t('actions.cancel')}
                </Button>
                <Button
                  type='button'
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? editingConsignee
                      ? t('actions.saving')
                      : t('actions.creating')
                    : editingConsignee
                      ? t('actions.saveChanges')
                      : t('actions.create')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <Card className='flex flex-1 flex-col'>
          <CardHeader className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div className='space-y-1'>
              <CardTitle>{t('table.title')}</CardTitle>
              <CardDescription>{t('table.description')}</CardDescription>
            </div>
            <Button variant='outline' onClick={loadData} disabled={isLoading}>
              {isLoading ? t('table.loading') : t('actions.refresh')}
            </Button>
          </CardHeader>

          <CardContent className='flex-1'>
            <div className='flex flex-col gap-2 md:flex-row md:items-center'>
              <Input
                placeholder={t('filters.searchPlaceholder')}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className='flex-1'
              />
              <Select
                value={organizationFilter}
                onValueChange={(value) =>
                  setOrganizationFilter(value as 'ALL' | string)
                }
              >
                <SelectTrigger className='md:w-[220px]'>
                  <SelectValue
                    placeholder={t('filters.organizationPlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>
                    {t('filters.allOrganizations')}
                  </SelectItem>
                  {organizationOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='mt-4 rounded-md border'>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('table.columns.index')}</TableHead>
                      <TableHead>{t('table.columns.organization')}</TableHead>
                      <TableHead>{t('table.columns.representative')}</TableHead>
                      <TableHead>{t('table.columns.contact')}</TableHead>
                      <TableHead>{t('table.columns.email')}</TableHead>
                      <TableHead className='text-right'>
                        {t('table.columns.actions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className='text-center'>
                          {t('table.loading')}
                        </TableCell>
                      </TableRow>
                    ) : filteredConsignees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className='text-center'>
                          {t('table.empty')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredConsignees.map((consignee, index) => (
                        <TableRow key={consignee.id}>
                          <TableCell className='font-medium'>
                            {index + 1}
                          </TableCell>
                          <TableCell className='max-w-[200px] break-words whitespace-normal'>
                            {consignee.organizationLabel}
                          </TableCell>
                          <TableCell className='max-w-[150px] break-words whitespace-normal'>
                            {consignee.representativeName || '—'}
                          </TableCell>
                          <TableCell className='max-w-[120px] break-words whitespace-normal'>
                            {consignee.contact || '—'}
                          </TableCell>
                          <TableCell className='max-w-[200px] break-words whitespace-normal'>
                            {consignee.email}
                          </TableCell>
                          <TableCell className='text-right'>
                            <div className='flex justify-end gap-2'>
                              <Button
                                variant='secondary'
                                size='sm'
                                onClick={() => handleEdit(consignee)}
                              >
                                {t('actions.edit')}
                              </Button>
                              <Button
                                variant='destructive'
                                size='sm'
                                onClick={() => handleDelete(consignee.id)}
                              >
                                {t('actions.delete')}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

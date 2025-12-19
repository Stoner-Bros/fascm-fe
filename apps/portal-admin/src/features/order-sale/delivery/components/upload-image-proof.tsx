import { FileUploader } from '@/components/file-uploader';
import { Modal } from '@/components/modal';
import { Button } from '@/components/ui/button';
import { Delivery } from '@/types/delivery';
import React from 'react';

interface UploadImageProofProps {
  deliveryForProof: Delivery | null;
  proofFiles: File[];
  onProofFilesChange: React.Dispatch<React.SetStateAction<File[]>>;
  onClose: () => void;
  onSubmit: () => void;
  submittingProof: boolean;
  uploadingProofPhaseId: string | null;
}

export function UploadImageProof({
  deliveryForProof,
  proofFiles,
  onProofFilesChange,
  onClose,
  onSubmit,
  submittingProof,
  uploadingProofPhaseId
}: UploadImageProofProps) {
  return (
    <Modal
      title='Tải minh chứng giao hàng'
      description='Vui lòng tải lên hình ảnh minh chứng trước khi chuyển trạng thái sang Đã giao.'
      isOpen={!!deliveryForProof}
      onClose={onClose}
      footer={
        <div className='flex w-full justify-end gap-2'>
          <Button variant='outline' size='sm' onClick={onClose}>
            Hủy
          </Button>
          <Button
            size='sm'
            onClick={onSubmit}
            disabled={
              submittingProof ||
              !!(
                deliveryForProof?.orderPhase?.id &&
                uploadingProofPhaseId === deliveryForProof.orderPhase.id
              )
            }
          >
            {submittingProof ? 'Đang tải...' : 'Xác nhận và cập nhật'}
          </Button>
        </div>
      }
    >
      <div className='space-y-3'>
        <FileUploader
          value={proofFiles}
          onValueChange={onProofFilesChange}
          accept={{ 'image/*': [] }}
          maxFiles={5}
          multiple
        />
        <p className='text-muted-foreground text-xs'>
          Chỉ chuyển trạng thái sang Đã giao khi đã tải hình ảnh minh chứng (tối
          đa 5 ảnh).
        </p>
      </div>
    </Modal>
  );
}

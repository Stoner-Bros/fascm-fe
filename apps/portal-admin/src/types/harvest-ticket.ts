export type HarvestTicket = {
  id: string;
  date?: string | Date | null;
  quantity?: number | null;
  unit?: string | null;
  totalPayment?: number | null;
  vatAmount?: number | null;
  totalAmount?: number | null;
  taxRate?: number | null;
  accountNumber?: string | null;
  paymentMethod?: string | null;
  ticketNumber?: string | null;
  ticketUrl?: string | null;
  harvestScheduleId?: {
    id: string;
  } | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type CreateHarvestTicketDto = {
  date?: string | Date | null;
  quantity?: number | null;
  unit?: string | null;
  totalPayment?: number | null;
  vatAmount?: number | null;
  totalAmount?: number | null;
  taxRate?: number | null;
  accountNumber?: string | null;
  paymentMethod?: string | null;
  ticketNumber?: string | null;
  ticketUrl?: string | null;
  harvestScheduleId: {
    id: string;
  };
};

export type UpdateHarvestTicketDto = Partial<CreateHarvestTicketDto>;

export type FindAllHarvestTicketsDto = {
  page?: number;
  limit?: number;
  harvestScheduleId?: string;
};

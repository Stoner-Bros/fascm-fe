import { useToast } from '@/components/ui/use-toast';
import { fetchAreas } from '@/services/area.service';
import {
  createImportTicket,
  deleteImportTicket,
  fetchImportTickets
} from '@/services/import-ticket.service';
import { fetchInboundBatches } from '@/services/inbound-batch.service';
import type { Area } from '@/types/area';
import type { CreateImportTicketDto } from '@/types/import-ticket';
import type { InboundBatch } from '@/types/inbound-batch';
import { useCallback, useEffect, useReducer, useState } from 'react';
import { parseAsInteger, useQueryState } from 'nuqs';
import type { Action, ImportTicketRow, State } from '../types/types';
import { mapImportTicketToRow } from '../types/types';

const initialState: State = {
  importTickets: [],
  loading: false,
  searchQuery: '',
  statusFilter: 'ALL',
  deleteDialogOpen: false,
  selectedTicketId: null,
  isCreateDialogOpen: false,
  isQualityCheckOpen: false,
  page: 1,
  hasMore: true
};

function importTicketsReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_IMPORT_TICKETS':
      return { ...state, importTickets: action.payload, loading: false };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_STATUS_FILTER':
      return { ...state, statusFilter: action.payload };
    case 'OPEN_DELETE_DIALOG':
      return {
        ...state,
        deleteDialogOpen: true,
        selectedTicketId: action.payload
      };
    case 'CLOSE_DELETE_DIALOG':
      return {
        ...state,
        deleteDialogOpen: false,
        selectedTicketId: null
      };
    case 'DELETE_TICKET':
      return {
        ...state,
        importTickets: state.importTickets.filter(
          (ticket) => ticket.id !== action.payload
        ),
        deleteDialogOpen: false,
        selectedTicketId: null
      };
    case 'OPEN_CREATE_DIALOG':
      return { ...state, isCreateDialogOpen: true };
    case 'CLOSE_CREATE_DIALOG':
      return { ...state, isCreateDialogOpen: false };
    case 'OPEN_QUALITY_CHECK':
      return { ...state, isQualityCheckOpen: true };
    case 'CLOSE_QUALITY_CHECK':
      return { ...state, isQualityCheckOpen: false };
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    case 'SET_HAS_MORE':
      return { ...state, hasMore: action.payload };
    case 'LOAD_ERROR':
      return { ...state, loading: false };
    default:
      return state;
  }
}

export const useImport = () => {
  const { toast } = useToast();
  const [state, dispatch] = useReducer(importTicketsReducer, initialState);
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit] = useQueryState('limit', parseAsInteger.withDefault(10));
  const [pageCount, setPageCount] = useState(1);

  const loadImportTickets = useCallback(
    async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const response = await fetchImportTickets({
          page: page ?? 1,
          limit: limit ?? 10
        });
        const rows: ImportTicketRow[] = response.data.map(mapImportTicketToRow);
        dispatch({ type: 'SET_IMPORT_TICKETS', payload: rows });
        dispatch({
          type: 'SET_HAS_MORE',
          payload: response.hasNextPage ?? false
        });
        setPageCount((prev) => {
          const minimalTotal = response.hasNextPage
            ? (page ?? 1) + 1
            : (page ?? 1);
          return Math.max(prev, minimalTotal);
        });
      } catch (error) {
        console.error('Failed to fetch import tickets:', error);
        dispatch({ type: 'LOAD_ERROR' });
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Không thể tải danh sách phiếu nhập kho'
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, limit]
  );

  const createITicket = useCallback(
    async (payload: CreateImportTicketDto) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        await createImportTicket(payload);
        toast({
          title: 'Thành công',
          description: 'Đã tạo phiếu nhập kho mới'
        });
        dispatch({ type: 'CLOSE_CREATE_DIALOG' });
        loadImportTickets();
      } catch (error: any) {
        console.error('Failed to create import ticket:', error);
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: error?.message || 'Không thể tạo phiếu nhập kho'
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadImportTickets]
  );

  const deleteITicket = useCallback(
    async (id: string) => {
      try {
        await deleteImportTicket(id);
        dispatch({ type: 'DELETE_TICKET', payload: id });
        toast({
          title: 'Thành công',
          description: 'Xóa phiếu nhập kho thành công'
        });
      } catch (error) {
        console.error('Failed to delete import ticket:', error);
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Không thể xóa phiếu nhập kho'
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    loadImportTickets();
  }, [loadImportTickets]);

  const setSearchQuery = useCallback(
    (query: string) => {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
      if (page !== 1) {
        void setPage(1);
      }
    },
    [page, setPage]
  );

  return {
    state,
    dispatch,
    loadImportTickets,
    createITicket,
    deleteITicket,
    page,
    setPage,
    limit,
    pageCount,
    setSearchQuery
  };
};

export function useInboundBatch() {
  const { toast } = useToast();
  const [inboundBatches, setInboundBatches] = useState<InboundBatch[]>([]);
  const [loading, setLoading] = useState(false);

  const loadIBatches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchInboundBatches({ page: 1, limit: 100 });
      setInboundBatches(response.data);
    } catch (error) {
      console.error('Failed to fetch inbound batches:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải danh sách lô hàng'
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadIBatches();
  }, [loadIBatches]);

  return { inboundBatches, loading, loadIBatches };
}

export function useArea() {
  const { toast } = useToast();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAreas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchAreas({ page: 1, limit: 100 });
      setAreas(response.data);
    } catch (error) {
      console.error('Failed to fetch areas:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải danh sách khu vực'
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadAreas();
  }, [loadAreas]);

  return { areas, loading, loadAreas };
}

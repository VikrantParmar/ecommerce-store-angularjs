import { HttpParams } from '@angular/common/http';
import { Params } from '@angular/router';

export interface TableQueryParams {
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  extraFilters?: { [key: string]: any };
}

// ✅ Used in services
export function buildHttpQueryParams(params: TableQueryParams): HttpParams {
  let httpParams = new HttpParams()
    .set('page', params.page?.toString() || '1')
    .set('limit', params.limit?.toString() || '10')
    .set('sortField', params.sortField || 'createdAt')
    .set('sortOrder', params.sortOrder || 'ASC');

  if (params.search?.trim()) {
    httpParams = httpParams.set('search', params.search.trim());
  }

  if (params.extraFilters) {
    Object.entries(params.extraFilters).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        httpParams = httpParams.set(key, value);
      }
    });
  }

  return httpParams;
}

// ✅ Used in routes
export function buildRouteQueryParams(params: TableQueryParams): Params {
  const queryParams: Params = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    sortField: params.sortField ?? 'createdAt',
    sortOrder: params.sortOrder ?? 'ASC'
  };

  if (params.search?.trim()) {
    queryParams['search'] = params.search.trim();
  }

  if (params.extraFilters) {
    Object.entries(params.extraFilters).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        queryParams[key] = value;
      }
    });
  }

  return queryParams;
}

// ✅ Used to extract from ActivatedRoute.queryParams
export function parseRouteQueryParams(params: Params): TableQueryParams {
  return {
    page: params['page'] ? +params['page'] : 1,
    limit: params['limit'] ? +params['limit'] : 10,
    sortField: params['sortField'] || 'createdAt',
    sortOrder: params['sortOrder'] || 'ASC',
    search: params['search'] || '',
    extraFilters: {}
  };
}

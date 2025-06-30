// src/app/utils/shop-utils.service.ts
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';

export interface ShopQueryParams {
  page?: number;
  sort?: string;
  categoryId?: number | null;
}

@Injectable({ providedIn: 'root' })
export class ShopUtilsService {
  // ✅ Parse from ActivatedRoute
  parseRouteParams(params: Params): ShopQueryParams {
    return {
      page: params['page'] ? +params['page'] : 1,
      sort: params['sort'] || 'default',
      categoryId: params['categoryId'] ? +params['categoryId'] : null
    };
  }

  // ✅ Build route params
  buildRouteParams(query: ShopQueryParams): Params {
    const result: Params = {
      page: query.page ?? 1,
      sort: query.sort ?? 'default'
    };

    if (query.categoryId !== null && query.categoryId !== undefined) {
      result['categoryId'] = query.categoryId;
    }

    return result;
  }

  // ✅ Get sort field/order from option
  getSortParams(sortOption: string): { sortField: string; sortOrder: 'ASC' | 'DESC' } {
    switch (sortOption) {
      case 'lowToHigh': return { sortField: 'price', sortOrder: 'ASC' };
      case 'highToLow': return { sortField: 'price', sortOrder: 'DESC' };
      default: return { sortField: 'createdAt', sortOrder: 'DESC' };
    }
  }
}

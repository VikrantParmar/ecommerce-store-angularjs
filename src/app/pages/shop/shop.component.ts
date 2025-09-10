import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../services/category.service';
import { ProductService } from '../../services/products.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../services/cart.service';
import { FormsModule } from '@angular/forms';
import { CategoryListComponent } from '../../components/shop/category-list/category-list.component';
import { SortBarComponent } from '../../components/shop/sort-bar/sort-bar.component';
import { ProductGridComponent } from '../../components/shop/product-grid/product-grid.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { ProductUtilsService } from '../../utils/product-utils.service';
import { ActivatedRoute, Router } from '@angular/router';
import { timer, forkJoin } from 'rxjs';

@Component({
  selector: 'app-shop',
  imports: [
    CommonModule,
    FormsModule,
    CategoryListComponent,
    SortBarComponent,
    ProductGridComponent,
    PaginationComponent
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css'
})
export class ShopComponent implements OnInit {
  categories: any[] = [];
  selectedCategoryId: number | null = null;

  products: any[] = [];
  loadingProducts = false;
  loadingCategories = false;
  currentPage = 1;
  totalProducts = 0;
  productsPerPage = 12;
  selectedSortOption = 'default';
  loadingAddToCart: { [productId: number]: boolean } = {};
  searchQuery: string = '';


  constructor(
    private categoryService: CategoryService,
    private productService: ProductService,
    private cartService: CartService,
    private toastr: ToastrService,
    public productUtils: ProductUtilsService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(async (params) => {
      this.currentPage = +params['page'] || 1;
      this.selectedSortOption = params['sort'] || 'default';
      this.productsPerPage = +params['limit'] || 12;
      const categoryName = params['category'] || null;
      this.searchQuery = params['search'] || '';

      await this.loadCategories();

      this.selectedCategoryId = this.getCategoryIdByName(categoryName);

      this.loadProductsByCategory(this.selectedCategoryId);
    });
  }

  getCategoryIdByName(categoryName: string | null): number | null {
    if (!categoryName) return null;
    const category = this.categories.find((c) => c.name === categoryName);
    return category ? category.id : null;
  }

  getImageUrl(filename: string): string {
    return this.productUtils.getImageUrl(filename);
  }

  loadCategories(): Promise<void> {
    this.loadingCategories = true;
    return new Promise((resolve) => {
      this.categoryService.getCategories({
        page: 1,
        limit: 100,
        sortField: 'name',
        sortOrder: 'ASC',
        search: '',
        onlyWithProducts: true
      }).subscribe({
        next: (res) => {
          this.categories = res.data?.data || [];
          this.loadingCategories = false;
          resolve();
        },
        error: () => {
          this.loadingCategories = false;
          resolve();
        }
      });
    });
  }

  onCategorySelected(event: { id: number | null; name: string | null }) {
    this.selectCategory(event.id, event.name || undefined);
  }

  selectCategory(categoryId: number | null, categoryName?: string) {
    this.currentPage = 1;
    this.selectedCategoryId = categoryId;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.currentPage,
        limit: this.productsPerPage,
        category: categoryName || null,
        sort: this.selectedSortOption
      },
      queryParamsHandling: 'merge'
    });
  }

  loadProductsByCategory(categoryId: number | null) {
    this.loadingProducts = true;

    const query: any = {
      page: this.currentPage,
      limit: this.productsPerPage,
      search: this.searchQuery || '',
      categoryId: categoryId
    };

    if (this.selectedSortOption === 'lowToHigh') {
      query.sortField = 'price';
      query.sortOrder = 'ASC';
    } else if (this.selectedSortOption === 'highToLow') {
      query.sortField = 'price';
      query.sortOrder = 'DESC';
    } else {
      query.sortField = 'createdAt';
      query.sortOrder = 'DESC';
    }

    this.productService.getAllProducts(query).subscribe({
      next: (res: any) => {
        this.products = res.data?.data || [];
        this.totalProducts = res.data?.total || 0;
      },
      error: () => { },
      complete: () => {
        this.loadingProducts = false;
      }
    });
  }


  onPageChange(page: number) {
    this.currentPage = page;
    this.updateQueryParams();
    window.scrollTo({ top: 150, behavior: 'smooth' });
  }

  onSortChange(sortOption: string) {
    this.selectedSortOption = sortOption;
    this.currentPage = 1;
    this.updateQueryParams();
  }

  updateQueryParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.currentPage,
        limit: this.productsPerPage,
        category: this.categories.find((c) => c.id === this.selectedCategoryId)?.name || null,
        sort: this.selectedSortOption,
        search: this.searchQuery || null
      },
      queryParamsHandling: 'merge'
    });
  }

  addToCart(product: any) {
    this.productUtils.addToCart(product, (loading: boolean) => {
      this.loadingAddToCart[product.id] = loading;
    });
  }

onSearchSubmit() {
  if (!this.searchQuery) return;

  let words = this.searchQuery.trim().split(/\s+/).slice(0, 3);
  this.searchQuery = words.join(" ");

  this.currentPage = 1;
  this.updateQueryParams();
}


}

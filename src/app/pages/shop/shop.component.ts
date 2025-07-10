import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../services/category.service';
import { ProductService } from '../../services/products.service';
import { CommonModule, } from '@angular/common';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CartService } from '../../services/cart.service';
import { FormsModule } from '@angular/forms';
import { CategoryListComponent } from '../../components/shop/category-list/category-list.component';
import { SortBarComponent } from '../../components/shop/sort-bar/sort-bar.component';
import { ProductGridComponent } from '../../components/shop/product-grid/product-grid.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { ProductUtilsService } from '../../utils/product-utils.service';
import { ActivatedRoute, Router } from '@angular/router';



@Component({
  selector: 'app-shop',
  imports: [CommonModule, FormsModule, CategoryListComponent, SortBarComponent, ProductGridComponent, PaginationComponent],
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
  Math = Math; //
  selectedSortOption = 'default';



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
    const savedPage = sessionStorage.getItem('shopCurrentPage');
    this.currentPage = savedPage ? parseInt(savedPage, 10) : 1;
    this.loadCategories();
  }


  getImageUrl(filename: string): string {
    return this.productUtils.getImageUrl(filename);
  }


  loadCategories() {
    this.loadingCategories = true;
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

        // Select "All" category by default
        this.selectCategory(null);
      },
      error: () => {
        this.loadingCategories = false;
      }
    });
  }


  selectCategory(categoryId: number | null) {
    const savedPage = sessionStorage.getItem('shopCurrentPage');
    if (!savedPage || this.selectedCategoryId !== categoryId) {
      this.currentPage = 1; // ✅ Only reset if selecting a new category
    }

    this.selectedCategoryId = categoryId;
    this.loadProductsByCategory(categoryId);
  }


  loadProductsByCategory(categoryId: number | null) {
    this.loadingProducts = true;

    const query: any = {
      page: this.currentPage,
      limit: this.productsPerPage,
      sortField: 'createdAt',
      sortOrder: 'ASC',
      search: '',
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


    this.productService.getAllProducts(query)
      .pipe()
      .subscribe({
        next: (res) => {
          this.products = res.data?.data || [];
          this.totalProducts = res.data?.total || 0;
          this.loadingProducts = false;
        },
        error: () => {
          this.loadingProducts = false;
        }
      });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    sessionStorage.setItem('shopCurrentPage', String(page)); // Store current page
    this.loadProductsByCategory(this.selectedCategoryId);
    window.scrollTo({ top: 150, behavior: 'smooth' });
  }



  addToCart(product: any) {
    this.productUtils.addToCart(product);
  }

  onSortChange(sortOption: string) {
    this.selectedSortOption = sortOption;
    // this.currentPage = 1;
    this.loadProductsByCategory(this.selectedCategoryId);
  }
}


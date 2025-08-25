import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/products.service';
import { CommonModule } from '@angular/common';
import { ProductUtilsService } from '../../utils/product-utils.service';
import { formatPrice } from '../../constants/currency.constant';
import { RouterLink } from '@angular/router';
import { ProductGridComponent } from '../../components/shop/product-grid/product-grid.component';
import { RatingDisplayComponent } from "../../components/product-ratings/rating-display/rating-display.component";
import { ProductRatingComponent } from "../../components/product-ratings/add-product-rating/product-ratings.component";


@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductGridComponent, RatingDisplayComponent, ProductRatingComponent],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  product: any;
  loading = true;
  format = formatPrice;
  quantity: number = 1;
  productId!: number;

  selectedAttributes: { [key: string]: string } = {};
  filteredVariants: any[] = [];
  selectedVariant: any = null;
  selectedImageUrl: string = '';
  lastSelectedColor: string = '';
  colorVariantMap: { [colorValue: string]: any } = {};
  isZoomActive: boolean = false; // Flag to show zoom effect


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    public productUtils: ProductUtilsService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadProduct(slug);
      }
    });
  }

  loadProduct(slug: string): void {
    this.loading = true;
    this.quantity = 1;

    this.productService.getProductBySlug(slug).subscribe({
      next: (res) => {
        this.product = res.data;
        this.productId = this.product.id;
        this.filteredVariants = res.data.variants || [];
        this.buildColorVariantMap();
        this.loading = false;

        this.product.attributes.sort((a: any, b: any) => {
          if (a.name.toLowerCase() === 'color') return -1;
          return 0;
        });

        // Select first in-stock variant or fallback to first variant
        let variantToSet = this.filteredVariants.find(v => v.stock > 0) || this.filteredVariants[0];
        this.selectedVariant = variantToSet;

        if (variantToSet) {
          this.selectedAttributes = {};
          for (const va of variantToSet.variantAttributes) {
            const attrName = va.attributeValue?.attribute?.name;
            const attrValue = va.attributeValue?.value;
            if (attrName && attrValue) {
              this.selectedAttributes[attrName] = attrValue;
            }
          }

          if (variantToSet.images?.length > 0) {
            this.selectedImageUrl = this.getVariantImageUrl(variantToSet.images[0].image_url);
          } else {
            this.selectedImageUrl = this.getImageUrl(this.product.image);
          }
        } else {
          this.selectedImageUrl = this.getImageUrl(this.product.img);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: () => {
        this.product = null;
        this.loading = false;
      }
    });
  }


  buildColorVariantMap(): void {
    this.colorVariantMap = {};

    for (const variant of this.filteredVariants) {
      const colorAttr = variant.variantAttributes?.find((va: any) =>
        va.attributeValue?.attribute?.name.toLowerCase() === 'color'
      );

      const colorValue = colorAttr?.attributeValue?.value;

      if (colorValue && variant.images?.length > 0 && !this.colorVariantMap[colorValue]) {
        this.colorVariantMap[colorValue] = variant;
      }
    }
  }

  setMainImage(imageUrl: string) {
    this.selectedImageUrl = imageUrl;
  }

  onSelectAttribute(attributeName: string, value: string) {
    if (this.selectedAttributes[attributeName] === value) return;
    this.selectedAttributes[attributeName] = value;

    this.updateSelectedVariant();

    // 🔁 Reset quantity if it exceeds the new stock
    const maxStock = this.selectedVariant ? this.selectedVariant.stock : this.product.stock;
    if (this.quantity > maxStock) {
      this.quantity = maxStock > 0 ? 1 : 0;
    }
  }


  updateSelectedVariant() {
    const matching = this.filteredVariants.find((variant: any) => {
      const attributes = variant?.variantAttributes;
      if (!Array.isArray(attributes)) return false;

      const values = attributes.map((va: any) => ({
        name: va.attributeValue?.attribute?.name,
        value: va.attributeValue?.value,
      }));

      return values.every(val =>
        this.selectedAttributes?.[val.name]?.toLowerCase() === val.value?.toLowerCase()
      );
    });

    if (matching) {
      const currentColor = this.selectedAttributes['Color'];
      const previousColor = this.lastSelectedColor;

      this.selectedVariant = matching;

      // Removed SKU navigation to URL here
      // No router.navigate to add SKU to URL

      let newImageUrl = '';

      if (matching.images?.length > 0) {
        newImageUrl = this.getVariantImageUrl(matching.images[0].image_url);
      } else {
        const fallbackVariant = this.filteredVariants.find((variant: any) => {
          if (!variant.images?.length) return false;

          return variant.variantAttributes.some((va: any) =>
            va.attributeValue?.attribute?.name.toLowerCase() === 'color' &&
            va.attributeValue?.value?.toLowerCase() === currentColor?.toLowerCase()
          );
        });

        if (fallbackVariant?.images?.length) {
          newImageUrl = this.getVariantImageUrl(fallbackVariant.images[0].image_url);
        } else {
          newImageUrl = this.getImageUrl(this.product.img);
        }
      }

      if (
        currentColor !== previousColor ||
        newImageUrl !== this.selectedImageUrl
      ) {
        this.lastSelectedColor = currentColor;
        this.selectedImageUrl = newImageUrl;
      }
    } else {
      this.selectedVariant = null;
    }
  }

  isValueAvailable(attributeName: string, value: string): boolean {
    if (!this.filteredVariants?.length) return false;

    return this.filteredVariants.some(variant => {
      const attributes = variant?.variantAttributes;
      if (!Array.isArray(attributes)) return false;

      const variantMap: Record<string, string> = {};
      attributes.forEach(attr => {
        const attrName = attr.attributeValue?.attribute?.name;
        const attrValue = attr.attributeValue?.value;
        if (attrName && attrValue) {
          variantMap[attrName] = attrValue;
        }
      });

      const candidateSelection = { ...this.selectedAttributes, [attributeName]: value };

      return Object.entries(candidateSelection).every(([key, val]) =>
        variantMap[key]?.toLowerCase() === val.toLowerCase()
      ) && variant.stock > 0;
    });
  }

  getAvailabilityLabel(attrName: string, val: string): string {
    const matchingVariants = this.filteredVariants.filter(variant => {
      const attrs = variant?.variantAttributes;
      if (!Array.isArray(attrs)) return false;

      return attrs.some(va =>
        va?.attributeValue?.attribute?.name === attrName &&
        va?.attributeValue?.value?.toLowerCase() === val.toLowerCase()
      );
    });

    const allOutOfStock = matchingVariants.length > 0 &&
      matchingVariants.every(v => v.stock <= 0);

    return allOutOfStock ? 'Currently unavailable' : '';
  }


  getImageUrl(filename: string): string {
    return this.productUtils.getImageUrl(filename);


  }


  getVariantImageUrl(filename: string): string {
    return this.productService.getVariantImageUrl(filename);
  }

  addToCart(product: any) {
    const payload = {
      id: product.id, // productId
      selectedVariant: this.selectedVariant || null,
      quantity: this.quantity,
      stock: this.selectedVariant?.stock ?? product.stock
    };

    this.productUtils.addToCart(payload);
  }


  increaseQty() {
    const maxStock = this.selectedVariant ? this.selectedVariant.stock : this.product.stock;
    if (this.quantity < maxStock) {
      this.quantity++;
    }
  }

  decreaseQty() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }



  onMouseEnter(event: MouseEvent): void {
    this.isZoomActive = true;
    this.moveZoom(event);
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isZoomActive) {
      this.moveZoom(event);
    }
  }

  onMouseLeave(): void {
    this.isZoomActive = false;
  }

  moveZoom(event: MouseEvent): void {
    const zoomContainer = document.querySelector('.zoom-overlay') as HTMLElement;
    const zoomedImage = document.querySelector('.zoomed-img') as HTMLImageElement;

    if (zoomContainer && zoomedImage) {
      const { left, top, width, height } = zoomContainer.getBoundingClientRect();
      const offsetX = event.clientX - left;
      const offsetY = event.clientY - top;

      const xPercent = (offsetX / width) * 100;
      const yPercent = (offsetY / height) * 100;

      zoomedImage.style.transform = `translate(-${xPercent}%, -${yPercent}%)`;
    }
  }
}

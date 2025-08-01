import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/products.service';
import { CommonModule } from '@angular/common';
import { ProductUtilsService } from '../../utils/product-utils.service';
import { formatPrice } from '../../constants/currency.constant';
import { RouterLink } from '@angular/router';
import { ProductGridComponent } from '../../components/shop/product-grid/product-grid.component';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductGridComponent],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  product: any;
  loading = true;
  format = formatPrice;
  quantity: number = 1;

  selectedAttributes: { [key: string]: string } = {};
  filteredVariants: any[] = [];
  selectedVariant: any = null;
  selectedImageUrl: string = '';
  lastSelectedColor: string = '';
  colorVariantMap: { [colorValue: string]: any } = {}; // NEW

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    public productUtils: ProductUtilsService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      const sku = params['sku'] ?? null;

      if (slug) {
        this.loadProduct(slug, sku);
      }
    });
  }

  loadProduct(slug: string, sku: string | null): void {
    this.loading = true;
    this.quantity = 1;

    this.productService.getProductBySlug(slug).subscribe({
      next: (res) => {
        this.product = res.data;
        this.filteredVariants = res.data.variants || [];
        this.buildColorVariantMap(); // NEW
        this.loading = false;

        this.product.attributes.sort((a: any, b: any) => {
          if (a.name.toLowerCase() === 'color') return -1;
          return 0;
        });

        let variantToSet = null;

        if (sku && sku !== 'null') {
          variantToSet = this.filteredVariants.find(v => v.sku === sku);
        }

        if (!variantToSet && this.filteredVariants.length > 0) {
          variantToSet = this.filteredVariants.find(v => v.stock > 0) || this.filteredVariants[0];

          if (variantToSet?.sku && sku !== variantToSet.sku) {
            this.router.navigate(['/product', slug, variantToSet.sku], { replaceUrl: true });
            return;
          }
        }

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

      const slug = this.product?.slug;
      const sku = matching.sku;
      if (slug && sku && this.route.snapshot.params['sku'] !== sku) {
        this.router.navigate(['/product', slug, sku], { replaceUrl: true });
      }

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
          newImageUrl = this.getImageUrl(this.product.image);
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
      ...product,
      quantity: this.quantity,
    };
    this.productUtils.addToCart(payload);
  }

  increaseQty() {
    if (this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decreaseQty() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
}     

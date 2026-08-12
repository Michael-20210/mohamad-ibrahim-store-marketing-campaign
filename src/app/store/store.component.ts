import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Product } from '../models/product';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './store.component.html',
  styleUrl: './store.component.css'
})
export class StoreComponent implements OnInit, OnDestroy {
  readonly storeName = 'Mohamad Ibrahim Store';
  readonly campaignName = 'Mohamad Ibrahim Store Mega Shopping Sale';

  products: Product[] = [];
  categories: string[] = ['All'];
  selectedCategory = 'All';
  searchTerm = '';
  loading = true;
  errorMessage = '';
  cart: Product[] = [];
  cartOpen = false;
  lastAddedProduct = '';

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly productService: ProductService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly title: Title,
    private readonly meta: Meta
  ) {}

  ngOnInit(): void {
    this.productService
      .getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: products => {
          this.products = products;
          this.categories = [
            'All',
            ...[...new Set(products.map(product => product.category))].sort((a, b) => a.localeCompare(b))
          ];
          this.loading = false;
          this.syncCategoryFromRoute();
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Products are temporarily unavailable. Please refresh the page.';
        }
      });

    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.syncCategoryFromRoute());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get cartCount(): number {
    return this.cart.length;
  }

  get cartSubtotal(): number {
    return this.cart.reduce((sum, product) => sum + product.price, 0);
  }

  get filteredProducts(): Product[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.products.filter(product => {
      const matchesCategory =
        this.selectedCategory === 'All' || product.category === this.selectedCategory;
      const searchableText = `${product.title} ${product.description} ${product.category}`.toLowerCase();
      const matchesSearch = term.length === 0 || searchableText.includes(term);
      return matchesCategory && matchesSearch;
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.updateSeo();
    void this.router.navigate(['/products', this.categorySlug(category)]);
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  reloadPage(): void {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  addToCart(product: Product): void {
    this.cart.push(product);
    this.lastAddedProduct = `${product.title} added to cart.`;
  }

  removeFromCart(index: number): void {
    this.cart.splice(index, 1);
  }

  toggleCart(): void {
    this.cartOpen = !this.cartOpen;
  }

  categoryCount(category: string): number {
    return category === 'All'
      ? this.products.length
      : this.products.filter(product => product.category === category).length;
  }

  displayCategory(category: string): string {
    if (category === 'All') {
      return 'All Products';
    }

    return category
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  trackByProductId(_index: number, product: Product): number {
    return product.id;
  }

  private syncCategoryFromRoute(): void {
    if (this.categories.length === 1) {
      return;
    }

    const routeCategory = (this.route.snapshot.paramMap.get('category') ?? 'all').toLowerCase();
    this.selectedCategory =
      this.categories.find(category => this.categorySlug(category) === routeCategory) ?? 'All';
    this.updateSeo();
  }

  private categorySlug(category: string): string {
    if (category === 'All') {
      return 'all';
    }

    return category
      .toLowerCase()
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private updateSeo(): void {
    const categoryLabel = this.displayCategory(this.selectedCategory);
    const pageTitle = `${categoryLabel} | ${this.storeName} Mega Shopping Sale`;
    const description = `Shop ${categoryLabel.toLowerCase()} at ${this.storeName}. Mega Shopping Sale: up to 60% off, free shipping on orders over $50, and products loaded from Fake Store API.`;

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'keywords', content: 'online shopping, electronics deals, fashion sale, jewelry deals, mega shopping sale, free shipping, ecommerce store' });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
  }
}

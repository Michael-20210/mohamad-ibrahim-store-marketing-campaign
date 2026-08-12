import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { Product } from '../models/product';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly apiUrl = 'https://fakestoreapi.com/products';

  private readonly products$ = this.http
    .get<Product[]>(this.apiUrl)
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  constructor(private readonly http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.products$;
  }

  getCategories(): Observable<string[]> {
    return this.products$.pipe(
      map(products =>
        [...new Set(products.map(product => product.category))].sort((a, b) => a.localeCompare(b))
      )
    );
  }
}

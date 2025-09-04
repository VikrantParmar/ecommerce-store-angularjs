import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css'
})
export class CategoryListComponent {
  @Input() categories: any[] = [];
  @Input() selectedCategoryId: number | null = null;
  @Input() loading = false;

  // id + name emit karenge
  @Output() categorySelected = new EventEmitter<{ id: number | null; name: string | null }>();

  selectCategory(id: number | null, name: string | null = null) {
    this.categorySelected.emit({ id, name });
  }

}

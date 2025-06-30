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

  @Output() categorySelected = new EventEmitter<number | null>();

  selectCategory(id: number | null) {
    this.categorySelected.emit(id);
  }
}

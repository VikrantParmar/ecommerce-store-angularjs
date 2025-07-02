import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';


@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {


  @Input() total: number = 0;
  @Input() page: number = 1;
  @Input() perPage: number = 10;
  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.total / this.perPage);
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageChange.emit(newPage);
    }
  }
  get paginationRange(): number[] {
  const total = this.totalPages;
  const current = this.page;
  const range: number[] = [];

  // Always include first and last
  const showAll = total <= 7;
  if (showAll) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  range.push(1);

  if (current <= 4) {
    for (let i = 2; i <= 5; i++) range.push(i);
    range.push(-1); // ...
  } else if (current >= total - 3) {
    range.push(-1); // ...
    for (let i = total - 4; i < total; i++) range.push(i);
  } else {
    range.push(-1); // ...
    range.push(current - 1, current, current + 1);
    range.push(-2); // ...
  }

  range.push(total);

  return range;
}







}

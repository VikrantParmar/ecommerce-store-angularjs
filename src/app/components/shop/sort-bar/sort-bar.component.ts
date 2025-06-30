import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sort-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sort-bar.component.html',
  styleUrl: './sort-bar.component.css'
})
export class SortBarComponent {
  @Input() selectedSortOption = 'default';
  @Output() sortChange = new EventEmitter<string>();

  onSortChange() {
    this.sortChange.emit(this.selectedSortOption);
  }
}

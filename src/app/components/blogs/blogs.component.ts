import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-blogs',
  imports: [CommonModule],
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.css'
})
export class BlogsComponent {
  constructor(private blogService: BlogService) { }

  @Input() blogs: any[] = [];
  @Input() loading = false;


  getImageUrl(filename: string): string {
    return this.blogService.getImageUrl(filename);
  }

}

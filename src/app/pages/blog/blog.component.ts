import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BlogsComponent } from '../../components/blogs/blogs.component';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css'],
  standalone: true,
  imports: [FormsModule,CommonModule, BlogsComponent],
})
export class BlogComponent implements OnInit {
  blogs: any[] = [];
  loading = false;


  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.loadBlogs();
  }

  loadBlogs(): void {
  this.loading = true;
  this.blogService.getAllBlogs({
    page: 1,
    limit: 12,
    sortField: 'id',
    sortOrder: 'ASC',
  }).subscribe((res) => {
    this.blogs = res.data?.data || [];
    this.loading = false;
  });
}



}

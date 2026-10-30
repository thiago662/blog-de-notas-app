import { Component, ViewEncapsulation } from '@angular/core';
import { ViewService } from './view.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ViewComponent {
  id: any;
  post: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private viewService: ViewService,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.getPost(this.id);
  }

  getPost(id: any) {
    this.viewService.getPost(id)
      .then((data: any) => {
        this.post = data;
      })
      .catch((error: any) => {
        console.log(error);
      })
      .finally(() => {});
  }

  showDate(date: any) {
    return new Date(date).toLocaleString();
  }

  splitTopic(topics: any) {
    return topics.split(',');
  }

  getSafeHtml(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}

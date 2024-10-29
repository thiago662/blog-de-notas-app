import { Component } from '@angular/core';
import { ViewService } from './view.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss'
})
export class ViewComponent {
  id: any;
  post: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private viewService: ViewService,
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
}

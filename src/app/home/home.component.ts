import { Component } from '@angular/core';
import { HomeService } from './home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  posts: any;

  constructor(
    private homeService: HomeService,
  ) { }

  ngOnInit(): void {
    this.getPost();
  }

  getPost() {
    this.homeService.getPosts()
      .then((data: any) => {
        var resultArray = Object.keys(data).map(function(personNamedIndex){
          let person = data[personNamedIndex];
          person.id = personNamedIndex;

          return person;
        });

        this.posts = resultArray;
      })
      .catch((error: any) => {
        console.log(error);
      })
      .finally(() => {
      });
  }
}

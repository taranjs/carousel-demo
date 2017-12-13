import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';


interface PhotosResponse {
  albumId: number;
  id: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'the demo app by Taranjeet Singh';
  imageTitle = '';
  showSpinner = true;

  imageCache = {}
  imageId = 1;

  leftData = null;
  currentData = null;
  rightData = null;

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    // TODO (taranjeet): add css transition
    document.getElementsByTagName('body')[0]
      .addEventListener('keydown', (event) => {
        console.log(event);
        if (event.code == 'ArrowLeft') {
          this.handleNav('left');
        } else {
          this.handleNav('right');
        }

      });
    document.getElementsByClassName('nav-left')[0]
      .addEventListener('click', () => {
        this.handleNav('left');
      });
    document.getElementsByClassName('nav-right')[0]
      .addEventListener('click', () => {
        this.handleNav('right');
      });
    this.handleNav('centre');
  }


  displayImage(elementClass: string, imageData: PhotosResponse, updateTitle: boolean): void {
    const imageEl = document.getElementsByClassName(elementClass)[0];
    imageEl.setAttribute(
      'src',
      elementClass == 'centre-image' ? imageData.url : imageData.thumbnailUrl);
    if (updateTitle) {
      this.imageTitle = `${imageData.id} - ${imageData.title}`;
    }

  }

  fetchImage(imageId: number, position: string): void {
    if (imageId < 1) {
      return;
    }
    this.showSpinner = true;
    this.http
      .get<PhotosResponse>(`https://jsonplaceholder.typicode.com/photos/${imageId}`)
      .subscribe(
      data => {
        this.imageCache[imageId] = data;

        if (position == 'centre') {
          this.currentData = data;
          this.displayImage('centre-image', data, true /* updateTitle */);
        }
        if (position == 'left') {
          this.displayImage('left-image', data, false /* updateTitle */);
        }
        if (position == 'right') {
          this.displayImage('right-image', data, false /* updateTitle */);
        }
        this.showSpinner = false;
      },
      (error: HttpErrorResponse) => {
        console.log(error);
        this.imageTitle = `Error while fetching photos: ${error.message}`;
      }
      );
  }

  handleNav(direction: string): void {
    if (direction != 'centre') {
      const navEl = document.getElementsByClassName(`nav-${direction}`)[0];
      navEl.classList.toggle('fade');
      window.setTimeout(() => {
        navEl.classList.toggle('fade');
      }, 300);
    }
    this.imageTitle = '';
    if (this.imageId >= 1) {

      if (direction == 'right') {
        this.imageId++;
        this.leftData = this.currentData;
        if (this.leftData) {
          this.displayImage('left-image', this.leftData, false /* updateTitle */);
        }
        this.rightData = this.imageCache[this.imageId + 1];
        if (this.rightData) {
          this.displayImage('right-image', this.rightData, false /* updateTitle */);
        } else {
          this.fetchImage(this.imageId + 1, direction);
        }
      }

      if (direction == 'left' && this.imageId > 1) {
        this.imageId--;
        this.rightData = this.currentData;
        if (this.rightData) {
          this.displayImage('right-image', this.rightData, false /* updateTitle */);
        }
        this.leftData = this.imageCache[this.imageId - 1];
        if (this.leftData) {
          this.displayImage('left-image', this.leftData, false /* updateTitle */);
        } else {
          this.fetchImage(this.imageId - 1, direction);
        }
      }

      const cacheData = this.imageCache[this.imageId];
      if (cacheData) {
        this.currentData = cacheData;
        this.displayImage('centre-image', cacheData, true /* updateTitle */);
      } else {
        this.fetchImage(this.imageId, 'centre');
      }
    }
  }
}

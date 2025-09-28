import { Component } from '@angular/core';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.html',
  styleUrls: ['./gallery.css']
})
export class Gallery {
  images: string[] = [
    'imgs/roundy-constructor.png',
    'imgs/roundy-pizza.png',
    'imgs/Roundy_worlds.png',
    'imgs/roundy-student-circuit.png',
    'imgs/roundy-student.png'
  ];

  selectedImage: string = '';

  showImage(img: string) {
    this.selectedImage = img;
  }

  closeImage() {
    this.selectedImage = '';
  }
}
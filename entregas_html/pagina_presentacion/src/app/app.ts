import { Component } from '@angular/core';
import { Header } from './header/header';
import { Menu } from './menu/menu';
import { GameInfo } from './game-info/game-info';
import { Gallery } from './gallery/gallery';
import { Footer } from './footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Header, Menu, GameInfo, Gallery, Footer],
  templateUrl: './app.html',
  styleUrls: ['./app.css']  
})
export class AppComponent {}

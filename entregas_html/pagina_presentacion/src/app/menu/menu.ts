import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-menu',
  standalone: true,
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class Menu implements AfterViewInit {

  ngAfterViewInit(): void {
    const menuButtons = document.querySelectorAll('.menu-buttons .btn-minecraft');
    const contentSections = document.querySelectorAll('.content-section');

    if (contentSections.length > 0) {
      contentSections[0].classList.add('active');
      menuButtons[0].classList.add('active');
    }

    menuButtons.forEach(button => {
  button.addEventListener('click', (event) => {
    const targetId = (event.target as HTMLElement).getAttribute('data-target');

    menuButtons.forEach(btn => btn.classList.remove('active'));
    contentSections.forEach(section => {
      section.classList.remove('active');
      (section as HTMLElement).style.display = 'none';
    });

    (event.target as HTMLElement).classList.add('active');
    const targetSection = document.getElementById(targetId!);
    if (targetSection) {
      targetSection.style.display = 'block';
      targetSection.classList.add('active');
      targetSection.style.animation = 'none';
      setTimeout(() => {
        targetSection.style.animation = 'fadeInUp 0.5s ease-out';
      }, 10);
    }
  });
});

  }
}

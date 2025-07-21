import { Injectable } from '@angular/core';
import { Application } from './application.model';

@Injectable({
  providedIn: 'root'
})
export class ApplicationStorageService {
  private readonly storageKey = 'applications';

  getAll(): Application[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  add(application: Application): void {
    const applications = this.getAll();
    applications.push(application);
    this.saveAll(applications);
  }

  update(updatedApp: Application): void {
    const applications = this.getAll();
    const index = applications.findIndex(app => 
      app.Application.ApplicationNumber === updatedApp.Application.ApplicationNumber
    );
    
    if (index !== -1) {
      applications[index] = updatedApp;
      this.saveAll(applications);
    }
  }

  delete(applicationNumber: string): void {
    let applications = this.getAll();
    applications = applications.filter(app => 
      app.Application.ApplicationNumber !== applicationNumber
    );
    this.saveAll(applications);
  }

  exportJson(): string {
    return JSON.stringify(this.getAll(), null, 2);
  }

  private saveAll(applications: Application[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(applications));
  }
}
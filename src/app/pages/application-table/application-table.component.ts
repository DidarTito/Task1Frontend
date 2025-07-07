import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';

import { FormsModule } from '@angular/forms';

import { NzButtonSize } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioModule } from 'ng-zorro-antd/radio';

import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import { error } from 'console';

import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { Injectable, Input } from '@angular/core';

import { NgIf, NgFor, AsyncPipe } from '@angular/common';

import { NzDrawerModule } from 'ng-zorro-antd/drawer';


import { NzPaginationModule } from 'ng-zorro-antd/pagination';


interface Application {
  Application: {
    SentToOfficialsDateTime: string;
    ApplicationNumber: string;
    MeasureId: string;
    ApplicationYear: number;
    InitialApplicationAmount: {
      Amount: number;
      CurrencyType: string;
    } | null;
    ApplicationStatus: string,

    Applicant: {
      ApplicantNameRu: string;
      ApplicantNameKz: string;
      ApplicantXin: string;
      ApplicantType: string;
      ApplicantCorporateInfo: {
        FirstPersonIin: string;
        FirstPersonFio: string;
      };
      ApplicantIndividualInfo: {
        DocumentType: string;
        DocumentNumber: string;
      };
      ApplicantEntrepreneurInfo: {
        Iin: string;
        Fio: string;
      };
    };

    ApplicationOfficialOrgInfo: {
      Bin: string;
      NameRu: string;
      NameKz: string;
    };
    ApplicationOperatorOrgInfo: {
      Bin: string;
      NameRu: string;
      NameKz: string;
    };
    ApplicationAddress: {
      OblArId: string;
      RegionArId: string;
    };
    Payments: {
      PaymentDate: string;
      PaymentAmount: number;
      PaymentCurrencyType: string;
      BudgetProgram:
      {
        BudgetType: string;
        BudgetProgramCode: string;
        BudgetSubProgramCode: string;
        Specific: string;
      };
    }[];

    ApplicationCancelled: {
      CancelDateTime: string;
      Note: string;
      DecisionMakerIin: string;
    };
    ApplicationAccepted: {
      AcceptDateTime: string;
      DecisionMakerIin: string;
    };
    ApplicationRejected: {
      RejectDateTime: string;
      RejectReasonType: string;
      DecisionMakerIin: string;
    };
    ApplicationPaid: {
      FullPaidDateTime: string;
      FullPaidAmountInTg: number;
    };
    ApplicationUrl: {
      Url: string;
    };

    toggle: number;

  }
}

@Component({
  selector: 'app-application-table',
  standalone: true,
  imports: [CommonModule, NzTableModule, NzButtonModule,
    FormsModule, NzButtonModule, NzIconModule, NzRadioModule, NzCollapseModule, NzModalModule, NgIf, NgFor,
    NzDrawerModule, NzPaginationModule

  ],
  templateUrl: './application-table.component.html',
  styleUrl: './application-table.component.css'
})
export class ApplicationTableComponent implements OnInit {
  // Pagination properties
  pageIndex = 1;
  pageSize = 10;
  totalApplications = 0;

  // Sorting properties
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Filtering property
  searchTerm: string = '';

  // Component state

  filteredApplications: Application[] = [];
  sortedApplications: Application[] = [];
  displayApplications: Application[] = [];


  ///

  // Pagination methods
  onPageChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
    this.updateDisplayApplications();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 1;
    this.updateDisplayApplications();
  }

  // Sorting methods
  sort(column: string): void {
    if (this.sortColumn === column) {
      // Toggle direction if same column
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // New column, default to ascending
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.applySorting();
    this.updateDisplayApplications();
  }

  private applySorting(): void {
    if (!this.sortColumn) {
      this.sortedApplications = [...this.filteredApplications];
      return;
    }

    this.sortedApplications = [...this.filteredApplications].sort((a, b) => {
      const valA = this.getSortValue(a, this.sortColumn);
      const valB = this.getSortValue(b, this.sortColumn);

      // Handle null/undefined values
      if (valA == null) return 1;
      if (valB == null) return -1;

      // Numeric comparison
      if (typeof valA === 'number' && typeof valB === 'number') {
        return this.sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      // Date comparison
      if (valA instanceof Date && valB instanceof Date) {
        return this.sortDirection === 'asc'
          ? valA.getTime() - valB.getTime()
          : valB.getTime() - valA.getTime();
      }

      // String comparison
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return this.sortDirection === 'asc'
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }

  private getSortValue(app: Application, column: string): any {
    switch (column) {
      case 'SentToOfficialsDateTime':
        return app.Application.SentToOfficialsDateTime ?
          new Date(app.Application.SentToOfficialsDateTime) : null;
      case 'ApplicationNumber':
        return app.Application.ApplicationNumber;
      case 'MeasureId':
        return app.Application.MeasureId;
      case 'ApplicationYear':
        return app.Application.ApplicationYear;
      case 'Amount':
        return app.Application.InitialApplicationAmount?.Amount;
      case 'Currency':
        return app.Application.InitialApplicationAmount?.CurrencyType;
      case 'ApplicationStatus':
        return app.Application.ApplicationStatus;
      default:
        return null;
    }
  }

  // Filtering methods
  applyFilter(): void {
    if (!this.searchTerm) {
      this.filteredApplications = [...this.applications];
    } else {
      const searchTermLower = this.searchTerm.toLowerCase();
      this.filteredApplications = this.applications.filter(app => {
        return Object.values(app.Application).some(val => {
          if (typeof val === 'string') {
            return val.toLowerCase().includes(searchTermLower);
          } else if (typeof val === 'number') {
            return val.toString().includes(searchTermLower);
          } else if (val && typeof val === 'object') {
            return Object.values(val).some(subVal =>
              subVal && subVal.toString().toLowerCase().includes(searchTermLower)
            );
          }
          return false;
        });
      });
    }

    this.totalApplications = this.filteredApplications.length;
    this.pageIndex = 1;
    this.applySorting(); // Apply sorting after filtering
    this.updateDisplayApplications();
  }

  // Helper to update displayed applications
  private updateDisplayApplications(): void {
    const startIndex = (this.pageIndex - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayApplications = this.sortedApplications.slice(startIndex, endIndex);
  }
  ///

  onDelete(app: Application): void {
    this.modal.confirm({
      nzTitle: '',
      nzContent: '',
      nzOkText: 'Yes',
      nzOkDanger: true,
      nzOnOk: () => {
        this.applications = this.applications.filter(a => a.Application.ApplicationNumber !== app.Application.ApplicationNumber);
      },
      nzCancelText: 'No'
    });
  }

  onEdit(app: Application): void {
    console.log('Edit application', app);
  }
  applications: Application[] = [];
  size: NzButtonSize = 'large';

  constructor(private http: HttpClient, private modal: NzModalService) { }

  ngOnInit(): void {
    this.http.get<Application[]>('assets/applications.json').subscribe({
      next: (data) => {
        this.applications = data;
        this.filteredApplications = [...this.applications];
        this.sortedApplications = [...this.applications];
        this.totalApplications = this.applications.length;
        this.updateDisplayApplications();
      },
      error: (err) => console.error('Failed to load applications', err)
    });
  }


  expandedSet = new Set<number>();

  toggleExpand(index: number): void {
    if (this.expandedSet.has(index)) {
      this.expandedSet.delete(index);
    } else {
      this.expandedSet.add(index);
    }
  }
  // 

  @Input() collapsed = false;

  animating = false;


  toggle(event: any) {
    if (this.animating) {
      return;
    }
    this.animating = true;

    if (this.collapsed) {
      this.collapsed = false;
    }
    else {
      this.collapsed = true;
    }

    event.preventDefault();
  }

  onToggleDone() {
    this.animating = false;
  }

  isDrawerVisible = false;

  isDrawerVisible2 = false;

  selectedApplication: any;
  openDrawer(app: Application): void {

    this.selectedApplication = app;
    this.isDrawerVisible = true;
  }
  openDrawer2(app: Application): void {
    this.selectedApplication = app;
    this.isDrawerVisible2 = true;
  }


  closeDrawer(): void {
    this.isDrawerVisible = false;
    this.isDrawerVisible2 = false;

    this.selectedApplication = null;
  }
  saveChanges(): void {
    console.log('Save clicked for:', this.selectedApplication);
  }
  confirmDelete(): void {
    if (!this.selectedApplication) return;

    this.modal.confirm({
      nzTitle: 'Delete Application',
      nzContent: `Are you sure you want to delete application ${this.selectedApplication.Application.ApplicationNumber}?`,
      nzOkText: 'Yes',
      nzOkDanger: true,
      nzOnOk: () => {
        this.applications = this.applications.filter(
          a => a.Application.ApplicationNumber !== this.selectedApplication!.Application.ApplicationNumber
        );
        this.applyFilter(); // Reapply filter after deletion
        this.closeDrawer();
      },
      nzCancelText: 'No'
    });
  }

}

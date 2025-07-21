import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';

import { FormsModule } from '@angular/forms';

import { NzButtonSize } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioModule } from 'ng-zorro-antd/radio';

import { provideHttpClient, withFetch } from '@angular/common/http';
import { error } from 'console';

import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { Injectable, Input } from '@angular/core';

import { NgIf, NgFor, AsyncPipe } from '@angular/common';

import { NzDrawerModule } from 'ng-zorro-antd/drawer';



import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzNotificationService } from 'ng-zorro-antd/notification';

import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { HttpClient } from '@angular/common/http';



interface Application {
  Application: {
    SentToOfficialsDateTime: string;
    ApplicationNumber: string;
    MeasureId: string;
    ApplicationYear: number;
    InitialApplicationAmount?: {
      Amount: number;
      CurrencyType: string;
    } | null;
    ApplicationStatus: string,

    Applicant: {
      ApplicantNameRu: string;
      ApplicantNameKz: string;
      ApplicantXin: string;
      ApplicantType: string;
      ApplicantCorporateInfo?: {
        FirstPersonIin: string;
        FirstPersonFio: string;
      };
      ApplicantIndividualInfo?: {
        DocumentType: string;
        DocumentNumber: string;
      };
      ApplicantEntrepreneurInfo?: {
        Iin: string;
        Fio: string;
      };
    };

    ApplicationOfficialOrgInfo: {
      Bin: string;
      NameRu: string;
      NameKz: string;
    };
    ApplicationOperatorInfo: {
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

    toggle?: number;

  }
}

@Injectable({ providedIn: 'root' })
export class ApplicationStorageService {
  private readonly storageKey = 'applications';
  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }
  
  setAll(apps: Application[]): void {
    localStorage.setItem('applications', JSON.stringify(apps));
  }
  getAll(): Application[] {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const data = localStorage.getItem(this.storageKey);
        if (!data) return [];

        let apps = JSON.parse(data);

        // Migrate old structure to new format
        if (apps.length > 0 && !apps[0].Application) {
          apps = apps.map((appData: any) => ({ Application: appData }));
          this.saveAll(apps);
        }

        return apps;
      } catch (e) {
        console.error('Error parsing localStorage data', e);
        return [];
      }
    }
    return [];
  }
  add(application: Application): void {
    if (isPlatformBrowser(this.platformId)) {
      const applications = this.getAll();
      applications.push(application);
      this.saveAll(applications);
    }
  }

  update(updatedApp: Application): void {
    if (isPlatformBrowser(this.platformId)) {
      const applications = this.getAll();
      const index = applications.findIndex(app =>
        app.Application.ApplicationNumber === updatedApp.Application.ApplicationNumber
      );

      if (index !== -1) {
        applications[index] = updatedApp;
        this.saveAll(applications);
      }
    }
  }

  delete(applicationNumber: string): void {
    if (isPlatformBrowser(this.platformId)) {
      let applications = this.getAll();
      applications = applications.filter(app =>
        app.Application.ApplicationNumber !== applicationNumber
      );
      this.saveAll(applications);
    }
  }

  private saveAll(applications: Application[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, JSON.stringify(applications));
    }
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
  styleUrl: './application-table.component.css',
  host: { 'ngSkipHydration': ' ' } // ✅ Применяем корректно
})
export class ApplicationTableComponent implements OnInit {

  // Pagination properties
  pageIndex = 1;
  pageSize = 10;
  totalApplications = 0;

  // Sorting properties
  sortColumn: string = ' ';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Filtering property
  searchTerm: string = ' ';

  // Component state

  filteredApplications: Application[] = [];
  sortedApplications: Application[] = [];
  displayApplications: Application[] = [];

  // displayApplications!: Application[];

  // displayApplications: any[] = [];


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
        return app.Application?.InitialApplicationAmount?.Amount;
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

  private updateDisplayApplications(): void {
    const startIndex = (this.pageIndex - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayApplications = this.sortedApplications.slice(startIndex, endIndex);

    console.log('Paginating from', startIndex, 'to', endIndex);
    console.log('Display applications:', this.displayApplications.length);

    this.cdr.detectChanges();
  }


  // Добавление новой заявки
  openAddDialog(applicantType: 'Individual' | 'Corporate' | 'Entrepreneur' = 'Individual'): void {
    const newApp = this.createEmptyApplication(applicantType);
    const nextNumber = this.generateApplicationNumber();
    newApp.Application.ApplicationNumber = nextNumber;
    this.isAddingNew = true;
    this.selectedApplication = newApp;
    this.isDrawerVisible = true;
  }


  private generateApplicationNumber(): string {
    const currentYear = new Date().getFullYear();
    const existingCount = this.applications.filter(
      app => app.Application.ApplicationYear === currentYear
    ).length;

    const nextIndex = existingCount + 1;
    return `${currentYear}-${nextIndex.toString().padStart(4, '0')}`; // e.g., "2025-0001"
  }

  onApplicantTypeChange(type: 'Individual' | 'Corporate' | 'Entrepreneur'): void {
    const app = this.selectedApplication?.Application;
    if (!app?.Applicant) return;

    // Clear irrelevant info blocks
    delete app.Applicant.ApplicantCorporateInfo;
    delete app.Applicant.ApplicantIndividualInfo;
    delete app.Applicant.ApplicantEntrepreneurInfo;


    // Add selected one
    if (type === 'Individual') {
      app.Applicant.ApplicantIndividualInfo = { DocumentType: ' ', DocumentNumber: ' ' };
    } else if (type === 'Corporate') {
      app.Applicant.ApplicantCorporateInfo = { FirstPersonIin: ' ', FirstPersonFio: ' ' };
    } else if (type === 'Entrepreneur') {
      app.Applicant.ApplicantEntrepreneurInfo = { Iin: ' ', Fio: ' ' };
    }
  }

  applicationStatus: 'Accepted' | 'Rejected' | 'Cancelled' = 'Accepted';

  onStatusChange(status: string) {
    const app = this.selectedApplication?.Application;

    // Clear other statuses
    app.ApplicationAccepted = undefined;
    app.ApplicationRejected = undefined;
    app.ApplicationCancelled = undefined;

    if (status === 'Accepted') {
      app.ApplicationAccepted = {
        AcceptDateTime: ' ',
        DecisionMakerIin: ' '
      };
    } else if (status === 'Rejected') {
      app.ApplicationRejected = {
        RejectDateTime: ' ',
        RejectReasonType: ' ',
        DecisionMakerIin: ' '
      };
    } else if (status === 'Cancelled') {
      app.ApplicationCancelled = {
        CancelDateTime: ' ',
        Note: ' ',
        DecisionMakerIin: ' '
      };
    }
  }



  private createEmptyApplication(applicantType: 'Individual' | 'Corporate' | 'Entrepreneur'): Application {
    const applicantBase: any = {
      ApplicantNameRu: ' ',
      ApplicantNameKz: ' ',
      ApplicantXin: ' ',
      ApplicantType: applicantType
    };

    if (applicantType === 'Individual') {
      applicantBase.ApplicantIndividualInfo = {
        DocumentType: ' ',
        DocumentNumber: ' '
      };
    } else if (applicantType === 'Corporate') {
      applicantBase.ApplicantCorporateInfo = {
        FirstPersonIin: ' ',
        FirstPersonFio: ' '
      };
    } else if (applicantType === 'Entrepreneur') {
      applicantBase.ApplicantEntrepreneurInfo = {
        Iin: ' ',
        Fio: ' '
      };
    }

    return {
      Application: {
        ApplicationNumber: ' ',
        ApplicationStatus: 'Draft',
        SentToOfficialsDateTime: new Date().toISOString(),
        ApplicationYear: new Date().getFullYear(),
        MeasureId: ' ',
        InitialApplicationAmount: {
          Amount: 0,
          CurrencyType: ' '
        },
        Applicant: applicantBase,
        ApplicationOfficialOrgInfo: {
          Bin: ' ',
          NameRu: ' ',
          NameKz: ' '
        },
        ApplicationOperatorInfo: {
          Bin: ' ',
          NameRu: ' ',
          NameKz: ' '
        },
        ApplicationAddress: {
          OblArId: ' ',
          RegionArId: ' '
        },
        Payments: [{
          PaymentDate: ' ',
          PaymentAmount: 0,
          PaymentCurrencyType: ' ',
          BudgetProgram: {
            BudgetType: ' ',
            BudgetProgramCode: ' ',
            BudgetSubProgramCode: ' ',
            Specific: ' '
          }
        }],
        ApplicationCancelled: {
          CancelDateTime: ' ',
          Note: ' ',
          DecisionMakerIin: ' '
        },
        ApplicationAccepted: {
          AcceptDateTime: ' ',
          DecisionMakerIin: ' '
        },
        ApplicationRejected: {
          RejectDateTime: ' ',
          RejectReasonType: ' ',
          DecisionMakerIin: ' '
        },
        ApplicationPaid: {
          FullPaidDateTime: ' ',
          FullPaidAmountInTg: 0
        },
        ApplicationUrl: {
          Url: ' '
        },
        toggle: 0
      }
    };
  }

  onDelete(app: Application): void {
    const appNumber = app.Application.ApplicationNumber;
    this.modal.confirm({
      nzTitle: 'Удалить заявку',
      nzContent: `Вы уверены, что хотите удалить заявку ${appNumber}?`,
      nzOkText: 'Да',
      nzOkDanger: true,
      nzOnOk: () => {
        this.storageService.delete(appNumber);
        this.notification.info('Удалено', `Заявка ${appNumber} удалена`);
        this.loadApplications();
      },
      nzCancelText: 'Нет'
    });
  }
  exportToJson(): void {
    if (isPlatformBrowser(this.platformId)) {
      const data = JSON.stringify(this.storageService.getAll(), null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `applications_${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  }

  onEdit(app: Application): void {
    console.log('Edit application', app);
  }
  applications: Application[] = [];
  size: NzButtonSize = 'large';
  isAddingNew = false;
  constructor(
    private storageService: ApplicationStorageService,
    private modal: NzModalService,
    private notification: NzNotificationService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {

    this.applications = [];
    this.filteredApplications = [];
    this.sortedApplications = [];
    this.displayApplications = []; // Explicit initialization
  }
  isLoading = false;
  loadApplications(): void {
    this.isLoading = true;
    try {
      const apps = this.storageService.getAll();

      // Filter invalid data
      this.applications = (apps || []).filter(app =>
        app && app.Application && app.Application.ApplicationNumber
      );

      // this.filteredApplications = [...this.applications];
      // this.sortedApplications = [...this.filteredApplications];
      // this.applySorting(); // Ensure sorting is applied before paginating
      // this.updateDisplayApplications();
      this.applyFilter(); // handles filter, sorting, and updates displayApplications


      if (this.applications.length === 0) {
        this.notification.info('Информация', 'Нет сохраненных заявок');
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      this.notification.error('Ошибка', 'Не удалось загрузить заявки');
      this.applications = [];
      this.filteredApplications = [];
      this.sortedApplications = [];
      this.displayApplications = [];
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges(); // Optional here — you're already calling it in updateDisplayApplications
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Проверяем, есть ли данные в localStorage
      const storedData = this.storageService.getAll();

      if (storedData.length === 0) {
        // Загружаем данные из JSON-файла
        this.http.get<Application[]>('assets/applications.json').subscribe({
          next: (data) => {
            // Сохраняем данные в localStorage
            // localStorage.setItem('applications', JSON.stringify(data));
            this.storageService.setAll(data);
            // Загружаем данные в компонент
            this.loadApplications();
          },
          error: (err) => {
            console.error('Failed to load applications', err);
            this.notification.error('Ошибка', 'Не удалось загрузить данные');
            this.loadApplications(); // Загружаем пустой список
          }
        });
      } else {
        // Загружаем данные из localStorage
        this.loadApplications();
      }
    } else {
      this.applications = [];
      this.filteredApplications = [];
      this.sortedApplications = [];
      this.displayApplications = [];
      this.updateDisplayApplications();
    }
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
  // selectedApplication: Application | null = null;

  openDrawer(app: Application): void {
    this.isAddingNew = false;
    this.selectedApplication = JSON.parse(JSON.stringify(app));
    this.isDrawerVisible = true;
  }

  openDrawer2(app: Application): void {
    this.isAddingNew = false;
    this.selectedApplication = app;
    this.isDrawerVisible2 = true;
  }


  closeDrawer(): void {
    this.isDrawerVisible = false;
    this.isDrawerVisible2 = false;

    this.selectedApplication = null;
    // this.isAddingNew = false;
  }

  saveChanges(): void {
    if (!this.selectedApplication) return;

    // Обработка пустого InitialApplicationAmount
    const amount = this.selectedApplication.Application.InitialApplicationAmount ??= { Amount: 0, CurrencyType: '' };
    if (amount && (!amount.Amount && !amount.CurrencyType)) {
      this.selectedApplication.Application.InitialApplicationAmount = null;
    }

    if (this.isAddingNew) {
      this.storageService.add(this.selectedApplication);
      this.notification.success('Успешно', 'Заявка добавлена');
    } else {
      this.storageService.update(this.selectedApplication);
      this.notification.success('Успешно', 'Заявка обновлена');
    }

    this.closeDrawer();
    this.loadApplications();
    this.notification.success('Успешно', 'Заявка сохранена');
  }

  confirmDelete(): void {
    if (!this.selectedApplication) return;
    this.onDelete(this.selectedApplication);
  }

}

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

interface Application{
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
    FormsModule, NzButtonModule, NzIconModule, NzRadioModule,NzCollapseModule, NzModalModule, NgIf, NgFor,
    NzDrawerModule,
  ],
  templateUrl: './application-table.component.html',
  styleUrl: './application-table.component.css'
})
export class ApplicationTableComponent implements OnInit {

  

  onDelete(app: Application): void {
    this.modal.confirm({
      nzTitle: '',
      nzContent: '',
      nzOkText: 'Yes',
      nzOkDanger: true,
      nzOnOk: ()=> {
        this.applications = this.applications.filter(a => a.Application.ApplicationNumber !== app.Application.ApplicationNumber);
      },
      nzCancelText: 'No'
    });
  }

  onEdit(app: Application): void {
    console.log('Edit application', app);
  }
  applications: Application[]=[];
  size: NzButtonSize = 'large';

  constructor (private http: HttpClient, private modal: NzModalService){}
  ngOnInit(): void {
      this.http.get<Application[]>('assets/applications.json').subscribe({
        next: (data) => {
          this.applications = data;
        },
        error: (err) => console.error('Failed to load', err)
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


  toggle(event: any){
    if (this.animating){
      return;
    }
    this.animating = true;

    if(this.collapsed){
      this.collapsed = false;
    }
    else{
      this.collapsed = true;
    }

    event.preventDefault();
  }

  onToggleDone(){
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

  // onEdit(app: any): void {
  //   console.log('Edit clicked for:', app);
  //   // Implement your edit logic (open form, navigate, etc.)
  // }

  // Optional: Save or delete handlers for drawer content
  saveChanges(): void {
    console.log('Save clicked for:', this.selectedApplication);
    // Implement your save logic here
  }

  // onDelete(app: any): void {
  // this.modal.confirm({
  //   nzTitle: 'Are you sure you want to delete this application?',
  //   nzContent: `Application Number: ${app.Application.ApplicationNumber}`,
  //   nzOkText: 'Yes',
  //   nzOkDanger: true,
  //   nzOnOk: () => {
  //     this.applications = this.applications.filter(
  //       a => a.Application.ApplicationNumber !== app.Application.ApplicationNumber
  //     );
  //   },
  //   nzCancelText: 'No'
  // });
  // }
confirmDelete(): void {
  if (!this.selectedApplication) return;

  this.modal.confirm({
    nzTitle: 'Delete this application?',
    nzContent: `Are you sure you want to delete Application #${this.selectedApplication.Application.ApplicationNumber}?`,
    nzOkText: 'Yes',
    nzOkDanger: true,
    nzOnOk: () => {
      this.applications = this.applications.filter(
        a => a.Application.ApplicationNumber !== this.selectedApplication.Application.ApplicationNumber
      );
      this.closeDrawer();
    },
    nzCancelText: 'No'
  });
}

}

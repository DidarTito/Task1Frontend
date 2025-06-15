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
    FormsModule, NzButtonModule, NzIconModule, NzRadioModule,
  ],
  templateUrl: './application-table.component.html',
  styleUrl: './application-table.component.css'
})
export class ApplicationTableComponent implements OnInit {
  applications: Application[]=[];
  size: NzButtonSize = 'large';


  // ngOnInit(): void {
  //     const data = localStorage.getItem('applications');
  //     this.applications = data ? JSON.parse(data) : [];
  // }
  constructor (private http: HttpClient){}
  ngOnInit(): void {
      this.http.get<Application[]>('assets/applications.json').subscribe({
        next: (data) => {
          this.applications = data;
        },
        error: (err) => console.error('Failed to load', err)
      });
  }


}

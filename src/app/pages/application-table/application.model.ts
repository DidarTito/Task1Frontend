export interface Application {
  Application: {
    ApplicationNumber: string;
    ApplicationStatus: string;
    SentToOfficialsDateTime: string;
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

    ApplicationOfficialOrgInfo?: {
      Bin: string;
      NameRu: string;
      NameKz: string;
    };
    ApplicationOperatorOrgInfo?: {
      Bin: string;
      NameRu: string;
      NameKz: string;
    };
    ApplicationAddress?: {
      OblArId: string;
      RegionArId: string;
    };
    Payments?: {
      PaymentDate: string;
      PaymentAmount: number;
      PaymentCurrencyType: string;
      BudgetProgram: {
        BudgetType: string;
        BudgetProgramCode: string;
        BudgetSubProgramCode: string;
        Specific: string;
      };
    }[];

    ApplicationCancelled?: {
      CancelDateTime: string;
      Note: string;
      DecisionMakerIin: string;
    };
    ApplicationAccepted?: {
      AcceptDateTime: string;
      DecisionMakerIin: string;
    };
    ApplicationRejected?: {
      RejectDateTime: string;
      RejectReasonType: string;
      DecisionMakerIin: string;
    };
    ApplicationPaid?: {
      FullPaidDateTime: string;
      FullPaidAmountInTg: number;
    };
    ApplicationUrl?: {
      Url: string;
    };
  };
}
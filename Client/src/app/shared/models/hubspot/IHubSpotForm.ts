interface IFormFieldGroup {
  fields: [
    {
      name: string;
      label: string;
      type: string;
      fieldType: string;
      description: string;
      groupName: string;
      displayOrder: number;
      required: boolean;
      selectedOptions: any[];
      options: any[];
      validation: {
        name: string;
        message: string;
        data: string;
        useDefaultBlockList: boolean;
        blockedEmailAddresses: any[];
      };
      enabled: boolean;
      hidden: boolean;
      defaultValue: string;
      isSmartField: boolean;
      unselectedLabel: string;
      placeholder: string;
      dependentFieldFilters: any[];
      labelHidden: boolean;
      propertyObjectType: string;
      metaData: any[];
      objectTypeId: string;
    }
  ];
  default: true;
  isSmartGroup: false;
  richText: { content: string; type: string };
  isPageBreak: false;
}

export interface IHubSpotForm {
  portalId: number;
  guid: string;
  name: string;
  submitText: string;
  formFieldGroups: IFormFieldGroup[];
  createdAt: Date;
  updatedAt: Date;
  inlineMessage: string;
  style: string;
}

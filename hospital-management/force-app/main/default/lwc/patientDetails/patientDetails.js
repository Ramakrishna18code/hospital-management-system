import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

// Import Patient__c object fields
import NAME_FIELD from '@salesforce/schema/Patient__c.Name';
import DOB_FIELD from '@salesforce/schema/Patient__c.DateOfBirth__c';
import GENDER_FIELD from '@salesforce/schema/Patient__c.Gender__c';
import EMAIL_FIELD from '@salesforce/schema/Patient__c.Email__c';
import PHONE_FIELD from '@salesforce/schema/Patient__c.Phone__c';
import MEDICAL_HISTORY_FIELD from '@salesforce/schema/Patient__c.MedicalHistory__c';

const FIELDS = [
    NAME_FIELD,
    DOB_FIELD,
    GENDER_FIELD,
    EMAIL_FIELD,
    PHONE_FIELD,
    MEDICAL_HISTORY_FIELD
];

export default class PatientDetails extends LightningElement {
    @api recordId;
    
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    patient;

    get name() {
        return getFieldValue(this.patient.data, NAME_FIELD);
    }

    get dateOfBirth() {
        return getFieldValue(this.patient.data, DOB_FIELD);
    }

    get gender() {
        return getFieldValue(this.patient.data, GENDER_FIELD);
    }

    get email() {
        return getFieldValue(this.patient.data, EMAIL_FIELD);
    }

    get phone() {
        return getFieldValue(this.patient.data, PHONE_FIELD);
    }

    get medicalHistory() {
        return getFieldValue(this.patient.data, MEDICAL_HISTORY_FIELD);
    }

    handleEdit() {
        // Navigate to edit form or show modal
    }
}
import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getDoctorAppointments from '@salesforce/apex/HospitalUtility.getDoctorAppointments';

export default class AppointmentScheduler extends LightningElement {
    @track selectedDate;
    @track selectedDoctor;
    @track appointments = [];
    @track isLoading = false;

    @wire(getDoctorAppointments, { 
        doctorId: '$selectedDoctor',
        appointmentDate: '$selectedDate'
    })
    wiredAppointments({ error, data }) {
        this.isLoading = true;
        if (data) {
            this.appointments = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.appointments = [];
            this.showToast('Error', 'Error loading appointments', 'error');
        }
        this.isLoading = false;
    }

    handleDoctorChange(event) {
        this.selectedDoctor = event.detail.value;
    }

    handleDateChange(event) {
        this.selectedDate = event.target.value;
    }

    handleScheduleAppointment() {
        // Handle appointment scheduling
        this.isLoading = true;
        // Add appointment creation logic here
        this.isLoading = false;
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}
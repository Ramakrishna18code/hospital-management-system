import { createElement } from 'lwc';
import AppointmentScheduler from 'c/appointmentScheduler';
import PatientDetails from 'c/patientDetails';

// Create the main container
const app = document.querySelector('#main');
const appointmentElement = createElement('c-appointment-scheduler', { is: AppointmentScheduler });
const patientElement = createElement('c-patient-details', { is: PatientDetails });

// Add components to the page
app.appendChild(appointmentElement);
app.appendChild(patientElement);
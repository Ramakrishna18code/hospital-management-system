public class AppointmentHandler {
    public class AppointmentException extends Exception {}
    
    public static void validateAppointment(List<Appointment__c> appointments) {
        for(Appointment__c apt : appointments) {
            if(apt.AppointmentDateTime__c < System.now()) {
                apt.addError('Appointment cannot be scheduled in the past');
            }
            
            if(!HospitalUtility.isSlotAvailable(apt.AppointmentDateTime__c, apt.Doctor__c)) {
                apt.addError('Selected time slot is not available');
            }
        }
    }
    
    public static void processAppointmentStatus(List<Appointment__c> appointments, 
                                              Map<Id, Appointment__c> oldAppointments) {
        for(Appointment__c apt : appointments) {
            Appointment__c oldApt = oldAppointments.get(apt.Id);
            if(oldApt != null && oldApt.Status__c != apt.Status__c) {
                if(apt.Status__c == HospitalUtility.APPOINTMENT_STATUS_COMPLETED) {
                    // Create follow-up tasks or notifications
                    createFollowUpTask(apt);
                } else if(apt.Status__c == HospitalUtility.APPOINTMENT_STATUS_CANCELLED) {
                    // Handle cancellation notifications
                    handleCancellation(apt);
                }
            }
        }
    }
    
    private static void createFollowUpTask(Appointment__c apt) {
        Task followUp = new Task(
            WhatId = apt.Id,
            Subject = 'Follow-up for appointment ' + apt.Name,
            ActivityDate = Date.today().addDays(7),
            Status = 'Not Started',
            Priority = 'Normal'
        );
        insert followUp;
    }
    
    private static void handleCancellation(Appointment__c apt) {
        // Send cancellation notification
        Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
        String[] toAddresses = new String[] {apt.Patient__r.Email__c};
        email.setToAddresses(toAddresses);
        email.setSubject('Appointment Cancelled - ' + apt.Name);
        
        String emailBody = 'Dear ' + apt.Patient__r.Name + ',\n\n';
        emailBody += 'Your appointment scheduled for ' + 
            apt.AppointmentDateTime__c.format() + ' has been cancelled.\n';
        emailBody += 'Please contact the hospital to reschedule.\n\n';
        emailBody += 'Thank you for your understanding.\n';
        
        email.setPlainTextBody(emailBody);
        
        if(!Test.isRunningTest()) {
            Messaging.sendEmail(new Messaging.SingleEmailMessage[] {email});
        }
    }
}
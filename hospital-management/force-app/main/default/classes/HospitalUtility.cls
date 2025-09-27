public class HospitalUtility {
    public static final String APPOINTMENT_STATUS_SCHEDULED = 'Scheduled';
    public static final String APPOINTMENT_STATUS_IN_PROGRESS = 'In Progress';
    public static final String APPOINTMENT_STATUS_COMPLETED = 'Completed';
    public static final String APPOINTMENT_STATUS_CANCELLED = 'Cancelled';
    
    // Check if appointment slot is available
    public static Boolean isSlotAvailable(DateTime appointmentDateTime, Id doctorId) {
        Integer conflictingAppointments = [
            SELECT COUNT() 
            FROM Appointment__c 
            WHERE Doctor__c = :doctorId 
            AND AppointmentDateTime__c = :appointmentDateTime 
            AND Status__c != :APPOINTMENT_STATUS_CANCELLED
        ];
        return conflictingAppointments == 0;
    }
    
    // Get doctor's appointments for a specific day
    public static List<Appointment__c> getDoctorAppointments(Id doctorId, Date appointmentDate) {
        DateTime startOfDay = DateTime.newInstance(
            appointmentDate.year(), 
            appointmentDate.month(), 
            appointmentDate.day(), 
            0, 0, 0
        );
        DateTime endOfDay = startOfDay.addDays(1);
        
        return [
            SELECT Id, Name, Patient__r.Name, AppointmentDateTime__c, Status__c
            FROM Appointment__c
            WHERE Doctor__c = :doctorId
            AND AppointmentDateTime__c >= :startOfDay
            AND AppointmentDateTime__c < :endOfDay
            ORDER BY AppointmentDateTime__c ASC
        ];
    }
    
    // Send appointment confirmation email
    public static void sendAppointmentConfirmation(Appointment__c appointment) {
        Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
        String[] toAddresses = new String[] {appointment.Patient__r.Email__c};
        email.setToAddresses(toAddresses);
        email.setSubject('Appointment Confirmation - ' + appointment.Name);
        
        String emailBody = 'Dear ' + appointment.Patient__r.Name + ',\n\n';
        emailBody += 'Your appointment has been scheduled for ' + 
            appointment.AppointmentDateTime__c.format() + '\n';
        emailBody += 'Doctor: ' + appointment.Doctor__r.Name + '\n';
        emailBody += 'Appointment Number: ' + appointment.Name + '\n\n';
        emailBody += 'Thank you for choosing our hospital.\n';
        
        email.setPlainTextBody(emailBody);
        
        if(!Test.isRunningTest()) {
            Messaging.sendEmail(new Messaging.SingleEmailMessage[] {email});
        }
    }
}
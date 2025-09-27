trigger AppointmentTrigger on Appointment__c (before insert, before update, after insert, after update) {
    if(Trigger.isBefore) {
        if(Trigger.isInsert) {
            AppointmentHandler.validateAppointment(Trigger.new);
        }
        if(Trigger.isUpdate) {
            AppointmentHandler.validateAppointment(Trigger.new);
        }
    }
    
    if(Trigger.isAfter) {
        if(Trigger.isInsert) {
            for(Appointment__c apt : Trigger.new) {
                if(apt.Status__c == HospitalUtility.APPOINTMENT_STATUS_SCHEDULED) {
                    HospitalUtility.sendAppointmentConfirmation(apt);
                }
            }
        }
        if(Trigger.isUpdate) {
            AppointmentHandler.processAppointmentStatus(Trigger.new, Trigger.oldMap);
        }
    }
}
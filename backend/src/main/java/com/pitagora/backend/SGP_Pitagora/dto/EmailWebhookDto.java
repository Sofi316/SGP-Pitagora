package com.pitagora.backend.SGP_Pitagora.dto;

public class EmailWebhookDto {
    private String sender;
    private String subject;
    private String bodyPlain;

    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getBodyPlain() { return bodyPlain; }
    public void setBodyPlain(String bodyPlain) { this.bodyPlain = bodyPlain; }
}

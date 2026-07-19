package com.manjau.socialmedia.dashboard.dto;

import java.time.Instant;

public class RecentActivityResponse {
    private String actorName;
    private String actorInitials;
    private String action;
    private String description;
    private Instant occurredAt;

    public String getActorName() { return actorName; }
    public void setActorName(String actorName) { this.actorName = actorName; }
    public String getActorInitials() { return actorInitials; }
    public void setActorInitials(String actorInitials) { this.actorInitials = actorInitials; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Instant getOccurredAt() { return occurredAt; }
    public void setOccurredAt(Instant occurredAt) { this.occurredAt = occurredAt; }
}

package com.manjau.socialmedia.dashboard.dto;

import java.util.List;

public class DashboardSummaryResponse {
    private long activeUsers;
    private long connectedSocialNetworks;
    private long publicationsThisMonth;
    private long activitiesToday;
    private List<UsersByRole> usersByRole;
    private List<PlatformInfo> platforms;
    private String periodLabel;

    public long getActiveUsers() { return activeUsers; }
    public void setActiveUsers(long activeUsers) { this.activeUsers = activeUsers; }
    public long getConnectedSocialNetworks() { return connectedSocialNetworks; }
    public void setConnectedSocialNetworks(long connectedSocialNetworks) { this.connectedSocialNetworks = connectedSocialNetworks; }
    public long getPublicationsThisMonth() { return publicationsThisMonth; }
    public void setPublicationsThisMonth(long publicationsThisMonth) { this.publicationsThisMonth = publicationsThisMonth; }
    public long getActivitiesToday() { return activitiesToday; }
    public void setActivitiesToday(long activitiesToday) { this.activitiesToday = activitiesToday; }
    public List<UsersByRole> getUsersByRole() { return usersByRole; }
    public void setUsersByRole(List<UsersByRole> usersByRole) { this.usersByRole = usersByRole; }
    public List<PlatformInfo> getPlatforms() { return platforms; }
    public void setPlatforms(List<PlatformInfo> platforms) { this.platforms = platforms; }
    public String getPeriodLabel() { return periodLabel; }
    public void setPeriodLabel(String periodLabel) { this.periodLabel = periodLabel; }

    public static class UsersByRole {
        private String role;
        private String label;
        private long count;

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    public static class PlatformInfo {
        private String name;
        private boolean active;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }
    }
}

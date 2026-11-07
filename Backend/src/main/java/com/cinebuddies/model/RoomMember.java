package com.cinebuddies.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "room_members", uniqueConstraints = {
    @UniqueConstraint(name = "uq_room_member", columnNames = {"room_code", "user_id"})
})
public class RoomMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_code", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    @Column(name = "is_host", nullable = false)
    private boolean isHost = false;

    @Column(name = "has_joined", nullable = false)
    private boolean hasJoined = true;

    @Column(name = "preferences_submitted", nullable = false)
    private boolean preferencesSubmitted = false;

    @Column(name = "joined_at", updatable = false)
    private Instant joinedAt = Instant.now();

    public RoomMember() {
    }

    public RoomMember(Room room, String displayName, boolean isHost, boolean hasJoined) {
        this.room = room;
        this.displayName = displayName;
        this.isHost = isHost;
        this.hasJoined = hasJoined;
        this.preferencesSubmitted = false;
        this.joinedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Room getRoom() {
        return room;
    }

    public void setRoom(Room room) {
        this.room = room;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public boolean isHost() {
        return isHost;
    }

    public void setHost(boolean host) {
        isHost = host;
    }

    public boolean isHasJoined() {
        return hasJoined;
    }

    public void setHasJoined(boolean hasJoined) {
        this.hasJoined = hasJoined;
    }

    public boolean isPreferencesSubmitted() {
        return preferencesSubmitted;
    }

    public void setPreferencesSubmitted(boolean preferencesSubmitted) {
        this.preferencesSubmitted = preferencesSubmitted;
    }

    public Instant getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(Instant joinedAt) {
        this.joinedAt = joinedAt;
    }
}


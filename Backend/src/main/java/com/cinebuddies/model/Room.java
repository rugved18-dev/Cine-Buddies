package com.cinebuddies.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @Column(name = "code", length = 10, nullable = false)
    private String code;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "is_finalized", nullable = false)
    private boolean isFinalized = false;

    @Column(name = "winner_movie_id")
    private String winnerMovieId;

    @ElementCollection(targetClass = ContentType.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "room_content_types", joinColumns = @JoinColumn(name = "room_code"))
    @Column(name = "content_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private List<ContentType> contentTypes = new ArrayList<>();

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<RoomMember> members = new ArrayList<>();

    public Room() {
    }

    public Room(String code, String name, List<ContentType> contentTypes) {
        this.code = code;
        this.name = name;
        if (contentTypes != null) {
            this.contentTypes = new ArrayList<>(contentTypes);
        }
        this.createdAt = Instant.now();
        this.isFinalized = false;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isFinalized() {
        return isFinalized;
    }

    public void setFinalized(boolean finalized) {
        isFinalized = finalized;
    }

    public String getWinnerMovieId() {
        return winnerMovieId;
    }

    public void setWinnerMovieId(String winnerMovieId) {
        this.winnerMovieId = winnerMovieId;
    }

    public List<ContentType> getContentTypes() {
        return contentTypes;
    }

    public void setContentTypes(List<ContentType> contentTypes) {
        this.contentTypes = contentTypes != null ? contentTypes : new ArrayList<>();
    }

    public List<RoomMember> getMembers() {
        return members;
    }

    public void setMembers(List<RoomMember> members) {
        this.members = members != null ? members : new ArrayList<>();
    }

    public void addMember(RoomMember member) {
        this.members.add(member);
        member.setRoom(this);
    }
}


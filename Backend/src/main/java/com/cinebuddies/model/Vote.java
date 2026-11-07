package com.cinebuddies.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "votes", uniqueConstraints = {
    @UniqueConstraint(name = "uq_member_movie_vote", columnNames = {"room_code", "movie_id", "room_member_id"})
})
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_code", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_member_id", nullable = false)
    private RoomMember roomMember;

    @Enumerated(EnumType.STRING)
    @Column(name = "choice", nullable = false)
    private VoteChoice choice;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public Vote() {
    }

    public Vote(Room room, Movie movie, RoomMember roomMember, VoteChoice choice) {
        this.room = room;
        this.movie = movie;
        this.roomMember = roomMember;
        this.choice = choice;
        this.createdAt = Instant.now();
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

    public Movie getMovie() {
        return movie;
    }

    public void setMovie(Movie movie) {
        this.movie = movie;
    }

    public RoomMember getRoomMember() {
        return roomMember;
    }

    public void setRoomMember(RoomMember roomMember) {
        this.roomMember = roomMember;
    }

    public VoteChoice getChoice() {
        return choice;
    }

    public void setChoice(VoteChoice choice) {
        this.choice = choice;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}


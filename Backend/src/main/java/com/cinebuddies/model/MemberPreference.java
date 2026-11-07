package com.cinebuddies.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "member_preferences")
public class MemberPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_member_id", unique = true, nullable = false)
    private RoomMember roomMember;

    @Column(name = "min_rating", precision = 3, scale = 1)
    private BigDecimal minRating = BigDecimal.valueOf(0.0);

    @Enumerated(EnumType.STRING)
    @Column(name = "release_period")
    private ReleasePeriod releasePeriod = ReleasePeriod.ANY_YEAR;

    @ElementCollection
    @CollectionTable(name = "preference_genres", joinColumns = @JoinColumn(name = "preference_id"))
    @Column(name = "genre", nullable = false, length = 50)
    private List<String> genres = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "preference_excluded_genres", joinColumns = @JoinColumn(name = "preference_id"))
    @Column(name = "genre", nullable = false, length = 50)
    private List<String> excludedGenres = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "preference_languages", joinColumns = @JoinColumn(name = "preference_id"))
    @Column(name = "language", nullable = false, length = 50)
    private List<String> languages = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "preference_watched_titles", joinColumns = @JoinColumn(name = "preference_id"))
    @Column(name = "title", nullable = false, length = 255)
    private List<String> watchedTitles = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public MemberPreference() {
    }

    public MemberPreference(RoomMember roomMember) {
        this.roomMember = roomMember;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public RoomMember getRoomMember() {
        return roomMember;
    }

    public void setRoomMember(RoomMember roomMember) {
        this.roomMember = roomMember;
    }

    public BigDecimal getMinRating() {
        return minRating;
    }

    public void setMinRating(BigDecimal minRating) {
        this.minRating = minRating;
    }

    public ReleasePeriod getReleasePeriod() {
        return releasePeriod;
    }

    public void setReleasePeriod(ReleasePeriod releasePeriod) {
        this.releasePeriod = releasePeriod;
    }

    public List<String> getGenres() {
        return genres;
    }

    public void setGenres(List<String> genres) {
        this.genres = genres;
    }

    public List<String> getExcludedGenres() {
        return excludedGenres;
    }

    public void setExcludedGenres(List<String> excludedGenres) {
        this.excludedGenres = excludedGenres;
    }

    public List<String> getLanguages() {
        return languages;
    }

    public void setLanguages(List<String> languages) {
        this.languages = languages;
    }

    public List<String> getWatchedTitles() {
        return watchedTitles;
    }

    public void setWatchedTitles(List<String> watchedTitles) {
        this.watchedTitles = watchedTitles;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}


package com.cinebuddies.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "movies")
public class Movie {

    @Id
    @Column(name = "id", length = 100, nullable = false)
    private String id;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "release_year", nullable = false)
    private int releaseYear;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private ContentType type = ContentType.MOVIES;

    @Column(name = "language", nullable = false, length = 50)
    private String language = "English";

    @Column(name = "rating", nullable = false, precision = 3, scale = 1)
    private BigDecimal rating = BigDecimal.ZERO;

    @Column(name = "runtime", nullable = false, length = 50)
    private String runtime = "N/A";

    @Column(name = "overview", nullable = false, columnDefinition = "TEXT")
    private String overview = "";

    @Column(name = "poster_path", length = 255)
    private String posterPath;

    @Column(name = "featured")
    private boolean featured = false;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public Movie() {
    }

    public Movie(String id, String title, int releaseYear, String language) {
        this.id = id;
        this.title = title != null ? title : "Untitled";
        this.releaseYear = releaseYear;
        this.language = language != null ? language : "English";
        this.type = ContentType.MOVIES;
        this.rating = BigDecimal.ZERO;
        this.runtime = "N/A";
        this.overview = "";
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public int getReleaseYear() {
        return releaseYear;
    }

    public void setReleaseYear(int releaseYear) {
        this.releaseYear = releaseYear;
    }

    public ContentType getType() {
        return type;
    }

    public void setType(ContentType type) {
        this.type = type;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public void setRating(BigDecimal rating) {
        this.rating = rating;
    }

    public String getRuntime() {
        return runtime;
    }

    public void setRuntime(String runtime) {
        this.runtime = runtime;
    }

    public String getOverview() {
        return overview;
    }

    public void setOverview(String overview) {
        this.overview = overview;
    }

    public String getPosterPath() {
        return posterPath;
    }

    public void setPosterPath(String posterPath) {
        this.posterPath = posterPath;
    }

    public boolean isFeatured() {
        return featured;
    }

    public void setFeatured(boolean featured) {
        this.featured = featured;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}


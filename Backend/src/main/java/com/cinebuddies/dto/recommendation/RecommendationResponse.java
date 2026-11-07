package com.cinebuddies.dto.recommendation;

public record RecommendationResponse(
    String movieId,
    String title,
    String overview,
    String posterPath,
    int releaseYear,
    double rating,
    String language,
    double groupMatchPercentage
) {}


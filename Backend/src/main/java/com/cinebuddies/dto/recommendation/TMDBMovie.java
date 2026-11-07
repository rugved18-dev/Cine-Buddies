package com.cinebuddies.dto.recommendation;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TMDBMovie(
    String id,
    String title,
    String overview,
    String poster_path,
    String release_date,
    double vote_average,
    List<Integer> genre_ids
) {}


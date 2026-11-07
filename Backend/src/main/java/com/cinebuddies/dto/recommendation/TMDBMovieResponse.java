package com.cinebuddies.dto.recommendation;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TMDBMovieResponse(
    List<TMDBMovie> results
) {}


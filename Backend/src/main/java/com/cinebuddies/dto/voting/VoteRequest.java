package com.cinebuddies.dto.voting;

import com.cinebuddies.model.VoteChoice;

public record VoteRequest(
    String movieId,
    String movieTitle,
    int releaseYear,
    String language,
    VoteChoice choice
) {}


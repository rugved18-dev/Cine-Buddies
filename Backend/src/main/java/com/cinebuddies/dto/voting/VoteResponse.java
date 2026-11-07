package com.cinebuddies.dto.voting;

import java.util.UUID;

public record VoteResponse(
    UUID id,
    String roomCode,
    String movieId,
    UUID memberId,
    String choice
) {}


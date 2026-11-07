package com.cinebuddies.dto;

import com.cinebuddies.model.ContentType;
import java.time.Instant;
import java.util.List;

public record RoomResponse(
    String code,
    String name,
    List<ContentType> contentTypes,
    Instant createdAt,
    boolean isFinalized,
    String winnerMovieId,
    List<RoomMemberResponse> members
) {}

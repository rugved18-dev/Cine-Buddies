package com.cinebuddies.dto;

import java.util.UUID;

public record RoomMemberResponse(
    UUID id,
    String name,
    boolean isHost,
    boolean joined,
    boolean preferencesSubmitted
) {}


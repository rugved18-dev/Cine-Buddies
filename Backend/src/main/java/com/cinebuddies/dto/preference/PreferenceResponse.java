package com.cinebuddies.dto.preference;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PreferenceResponse(
    UUID id,
    UUID roomMemberId,
    List<String> genres,
    List<String> excludedGenres,
    List<String> languages,
    List<String> watchedTitles,
    BigDecimal minRating,
    String releasePeriod,
    Instant updatedAt
) {}

